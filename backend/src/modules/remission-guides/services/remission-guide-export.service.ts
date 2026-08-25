import { Injectable } from '@nestjs/common';

import PDFDocument from 'pdfkit';

import ExcelJS from 'exceljs';

import { existsSync } from 'fs';

import { extname, join } from 'path';

import { RemissionGuidesService } from './remission-guides.service';

import { SettingsService } from '../../settings/services/settings.services';

import { TransferReason } from '../entities/transfer-reason.enum';

@Injectable()
export class RemissionGuideExportService {
  constructor(
    private readonly remissionGuidesService: RemissionGuidesService,

    private readonly settingsService: SettingsService,
  ) {}

  // ============================================================
  // COLORES DEL FORMATO
  // ============================================================

  private readonly ORANGE = '#ED7D31';

  private readonly ORANGE_EXCEL = 'FFED7D31';

  private readonly BLUE_TEXT = '#1F4E79';

  private readonly BLUE_TEXT_EXCEL = 'FF1F4E79';

  private readonly BLACK = '#000000';

  private readonly GRAY = '#F2F2F2';

  // ============================================================
  // FECHA
  // ============================================================

  private formatDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    // Evita desfase de fecha por zona horaria
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');

      return `${day}/${month}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('es-PE');
  }

  // ============================================================
  // CANTIDADES
  // ============================================================

  private formatQuantity(value: string | number | null | undefined): string {
    const numeric = Number(value ?? 0);

    if (!Number.isFinite(numeric)) {
      return '';
    }

    if (Number.isInteger(numeric)) {
      return String(numeric);
    }

    return numeric.toFixed(2).replace(/\.00$/, '');
  }

  // ============================================================
  // MOTIVO TRASLADO
  // ============================================================

  private getTransferReasonLabel(reason: TransferReason): string {
    const labels: Record<TransferReason, string> = {
      [TransferReason.SALE]: 'Venta',

      [TransferReason.PURCHASE]: 'Compra',

      [TransferReason.CONSIGNMENT]: 'Consignación',

      [TransferReason.RETURN]: 'Devolución',

      [TransferReason.TRANSFORMATION]: 'Para transformación',

      [TransferReason.BETWEEN_ESTABLISHMENTS]:
        'Entre establecimientos de la misma empresa',

      [TransferReason.PICKUP]: 'Recojo de bienes',

      [TransferReason.ITINERANT_ISSUER]: 'Emisor itinerante',

      [TransferReason.PRIMARY_ZONE]: 'Zona primaria',

      [TransferReason.IMPORT]: 'Importación',

      [TransferReason.EXPORT]: 'Exportación',

      [TransferReason.OTHER]: 'Otros',
    };

    return labels[reason] ?? 'Otros';
  }

  // ============================================================
  // BUSCAR LOGO
  //
  // Coloca tu logo preferiblemente en:
  //
  // backend/public/logo-teincomin.png
  //
  // También intenta otras rutas por compatibilidad.
  // ============================================================

  private findLogoPath(): string | null {
    const candidates = [
      join(process.cwd(), 'public', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'teincomin-logo.png'),

      join(process.cwd(), 'uploads', 'logo-teincomin.png'),

      join(process.cwd(), 'src', 'assets', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'logo-teincomin.jpg'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  // ============================================================
  // PDF
  // ============================================================

  async generatePdf(
    id: number,

    userId: number,
  ): Promise<Buffer> {
    const guide = await this.remissionGuidesService.findOne(id, userId);

    const settings = await this.settingsService.getSettings();

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',

        margin: 0,

        bufferPages: true,

        info: {
          Title: `Guía de Remisión ${guide.fullNumber}`,

          Author: settings.companyName || 'TEINCOMIN',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', reject);

      // ======================================================
      // DIMENSIONES
      // ======================================================

      const PAGE_WIDTH = 595.28;

      const PAGE_HEIGHT = 841.89;

      const LEFT = 18;

      const RIGHT = PAGE_WIDTH - 18;

      const WIDTH = RIGHT - LEFT;

      // ======================================================
      // HELPERS
      // ======================================================

      const border = (
        x: number,

        y: number,

        width: number,

        height: number,

        lineWidth = 0.7,
      ) => {
        doc
          .save()
          .lineWidth(lineWidth)
          .strokeColor(this.BLACK)
          .rect(x, y, width, height)
          .stroke()
          .restore();
      };

      const fillRect = (
        x: number,

        y: number,

        width: number,

        height: number,

        color: string,
      ) => {
        doc.save().rect(x, y, width, height).fill(color).restore();
      };

      const text = (
        value: string,

        x: number,

        y: number,

        width: number,

        options?: {
          bold?: boolean;

          size?: number;

          align?: 'left' | 'center' | 'right';

          color?: string;
        },
      ) => {
        doc
          .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options?.size ?? 6.2)
          .fillColor(options?.color ?? this.BLACK)
          .text(value ?? '', x, y, {
            width,
            align: options?.align ?? 'left',
            lineBreak: false,
          });
      };

      // ======================================================
      // CABECERA
      // ======================================================

      const headerY = 18;

      const headerHeight = 82;

      const logoWidth = 175;

      const companyWidth = 200;

      const documentWidth = WIDTH - logoWidth - companyWidth;

      // ======================================================
      // LOGO
      // ======================================================

      border(LEFT, headerY, logoWidth, headerHeight);

      const logoPath = this.findLogoPath();

      if (logoPath) {
        try {
          doc.image(logoPath, LEFT + 14, headerY + 18, {
            fit: [logoWidth - 28, 52],

            align: 'center',

            valign: 'center',
          });
        } catch {
          text('TEINCOMIN', LEFT + 10, headerY + 31, logoWidth - 20, {
            bold: true,

            size: 18,

            align: 'center',

            color: this.ORANGE,
          });
        }
      } else {
        text('TEINCOMIN', LEFT + 10, headerY + 30, logoWidth - 20, {
          bold: true,

          size: 18,

          align: 'center',

          color: this.ORANGE,
        });
      }

      // ======================================================
      // DATOS EMPRESA
      // ======================================================

      const companyX = LEFT + logoWidth;

      border(companyX, headerY, companyWidth, headerHeight);

      let companyY = headerY + 6;

      text(
        settings.companyAddress || 'Car. Central Km 17 Mza. E Lote 1',
        companyX + 4,
        companyY,
        companyWidth - 8,
        {
          bold: true,

          size: 6.4,

          align: 'center',
        },
      );

      companyY += 11;

      text(
        'Asc. Asociación Praderas de Pariachi',
        companyX + 4,
        companyY,
        companyWidth - 8,
        {
          bold: true,

          size: 6.2,

          align: 'center',
        },
      );

      companyY += 11;

      text('Ate - Lima - Lima', companyX + 4, companyY, companyWidth - 8, {
        bold: true,

        size: 6.2,

        align: 'center',
      });

      companyY += 11;

      text(
        `Telf.: ${settings.companyPhone || '7787661'}`,
        companyX + 4,
        companyY,
        companyWidth - 8,
        {
          size: 6.2,

          align: 'center',
        },
      );

      companyY += 10;

      text(
        `E-mail: ${settings.companyEmail || 'teincomin@gmail.com'}`,
        companyX + 4,
        companyY,
        companyWidth - 8,
        {
          size: 6,

          align: 'center',
        },
      );

      companyY += 10;

      text('www.teincomin.com', companyX + 4, companyY, companyWidth - 8, {
        size: 6,

        align: 'center',
      });

      // ======================================================
      // CUADRO RUC
      // ======================================================

      const documentX = companyX + companyWidth;

      border(documentX, headerY, documentWidth, headerHeight, 1.4);

      text(
        `R.U.C. ${settings.ruc || '20542412322'}`,
        documentX + 4,
        headerY + 9,
        documentWidth - 8,
        {
          bold: true,

          size: 8.5,

          align: 'center',
        },
      );

      fillRect(documentX, headerY + 31, documentWidth, 17, this.ORANGE);

      text(
        'GUÍA DE REMISIÓN - REMITENTE',
        documentX + 3,
        headerY + 36,
        documentWidth - 6,
        {
          bold: true,

          size: 6.5,

          align: 'center',

          color: '#FFFFFF',
        },
      );

      text(
        `${guide.series} - N° ${guide.guideNumber}`,
        documentX + 4,
        headerY + 59,
        documentWidth - 8,
        {
          bold: true,

          size: 9,

          align: 'center',
        },
      );

      // ======================================================
      // BLOQUES INFORMACIÓN
      // ======================================================

      let y = headerY + headerHeight + 7;

      const leftHalf = 260;

      const gap = 7;

      const rightHalf = WIDTH - leftHalf - gap;

      const rightX = LEFT + leftHalf + gap;

      // Fecha emisión
      border(LEFT, y, leftHalf, 18);

      text('Fecha de Emisión:', LEFT + 5, y + 5, 73, {
        size: 6.2,
      });

      text(this.formatDate(guide.issueDate), LEFT + 78, y + 5, leftHalf - 83, {
        size: 6.2,

        color: this.BLUE_TEXT,
      });

      y += 22;

      // ======================================================
      // PUNTO PARTIDA / LLEGADA
      // ======================================================

      border(LEFT, y, leftHalf, 31);

      text('Punto de partida:', LEFT + 5, y + 8, 78, {
        size: 6.2,
      });

      text(guide.departurePoint, LEFT + 80, y + 8, leftHalf - 85, {
        size: 6.1,

        color: this.BLUE_TEXT,
      });

      border(rightX, y, rightHalf, 31);

      text('Punto de Llegada:', rightX + 5, y + 8, 82, {
        size: 6.2,
      });

      text(guide.arrivalPoint, rightX + 88, y + 8, rightHalf - 93, {
        size: 6.1,

        color: this.BLUE_TEXT,
      });

      y += 35;

      // ======================================================
      // FECHA TRASLADO / RAZÓN SOCIAL
      // ======================================================

      border(LEFT, y, leftHalf, 26);

      text('Fecha de inicio del Traslado:', LEFT + 5, y + 8, 120, {
        size: 6.1,
      });

      text(
        this.formatDate(guide.transferStartDate),
        LEFT + 125,
        y + 8,
        leftHalf - 130,
        {
          size: 6.1,

          color: this.BLUE_TEXT,
        },
      );

      border(rightX, y, rightHalf, 26);

      text('Nombre o Razón Social:', rightX + 5, y + 8, 105, {
        size: 6.1,
      });

      text(guide.recipientName, rightX + 110, y + 8, rightHalf - 115, {
        size: 6.1,

        color: this.BLUE_TEXT,
      });

      y += 26;

      // ======================================================
      // COSTO / RUC
      // ======================================================

      border(LEFT, y, leftHalf, 22);

      text('COSTO MÍNIMO:', LEFT + 5, y + 7, 80, {
        bold: true,

        size: 6.1,
      });

      text(
        guide.minimumCost !== null && guide.minimumCost !== undefined
          ? `S/ ${Number(guide.minimumCost).toFixed(2)}`
          : '',
        LEFT + 88,
        y + 7,
        75,
        {
          size: 6.1,

          color: this.BLUE_TEXT,
        },
      );

      text('O/C:', LEFT + 175, y + 7, 25, {
        size: 6.1,
      });

      text(
        guide.purchaseOrderReference ?? '',
        LEFT + 200,
        y + 7,
        leftHalf - 205,
        {
          size: 6.1,

          color: this.BLUE_TEXT,
        },
      );

      border(rightX, y, rightHalf, 22);

      text('NÚMERO DE R.U.C.:', rightX + 5, y + 7, 90, {
        size: 6.1,
      });

      text(guide.recipientRuc ?? '', rightX + 96, y + 7, 90, {
        size: 6.1,

        color: this.BLUE_TEXT,
      });

      text('O/C:', rightX + 190, y + 7, 25, {
        size: 6.1,
      });

      text(
        guide.purchaseOrderReference ?? '',
        rightX + 215,
        y + 7,
        rightHalf - 220,
        {
          size: 6.1,

          color: this.BLUE_TEXT,
        },
      );

      y += 22;

      // ======================================================
      // TRANSPORTE
      // ======================================================

      const transportHeaderHeight = 17;

      fillRect(LEFT, y, leftHalf, transportHeaderHeight, '#F4F4F4');

      border(LEFT, y, leftHalf, transportHeaderHeight);

      text('UNIDAD DE TRANSPORTE Y CONDUCTOR', LEFT + 2, y + 5, leftHalf - 4, {
        bold: true,

        size: 6.3,

        align: 'center',
      });

      fillRect(rightX, y, rightHalf, transportHeaderHeight, '#F4F4F4');

      border(rightX, y, rightHalf, transportHeaderHeight);

      text('EMPRESA DE TRANSPORTES', rightX + 2, y + 5, rightHalf - 4, {
        bold: true,

        size: 6.3,

        align: 'center',
      });

      y += transportHeaderHeight;

      // ======================================================
      // FILA MARCA / TRANSPORTISTA
      // ======================================================

      border(LEFT, y, leftHalf, 18);

      text('MARCA Y N° DE PLACA:', LEFT + 5, y + 5, 103, {
        bold: true,

        size: 5.9,
      });

      text(
        [guide.vehicleBrand, guide.vehiclePlate].filter(Boolean).join(' - '),
        LEFT + 110,
        y + 5,
        leftHalf - 115,
        {
          size: 6,

          color: this.BLUE_TEXT,
        },
      );

      border(rightX, y, rightHalf, 18);

      text('Nombre o Razón Social:', rightX + 5, y + 5, 105, {
        size: 5.9,
      });

      text(
        guide.transportCompanyName ?? '',
        rightX + 110,
        y + 5,
        rightHalf - 115,
        {
          size: 6,

          color: this.BLUE_TEXT,
        },
      );

      y += 18;

      // ======================================================
      // CONSTANCIA / RUC TRANSPORTISTA
      // ======================================================

      border(LEFT, y, leftHalf, 18);

      text('N° DE CONSTANCIA DE INSCRIPCIÓN:', LEFT + 5, y + 5, 150, {
        bold: true,

        size: 5.7,
      });

      text(
        guide.registrationCertificate ?? '',
        LEFT + 155,
        y + 5,
        leftHalf - 160,
        {
          size: 6,

          color: this.BLUE_TEXT,
        },
      );

      border(rightX, y, rightHalf, 18);

      text('NÚMERO DE R.U.C.:', rightX + 5, y + 5, 90, {
        size: 5.9,
      });

      text(
        guide.transportCompanyRuc ?? '',
        rightX + 97,
        y + 5,
        rightHalf - 102,
        {
          size: 6,

          color: this.BLUE_TEXT,
        },
      );

      y += 18;

      // ======================================================
      // LICENCIA
      // ======================================================

      border(LEFT, y, leftHalf, 18);

      text('N° DE LICENCIA DE CONDUCTOR:', LEFT + 5, y + 5, 140, {
        bold: true,

        size: 5.8,
      });

      text(guide.driverLicense ?? '', LEFT + 145, y + 5, leftHalf - 150, {
        size: 6,

        color: this.BLUE_TEXT,
      });

      border(rightX, y, rightHalf, 18);

      y += 21;

      // ======================================================
      // TABLA PRODUCTOS
      // ======================================================

      const itemW = 30;

      const quantityW = 60;

      const descriptionW = 345;

      const unitW = 72;

      const weightW = WIDTH - itemW - quantityW - descriptionW - unitW;

      const tableHeaderHeight = 18;

      // Fondo naranja
      fillRect(LEFT, y, WIDTH, tableHeaderHeight, this.ORANGE);

      let x = LEFT;

      const tableHeaders = [
        {
          label: 'Item',

          width: itemW,
        },

        {
          label: 'Cantidad',

          width: quantityW,
        },

        {
          label: 'Descripción',

          width: descriptionW,
        },

        {
          label: 'Unidad de Medida',

          width: unitW,
        },

        {
          label: 'Peso Total',

          width: weightW,
        },
      ];

      for (const header of tableHeaders) {
        border(x, y, header.width, tableHeaderHeight);

        text(header.label, x + 2, y + 5, header.width - 4, {
          bold: true,

          size: 5.8,

          align: 'center',

          color: '#FFFFFF',
        });

        x += header.width;
      }

      y += tableHeaderHeight;

      // ======================================================
      // CUERPO GRANDE
      // ======================================================

      const tableBodyTop = y;

      const tableBodyBottom = 720;

      const bodyHeight = tableBodyBottom - tableBodyTop;

      // líneas verticales
      border(LEFT, tableBodyTop, WIDTH, bodyHeight, 1);

      let vx = LEFT + itemW;

      doc.moveTo(vx, tableBodyTop).lineTo(vx, tableBodyBottom).stroke();

      vx += quantityW;

      doc.moveTo(vx, tableBodyTop).lineTo(vx, tableBodyBottom).stroke();

      vx += descriptionW;

      doc.moveTo(vx, tableBodyTop).lineTo(vx, tableBodyBottom).stroke();

      vx += unitW;

      doc.moveTo(vx, tableBodyTop).lineTo(vx, tableBodyBottom).stroke();

      // ======================================================
      // DETALLES
      // ======================================================

      let detailY = tableBodyTop + 5;

      guide.details.forEach((detail, index) => {
        if (detailY > tableBodyBottom - 15) {
          return;
        }

        text(String(index + 1), LEFT + 2, detailY, itemW - 4, {
          size: 6,

          align: 'center',

          color: this.BLUE_TEXT,
        });

        text(
          this.formatQuantity(detail.quantity),
          LEFT + itemW + 2,
          detailY,
          quantityW - 4,
          {
            size: 6,

            align: 'center',

            color: this.BLUE_TEXT,
          },
        );

        text(
          String(
            detail.description ?? detail.product?.name ?? '',
          ).toUpperCase(),
          LEFT + itemW + quantityW + 4,
          detailY,
          descriptionW - 8,
          {
            size: 6,

            color: this.BLUE_TEXT,
          },
        );

        text(
          String(detail.unit ?? detail.product?.unit ?? ''),
          LEFT + itemW + quantityW + descriptionW + 2,
          detailY,
          unitW - 4,
          {
            size: 6,

            align: 'center',

            color: this.BLUE_TEXT,
          },
        );

        text(
          detail.totalWeight !== null && detail.totalWeight !== undefined
            ? this.formatQuantity(detail.totalWeight)
            : '',
          LEFT + itemW + quantityW + descriptionW + unitW + 2,
          detailY,
          weightW - 4,
          {
            size: 6,

            align: 'center',

            color: this.BLUE_TEXT,
          },
        );

        detailY += 13;
      });

      // ======================================================
      // MOTIVOS DE TRASLADO
      // ======================================================

      y = tableBodyBottom;

      border(LEFT, y, WIDTH, 17);

      text('Motivos del Traslado', LEFT + 5, y + 5, WIDTH - 10, {
        bold: true,

        size: 6.5,
      });

      y += 17;

      const reasons = [
        {
          value: TransferReason.SALE,

          label: '1.- Venta',
        },

        {
          value: TransferReason.CONSIGNMENT,

          label: '4.- Consignación',
        },

        {
          value: TransferReason.TRANSFORMATION,

          label: '7.- Para transformación',
        },

        {
          value: TransferReason.PRIMARY_ZONE,

          label: '10.- Zona primaria',
        },

        {
          value: TransferReason.RETURN,

          label: '5.- Devolución',
        },

        {
          value: TransferReason.PICKUP,

          label: '8.- Recojo de bienes',
        },

        {
          value: TransferReason.IMPORT,

          label: '11.- Importación',
        },

        {
          value: TransferReason.BETWEEN_ESTABLISHMENTS,

          label: '6.- Entre establecimientos de la misma empresa',
        },

        {
          value: TransferReason.ITINERANT_ISSUER,

          label: '9.- Emisor itinerante',
        },

        {
          value: TransferReason.EXPORT,

          label: '12.- Exportación',
        },

        {
          value: TransferReason.PURCHASE,

          label: '3.- Compra',
        },

        {
          value: TransferReason.OTHER,

          label: 'Otros',
        },
      ];

      const reasonBoxHeight = 55;

      border(LEFT, y, WIDTH, reasonBoxHeight);

      const reasonColumnWidth = WIDTH / 4;

      reasons.forEach((reason, index) => {
        const column = index % 4;

        const row = Math.floor(index / 4);

        const reasonX = LEFT + column * reasonColumnWidth + 5;

        const reasonY = y + 7 + row * 15;

        const selected = guide.transferReason === reason.value;

        // checkbox
        doc.rect(reasonX, reasonY, 8, 8).stroke();

        if (selected) {
          doc
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(this.ORANGE)
            .text('X', reasonX + 1, reasonY - 1, {
              width: 7,

              align: 'center',
            });
        }

        text(reason.label, reasonX + 12, reasonY + 1, reasonColumnWidth - 17, {
          size: 5.2,
        });
      });

      // ======================================================
      // PIE
      // ======================================================

      doc
        .font('Helvetica')
        .fontSize(5.5)
        .fillColor('#777777')
        .text(
          `${settings.systemName || 'T-LOG'} · ${guide.fullNumber}`,
          LEFT,
          PAGE_HEIGHT - 15,
          {
            width: WIDTH,

            align: 'center',
          },
        );

      doc.end();
    });
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async generateExcel(
    id: number,

    userId: number,
  ): Promise<Buffer> {
    const guide = await this.remissionGuidesService.findOne(id, userId);

    const settings = await this.settingsService.getSettings();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = settings.systemName || 'T-LOG';

    workbook.created = new Date();

    const ws = workbook.addWorksheet('Guía de Remisión', {
      pageSetup: {
        orientation: 'portrait',

        paperSize: 9,

        fitToPage: true,

        fitToWidth: 1,

        fitToHeight: 1,
      },
    });

    // ============================================================
    // COLUMNAS A:L
    //
    // Se usa una distribución parecida al archivo original.
    // ============================================================

    ws.columns = [
      { width: 4 }, // A Item
      { width: 7 }, // B Cantidad
      { width: 12 }, // C
      { width: 12 }, // D
      { width: 12 }, // E
      { width: 12 }, // F
      { width: 12 }, // G
      { width: 12 }, // H
      { width: 12 }, // I
      { width: 10 }, // J
      { width: 10 }, // K
      { width: 10 }, // L
    ];

    ws.views = [
      {
        showGridLines: false,
      },
    ];

    // ============================================================
    // ESTILOS
    // ============================================================

    const blackBorder: Partial<ExcelJS.Borders> = {
      top: {
        style: 'thin',

        color: {
          argb: 'FF000000',
        },
      },

      left: {
        style: 'thin',

        color: {
          argb: 'FF000000',
        },
      },

      bottom: {
        style: 'thin',

        color: {
          argb: 'FF000000',
        },
      },

      right: {
        style: 'thin',

        color: {
          argb: 'FF000000',
        },
      },
    };

    const orangeFill: ExcelJS.Fill = {
      type: 'pattern',

      pattern: 'solid',

      fgColor: {
        argb: this.ORANGE_EXCEL,
      },
    };

    // ============================================================
    // APLICAR BORDES POR COORDENADAS
    //
    // Evitamos completamente el error TS2356 de ExcelJS.
    // ============================================================

    const borderRange = (
      startRow: number,

      startColumn: number,

      endRow: number,

      endColumn: number,
    ) => {
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
          ws.getCell(r, c).border = blackBorder;
        }
      }
    };

    const centerCell = (reference: string) => {
      ws.getCell(reference).alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };
    };

    const blueValue = (reference: string) => {
      ws.getCell(reference).font = {
        color: {
          argb: this.BLUE_TEXT_EXCEL,
        },

        size: 8,
      };
    };

    // ============================================================
    // ALTURAS
    // ============================================================

    for (let r = 1; r <= 90; r++) {
      ws.getRow(r).height = 15;
    }

    ws.getRow(2).height = 20;

    ws.getRow(3).height = 18;

    ws.getRow(4).height = 18;

    ws.getRow(5).height = 18;

    ws.getRow(6).height = 18;

    // ============================================================
    // LOGO
    // ============================================================

    ws.mergeCells('A2:E6');

    borderRange(2, 1, 6, 5);

    const logoPath = this.findLogoPath();

    if (logoPath) {
      try {
        const extension = extname(logoPath).toLowerCase().replace('.', '');

        const imageExtension: 'png' | 'jpeg' =
          extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'png';

        const imageId = workbook.addImage({
          filename: logoPath,

          extension: imageExtension,
        });

        // ========================================================
        // INSERTAR LOGO
        //
        // Usamos rango porque esta sintaxis es compatible con
        // la versión actual de ExcelJS del proyecto.
        // ========================================================

        ws.addImage(imageId, 'A2:E6');
      } catch (error) {
        console.error('No se pudo insertar el logo en el Excel:', error);

        ws.getCell('A2').value = 'TEINCOMIN';

        ws.getCell('A2').font = {
          bold: true,

          size: 22,

          color: {
            argb: this.ORANGE_EXCEL,
          },
        };

        centerCell('A2');
      }
    } else {
      ws.getCell('A2').value = 'TEINCOMIN';

      ws.getCell('A2').font = {
        bold: true,

        size: 22,

        color: {
          argb: this.ORANGE_EXCEL,
        },
      };

      centerCell('A2');
    }

    // ============================================================
    // RUC / GUÍA
    // ============================================================

    ws.mergeCells('J2:L3');

    ws.getCell('J2').value = `R.U.C. ${settings.ruc || '20542412322'}`;

    ws.getCell('J2').font = {
      bold: true,

      size: 11,
    };

    centerCell('J2');

    ws.mergeCells('J4:L5');

    ws.getCell('J4').value = 'GUÍA DE REMISIÓN - REMITENTE';

    ws.getCell('J4').fill = orangeFill;

    ws.getCell('J4').font = {
      bold: true,

      size: 9,

      color: {
        argb: 'FFFFFFFF',
      },
    };

    centerCell('J4');

    ws.mergeCells('J6:L7');

    ws.getCell('J6').value = `${guide.series} - N° ${guide.guideNumber}`;

    ws.getCell('J6').font = {
      bold: true,

      size: 11,
    };

    centerCell('J6');

    borderRange(2, 10, 7, 12);

    // ============================================================
    // FECHA EMISIÓN
    // ============================================================

    ws.mergeCells('A8:D8');

    ws.getCell('A8').value = `Fecha de Emisión:`;

    ws.getCell('A8').font = {
      size: 8,
    };

    ws.mergeCells('E8:F8');

    ws.getCell('E8').value = this.formatDate(guide.issueDate);

    blueValue('E8');

    borderRange(8, 1, 8, 6);

    // ============================================================
    // PARTIDA
    // ============================================================

    ws.mergeCells('A10:B11');

    ws.getCell('A10').value = 'Punto de partida:';

    ws.mergeCells('C10:F11');

    ws.getCell('C10').value = guide.departurePoint;

    blueValue('C10');

    ws.getCell('C10').alignment = {
      vertical: 'middle',

      wrapText: true,
    };

    borderRange(10, 1, 11, 6);

    // ============================================================
    // LLEGADA
    // ============================================================

    ws.mergeCells('G10:H11');

    ws.getCell('G10').value = 'Punto de Llegada:';

    ws.mergeCells('I10:L11');

    ws.getCell('I10').value = guide.arrivalPoint;

    blueValue('I10');

    ws.getCell('I10').alignment = {
      vertical: 'middle',

      wrapText: true,
    };

    borderRange(10, 7, 11, 12);

    // ============================================================
    // FECHA TRASLADO
    // ============================================================

    ws.mergeCells('A12:C13');

    ws.getCell('A12').value = 'Fecha de inicio del Traslado:';

    ws.mergeCells('D12:F13');

    ws.getCell('D12').value = this.formatDate(guide.transferStartDate);

    blueValue('D12');

    borderRange(12, 1, 13, 6);

    // ============================================================
    // RAZÓN SOCIAL
    // ============================================================

    ws.mergeCells('G12:I13');

    ws.getCell('G12').value = 'Nombre o Razón Social:';

    ws.mergeCells('J12:L13');

    ws.getCell('J12').value = guide.recipientName;

    blueValue('J12');

    borderRange(12, 7, 13, 12);

    // ============================================================
    // COSTO MINIMO
    // ============================================================

    ws.mergeCells('A14:B14');

    ws.getCell('A14').value = 'COSTO MÍNIMO:';

    ws.getCell('A14').font = {
      bold: true,

      size: 7,
    };

    ws.mergeCells('C14:D14');

    ws.getCell('C14').value =
      guide.minimumCost !== null && guide.minimumCost !== undefined
        ? Number(guide.minimumCost)
        : '';

    ws.getCell('E14').value = 'O/C:';

    ws.getCell('F14').value = guide.purchaseOrderReference ?? '';

    borderRange(14, 1, 14, 6);

    // ============================================================
    // RUC DESTINATARIO
    // ============================================================

    ws.mergeCells('G14:I14');

    ws.getCell('G14').value = 'NÚMERO DE R.U.C.:';

    ws.mergeCells('J14:K14');

    ws.getCell('J14').value = guide.recipientRuc ?? '';

    blueValue('J14');

    ws.getCell('L14').value = guide.purchaseOrderReference
      ? `O/C: ${guide.purchaseOrderReference}`
      : 'O/C:';

    borderRange(14, 7, 14, 12);

    // ============================================================
    // CABECERAS TRANSPORTE
    // ============================================================

    ws.mergeCells('A15:F15');

    ws.getCell('A15').value = 'UNIDAD DE TRANSPORTE Y CONDUCTOR';

    ws.mergeCells('G15:L15');

    ws.getCell('G15').value = 'EMPRESA DE TRANSPORTES';

    for (const reference of ['A15', 'G15']) {
      ws.getCell(reference).font = {
        bold: true,

        size: 8,
      };

      ws.getCell(reference).alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };
    }

    borderRange(15, 1, 15, 12);

    // ============================================================
    // MARCA / EMPRESA TRANSPORTE
    // ============================================================

    ws.mergeCells('A16:C16');

    ws.getCell('A16').value = 'MARCA Y N° DE PLACA:';

    ws.mergeCells('D16:F16');

    ws.getCell('D16').value = [guide.vehicleBrand, guide.vehiclePlate]
      .filter(Boolean)
      .join(' - ');

    blueValue('D16');

    ws.mergeCells('G16:I16');

    ws.getCell('G16').value = 'Nombre o Razón Social:';

    ws.mergeCells('J16:L16');

    ws.getCell('J16').value = guide.transportCompanyName ?? '';

    blueValue('J16');

    borderRange(16, 1, 16, 12);

    // ============================================================
    // CONSTANCIA / RUC
    // ============================================================

    ws.mergeCells('A17:D17');

    ws.getCell('A17').value = 'N° DE CONSTANCIA DE INSCRIPCIÓN:';

    ws.mergeCells('E17:F17');

    ws.getCell('E17').value = guide.registrationCertificate ?? '';

    blueValue('E17');

    ws.mergeCells('G17:I17');

    ws.getCell('G17').value = 'NÚMERO DE R.U.C.:';

    ws.mergeCells('J17:L17');

    ws.getCell('J17').value = guide.transportCompanyRuc ?? '';

    blueValue('J17');

    borderRange(17, 1, 17, 12);

    // ============================================================
    // LICENCIA
    // ============================================================

    ws.mergeCells('A18:D18');

    ws.getCell('A18').value = 'N° DE LICENCIA DE CONDUCTOR:';

    ws.mergeCells('E18:F18');

    ws.getCell('E18').value = guide.driverLicense ?? '';

    blueValue('E18');

    ws.mergeCells('G18:L18');

    borderRange(18, 1, 18, 12);

    // ============================================================
    // TABLA PRODUCTOS - FILA 20
    // ============================================================

    const TABLE_HEADER = 20;

    ws.getCell('A20').value = 'Item';

    ws.mergeCells('B20:C20');

    ws.getCell('B20').value = 'Cantidad';

    ws.mergeCells('D20:I20');

    ws.getCell('D20').value = 'Descripción';

    ws.mergeCells('J20:K20');

    ws.getCell('J20').value = 'Unidad de Medida';

    ws.getCell('L20').value = 'Peso Total';

    for (let column = 1; column <= 12; column++) {
      const cell = ws.getCell(TABLE_HEADER, column);

      cell.fill = orangeFill;

      cell.font = {
        bold: true,

        size: 8,

        color: {
          argb: 'FFFFFFFF',
        },
      };

      cell.alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };
    }

    ws.getRow(TABLE_HEADER).height = 20;

    borderRange(TABLE_HEADER, 1, TABLE_HEADER, 12);

    // ============================================================
    // PRODUCTOS
    // ============================================================

    let currentRow = 21;

    for (let index = 0; index < guide.details.length; index++) {
      const detail = guide.details[index];

      ws.getCell(`A${currentRow}`).value = index + 1;

      ws.mergeCells(`B${currentRow}:C${currentRow}`);

      ws.getCell(`B${currentRow}`).value = Number(detail.quantity);

      ws.mergeCells(`D${currentRow}:I${currentRow}`);

      ws.getCell(`D${currentRow}`).value = String(
        detail.description ?? detail.product?.name ?? '',
      ).toUpperCase();

      ws.mergeCells(`J${currentRow}:K${currentRow}`);

      ws.getCell(`J${currentRow}`).value = String(
        detail.unit ?? detail.product?.unit ?? '',
      );

      ws.getCell(`L${currentRow}`).value =
        detail.totalWeight !== null && detail.totalWeight !== undefined
          ? Number(detail.totalWeight)
          : '';

      // color azul del formato real

      for (let column = 1; column <= 12; column++) {
        ws.getCell(currentRow, column).font = {
          size: 7,

          color: {
            argb: this.BLUE_TEXT_EXCEL,
          },
        };

        ws.getCell(currentRow, column).alignment = {
          vertical: 'middle',

          horizontal: column >= 4 && column <= 9 ? 'left' : 'center',

          wrapText: true,
        };
      }

      currentRow++;
    }

    // ============================================================
    // ÁREA VACÍA DE PRODUCTOS
    //
    // Mantenemos la gran altura del formato original.
    // ============================================================

    const BODY_END_ROW = Math.max(74, currentRow + 5);

    // Líneas verticales

    for (let row = 21; row <= BODY_END_ROW; row++) {
      // A
      ws.getCell(row, 1).border = {
        left: blackBorder.left,

        right: blackBorder.right,
      };

      // B:C
      ws.getCell(row, 2).border = {
        left: blackBorder.left,
      };

      ws.getCell(row, 3).border = {
        right: blackBorder.right,
      };

      // D:I
      ws.getCell(row, 4).border = {
        left: blackBorder.left,
      };

      ws.getCell(row, 9).border = {
        right: blackBorder.right,
      };

      // J:K
      ws.getCell(row, 10).border = {
        left: blackBorder.left,
      };

      ws.getCell(row, 11).border = {
        right: blackBorder.right,
      };

      // L
      ws.getCell(row, 12).border = {
        left: blackBorder.left,

        right: blackBorder.right,
      };
    }

    // borde inferior

    for (let column = 1; column <= 12; column++) {
      const cell = ws.getCell(BODY_END_ROW, column);

      cell.border = {
        ...cell.border,

        bottom: {
          style: 'medium',

          color: {
            argb: 'FF000000',
          },
        },
      };
    }

    // ============================================================
    // MOTIVOS TRASLADO
    // ============================================================

    const REASON_TITLE_ROW = BODY_END_ROW + 1;

    ws.mergeCells(`A${REASON_TITLE_ROW}:L${REASON_TITLE_ROW}`);

    ws.getCell(`A${REASON_TITLE_ROW}`).value = 'Motivos del Traslado';

    ws.getCell(`A${REASON_TITLE_ROW}`).font = {
      bold: true,

      size: 8,
    };

    ws.getCell(`A${REASON_TITLE_ROW}`).alignment = {
      vertical: 'middle',
    };

    borderRange(REASON_TITLE_ROW, 1, REASON_TITLE_ROW, 12);

    // ============================================================
    // MATRIZ MOTIVOS
    // ============================================================

    const reasonRows = [
      [
        {
          value: TransferReason.SALE,

          text: '1.- Venta',
        },

        {
          value: TransferReason.CONSIGNMENT,

          text: '4.- Consignación',
        },

        {
          value: TransferReason.TRANSFORMATION,

          text: '7.- Para transformación',
        },

        {
          value: TransferReason.PRIMARY_ZONE,

          text: '10.- Zona primaria',
        },
      ],

      [
        {
          value: TransferReason.RETURN,

          text: '5.- Devolución',
        },

        {
          value: TransferReason.PICKUP,

          text: '8.- Recojo de bienes',
        },

        {
          value: TransferReason.IMPORT,

          text: '11.- Importación',
        },

        {
          value: TransferReason.OTHER,

          text: 'Otros',
        },
      ],

      [
        {
          value: TransferReason.PURCHASE,

          text: '3.- Compra',
        },

        {
          value: TransferReason.BETWEEN_ESTABLISHMENTS,

          text: '6.- Entre establecimientos de la misma empresa',
        },

        {
          value: TransferReason.ITINERANT_ISSUER,

          text: '9.- Emisor itinerante',
        },

        {
          value: TransferReason.EXPORT,

          text: '12.- Exportación',
        },
      ],
    ];

    const reasonColumns = [
      {
        start: 1,

        end: 3,
      },

      {
        start: 4,

        end: 6,
      },

      {
        start: 7,

        end: 9,
      },

      {
        start: 10,

        end: 12,
      },
    ];

    reasonRows.forEach((reasonRow, rowIndex) => {
      const excelRow = REASON_TITLE_ROW + 1 + rowIndex;

      reasonRow.forEach((reason, columnIndex) => {
        const range = reasonColumns[columnIndex];

        ws.mergeCells(excelRow, range.start, excelRow, range.end);

        const selected = guide.transferReason === reason.value;

        const cell = ws.getCell(excelRow, range.start);

        cell.value = `${selected ? '☒' : '☐'} ${reason.text}`;

        cell.font = {
          size: 7,

          bold: selected,

          color: {
            argb: selected ? this.ORANGE_EXCEL : 'FF000000',
          },
        };

        cell.alignment = {
          vertical: 'middle',

          wrapText: true,
        };

        borderRange(excelRow, range.start, excelRow, range.end);
      });
    });

    // ============================================================
    // OBSERVACIONES
    // ============================================================

    let finalRow = REASON_TITLE_ROW + 4;

    if (
      guide.transferReason === TransferReason.OTHER &&
      guide.otherTransferReason
    ) {
      finalRow++;

      ws.mergeCells(`A${finalRow}:L${finalRow}`);

      ws.getCell(`A${finalRow}`).value = `Otros: ${guide.otherTransferReason}`;
    }

    if (guide.observations) {
      finalRow++;

      ws.mergeCells(`A${finalRow}:L${finalRow + 1}`);

      ws.getCell(`A${finalRow}`).value = `Observaciones: ${guide.observations}`;

      ws.getCell(`A${finalRow}`).alignment = {
        vertical: 'top',

        wrapText: true,
      };

      borderRange(finalRow, 1, finalRow + 1, 12);

      finalRow++;
    }

    // ============================================================
    // FUENTE GENERAL
    // ============================================================

    ws.eachRow(
      {
        includeEmpty: true,
      },
      (row) => {
        row.eachCell(
          {
            includeEmpty: true,
          },
          (cell) => {
            if (!cell.font || Object.keys(cell.font).length === 0) {
              cell.font = {
                name: 'Arial',

                size: 8,
              };
            }
          },
        );
      },
    );

    // ============================================================
    // CONFIGURACIÓN IMPRESIÓN
    // ============================================================

    ws.pageSetup = {
      orientation: 'portrait',

      paperSize: 9,

      fitToPage: true,

      fitToWidth: 1,

      fitToHeight: 1,

      horizontalCentered: true,

      verticalCentered: false,

      margins: {
        left: 0.15,

        right: 0.15,

        top: 0.15,

        bottom: 0.15,

        header: 0,

        footer: 0,
      },
    };

    ws.pageSetup.printArea = `A1:L${finalRow + 1}`;

    // ============================================================
    // GENERAR EXCEL
    // ============================================================

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}
