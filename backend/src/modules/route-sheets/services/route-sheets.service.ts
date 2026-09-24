import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { RouteSheet } from '../entities/route-sheet.entity';

import { RouteSheetDetail } from '../entities/route-sheet-detail.entity';

import { RouteSheetStatus } from '../entities/route-sheet-status.enum';

import { CreateRouteSheetDto } from '../dto/create-route-sheet.dto';

import { RemissionGuide } from '../../remission-guides/entities/remission-guide.entity';

import { RemissionGuideDetail } from '../../remission-guides/entities/remission-guide-detail.entity';

import { RemissionGuideStatus } from '../../remission-guides/entities/remission-guide-status.enum';

import { RemissionGuideType } from '../../remission-guides/entities/remission-guide-type.enum';

import { Request } from '../../requests/entities/request.entity';

import { RequestStatus } from '../../requests/entities/request-status.enum';

import { User } from '../../users/entities/user.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

@Injectable()
export class RouteSheetsService {
  constructor(
    @InjectRepository(RouteSheet)
    private readonly routeSheetRepository: Repository<RouteSheet>,

    @InjectRepository(RouteSheetDetail)
    private readonly routeSheetDetailRepository: Repository<RouteSheetDetail>,

    @InjectRepository(RemissionGuide)
    private readonly remissionGuideRepository: Repository<RemissionGuide>,

    @InjectRepository(RemissionGuideDetail)
    private readonly remissionGuideDetailRepository: Repository<RemissionGuideDetail>,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // USUARIO
  // ============================================================

  private async getAuthenticatedUser(
    userId: number,

    manager?: EntityManager,
  ): Promise<User> {
    const repository = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const user = await repository.findOne({
      where: {
        id: userId,
      },

      relations: {
        role: true,

        warehouse: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new BadRequestException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  // ============================================================
  // LOGÍSTICA CENTRAL
  // ============================================================

  private isCentralLogistics(user: User): boolean {
    if (user.role.code !== 'LOGISTICS' || !user.warehouse) {
      return false;
    }

    const type = String(user.warehouse.type ?? '').toUpperCase();

    return type === 'MAIN' || type === 'CENTRAL';
  }

  // ============================================================
  // ADMIN / LIMA
  // ============================================================

  private hasGlobalAccess(user: User): boolean {
    return user.role.code === 'ADMIN' || this.isCentralLogistics(user);
  }

  // ============================================================
  // GENERAR NÚMERO
  // ============================================================

  // ============================================================
  // GENERAR NÚMERO DE HOJA DE RECORRIDO
  // ============================================================

  private async generateRouteSheetNumber(
    manager: EntityManager,
    warehouse: Warehouse,
  ): Promise<string> {
    const configuredSeries = warehouse.guideSeries?.trim();

    if (!configuredSeries) {
      throw new BadRequestException(
        `El almacén "${warehouse.name}" no tiene una serie configurada para la numeración de documentos.`,
      );
    }

    const series = configuredSeries.padStart(3, '0');

    if (!/^\d{3}$/.test(series)) {
      throw new BadRequestException(
        `La serie "${configuredSeries}" del almacén "${warehouse.name}" no es válida.`,
      );
    }

    const prefix = `HR-${series}-`;

    const lastRouteSheet = await manager
      .getRepository(RouteSheet)
      .createQueryBuilder('routeSheet')
      .where('routeSheet.route_sheet_number LIKE :prefix', {
        prefix: `${prefix}%`,
      })
      .orderBy('routeSheet.id', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (lastRouteSheet?.routeSheetNumber) {
      const parts = lastRouteSheet.routeSheetNumber.split('-');

      const lastCorrelativo = Number(parts[2]);

      if (Number.isFinite(lastCorrelativo)) {
        nextNumber = lastCorrelativo + 1;
      }
    }

    const correlativo = String(nextNumber).padStart(6, '0');

    return `${prefix}${correlativo}`;
  }

  // ============================================================
  // OBTENER GUÍA
  // ============================================================

  private async getGuide(
    id: number,

    manager: EntityManager,
  ): Promise<RemissionGuide> {
    const guide = await manager.findOne(RemissionGuide, {
      where: {
        id,
      },

      relations: {
        request: {
          warehouse: true,

          details: true,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        details: {
          product: true,

          requestDetail: true,
        },
      },
    });

    if (!guide) {
      throw new NotFoundException('Guía de remisión no encontrada.');
    }

    if (guide.status !== RemissionGuideStatus.ISSUED) {
      throw new BadRequestException(
        'Solo se puede registrar recepción de una guía emitida.',
      );
    }

    return guide;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    dto: CreateRouteSheetDto,

    userId: number,
  ): Promise<RouteSheet> {
    let createdId = 0;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      // ======================================================
      // USUARIO
      // ======================================================

      const user = await this.getAuthenticatedUser(userId, manager);

      // ======================================================
      // GUÍA
      // ======================================================

      const guide = await this.getGuide(dto.remissionGuideId, manager);

      // ======================================================
      // TIPO DE GUÍA / DESTINO
      //
      // EXTERNAL_SERVICE:
      // - es una guía documentaria hacia proveedor/taller.
      // - no tiene recepción en una mina.
      // - por lo tanto NO genera Hoja de Recorrido.
      //
      // REQUEST y MANUAL_WAREHOUSE:
      // - sí tienen almacén/mina de destino.
      // - sí pueden registrar recepción mediante Hoja de Recorrido.
      // ======================================================

      if (guide.guideType === RemissionGuideType.EXTERNAL_SERVICE) {
        throw new BadRequestException(
          'Las guías de servicio externo no generan Hoja de Recorrido.',
        );
      }

      const destinationWarehouse = guide.destinationWarehouse;

      if (!destinationWarehouse) {
        throw new BadRequestException(
          'La guía no tiene una unidad o mina de destino para registrar la recepción.',
        );
      }

      // ======================================================
      // PERMISO
      //
      // ADMIN:
      // puede registrar cualquiera.
      //
      // LOGISTICS MINA:
      // solo las destinadas a su propia mina.
      //
      // LOGISTICS LIMA:
      // puede visualizar, pero conceptualmente la recepción
      // debe registrarla la mina.
      // ======================================================

      if (user.role.code === 'LOGISTICS') {
        if (!user.warehouse) {
          throw new BadRequestException(
            'El usuario no tiene mina o almacén asignado.',
          );
        }

        if (this.isCentralLogistics(user)) {
          throw new ForbiddenException(
            'La conformidad debe ser registrada por la unidad minera de destino.',
          );
        }

        if (user.warehouse.id !== destinationWarehouse.id) {
          throw new ForbiddenException(
            'Solo puedes registrar la recepción de materiales destinados a tu unidad minera.',
          );
        }
      }

      // ======================================================
      // UNA HOJA POR GUÍA
      // ======================================================

      const existing = await manager.findOne(RouteSheet, {
        where: {
          remissionGuide: {
            id: guide.id,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `La guía ${guide.fullNumber} ya tiene una hoja de recorrido registrada.`,
        );
      }

      // ======================================================
      // DETALLES OBLIGATORIOS
      // ======================================================

      if (dto.details.length !== guide.details.length) {
        throw new BadRequestException(
          'Debe registrar la recepción de todos los productos incluidos en la guía.',
        );
      }

      const receivedIds = dto.details.map(
        (item) => item.remissionGuideDetailId,
      );

      if (new Set(receivedIds).size !== receivedIds.length) {
        throw new BadRequestException(
          'Existen productos repetidos en la hoja de recorrido.',
        );
      }

      // ======================================================
      // CONFORMIDAD GENERAL
      // ======================================================

      let hasNonConformity = false;

      for (const item of dto.details) {
        const guideDetail = guide.details.find(
          (detail) => detail.id === item.remissionGuideDetailId,
        );

        if (!guideDetail) {
          throw new BadRequestException(
            `El detalle ${item.remissionGuideDetailId} no pertenece a la guía ${guide.fullNumber}.`,
          );
        }

        const product = guideDetail.product;

        if (!product) {
          throw new BadRequestException(
            'Una guía destinada a mina debe contener únicamente productos registrados.',
          );
        }

        const sent = Number(guideDetail.quantity);

        const received = Number(item.receivedQuantity);

        if (!Number.isFinite(received) || received < 0) {
          throw new BadRequestException(
            `Cantidad recibida inválida para "${product.name}".`,
          );
        }

        if (received > sent) {
          throw new BadRequestException(
            `La cantidad recibida de "${product.name}" no puede superar lo enviado (${sent}).`,
          );
        }

        // ====================================================
        // SI LA CANTIDAD NO COINCIDE, NO PUEDE SER CONFORME
        // ====================================================

        if (received !== sent && item.isConforming) {
          throw new BadRequestException(
            `"${product.name}" tiene diferencia entre enviado (${sent}) y recibido (${received}); debe marcarse como NO CONFORME.`,
          );
        }

        if (
          !item.isConforming ||
          received !== sent ||
          item.installationConforming === false
        ) {
          hasNonConformity = true;
        }
      }

      // ======================================================
      // NO CONFORMIDAD REQUIERE DESCRIPCIÓN
      // ======================================================

      if (hasNonConformity && !dto.incidentDescription?.trim()) {
        throw new BadRequestException(
          'Debe describir brevemente el incidente cuando exista alguna no conformidad.',
        );
      }

      // ======================================================
      // CABECERA
      // ======================================================

      const routeSheet = manager.create(RouteSheet, {
        routeSheetNumber: await this.generateRouteSheetNumber(
          manager,
          destinationWarehouse,
        ),
        remissionGuide: guide,

        request: guide.request ?? null,

        warehouse: destinationWarehouse,

        shippingDate: guide.transferStartDate,

        receptionDate: dto.receptionDate,

        responsibleName: dto.responsibleName.trim(),

        incidentDescription: dto.incidentDescription?.trim() || null,

        status: hasNonConformity
          ? RouteSheetStatus.WITH_OBSERVATIONS
          : RouteSheetStatus.CONFORMING,

        createdBy: user,
      });

      const saved = await manager.save(RouteSheet, routeSheet);

      createdId = saved.id;

      // ======================================================
      // DETALLES
      // ======================================================

      const details: RouteSheetDetail[] = [];

      for (const item of dto.details) {
        const guideDetail = guide.details.find(
          (detail) => detail.id === item.remissionGuideDetailId,
        );

        if (!guideDetail) {
          throw new BadRequestException('Detalle de guía no encontrado.');
        }

        const product = guideDetail.product;

        if (!product) {
          throw new BadRequestException(
            'Una guía destinada a mina debe contener únicamente productos registrados.',
          );
        }

        const detail = manager.create(RouteSheetDetail, {
          routeSheet: saved,

          remissionGuideDetail: guideDetail,

          product,

          sentQuantity: Number(guideDetail.quantity),

          receivedQuantity: Number(item.receivedQuantity),

          isConforming: item.isConforming,

          installationConforming: item.installationConforming ?? null,

          observation: item.observation?.trim() || null,
        });

        details.push(detail);
      }

      await manager.save(RouteSheetDetail, details);

      // ======================================================
      // ¿PODEMOS CERRAR EL REQUERIMIENTO?
      //
      // Solo cuando:
      // 1. ya está DELIVERED;
      // 2. todas sus guías tienen Hoja de Recorrido;
      // 3. todas están conformes.
      // ======================================================

      if (guide.request) {
        const request = await manager.findOne(Request, {
          where: {
            id: guide.request.id,
          },

          relations: {
            warehouse: true,
          },
        });

        if (request && request.status === RequestStatus.DELIVERED) {
          const requestGuides = await manager.find(RemissionGuide, {
            where: {
              request: {
                id: request.id,
              },

              status: RemissionGuideStatus.ISSUED,
            },
          });

          const requestRouteSheets = await manager.find(RouteSheet, {
            where: {
              request: {
                id: request.id,
              },
            },
          });

          // La hoja que acabamos de crear todavía puede no
          // estar reflejada en algunos contextos de consulta,
          // por eso usamos los IDs incluyendo saved.

          const sheetIds = new Set([
            ...requestRouteSheets.map((sheet) => sheet.id),

            saved.id,
          ]);

          const allGuidesConfirmed = requestGuides.length === sheetIds.size;

          const allConforming = hasNonConformity
            ? false
            : requestRouteSheets
                .filter((sheet) => sheet.id !== saved.id)
                .every((sheet) => sheet.status === RouteSheetStatus.CONFORMING);

          if (allGuidesConfirmed && allConforming) {
            request.status = RequestStatus.COMPLETED;

            await manager.save(Request, request);
          }
        }
      }
    });

    return this.findOne(createdId, userId);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(userId: number): Promise<RouteSheet[]> {
    const user = await this.getAuthenticatedUser(userId);

    const query = this.routeSheetRepository
      .createQueryBuilder('routeSheet')

      .leftJoinAndSelect('routeSheet.remissionGuide', 'remissionGuide')

      .leftJoinAndSelect('routeSheet.request', 'request')

      .leftJoinAndSelect('routeSheet.warehouse', 'warehouse')

      .leftJoinAndSelect('routeSheet.createdBy', 'createdBy')

      .leftJoinAndSelect('createdBy.role', 'createdByRole')

      .leftJoinAndSelect('createdBy.warehouse', 'createdByWarehouse')

      .leftJoinAndSelect('routeSheet.details', 'details')

      .leftJoinAndSelect('details.product', 'product')

      .leftJoinAndSelect(
        'details.remissionGuideDetail',
        'remissionGuideDetail',
      );

    // ==========================================================
    // MINA
    // ==========================================================

    if (!this.hasGlobalAccess(user)) {
      if (!user.warehouse) {
        throw new BadRequestException(
          'El usuario no tiene mina o almacén asignado.',
        );
      }

      query.andWhere('warehouse.id = :warehouseId', {
        warehouseId: user.warehouse.id,
      });
    }

    query.orderBy('routeSheet.createdAt', 'DESC');

    return query.getMany();
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  async findOne(
    id: number,

    userId: number,
  ): Promise<RouteSheet> {
    const user = await this.getAuthenticatedUser(userId);

    const routeSheet = await this.routeSheetRepository.findOne({
      where: {
        id,
      },

      relations: {
        remissionGuide: {
          sourceWarehouse: true,

          destinationWarehouse: true,
        },

        request: {
          warehouse: true,
        },

        warehouse: true,

        createdBy: {
          role: true,

          warehouse: true,
        },

        details: {
          product: {
            category: true,
          },

          remissionGuideDetail: true,
        },
      },
    });

    if (!routeSheet) {
      throw new NotFoundException('Hoja de recorrido no encontrada.');
    }

    if (this.hasGlobalAccess(user)) {
      return routeSheet;
    }

    if (!user.warehouse || routeSheet.warehouse.id !== user.warehouse.id) {
      throw new NotFoundException('Hoja de recorrido no encontrada.');
    }

    return routeSheet;
  }
}
