import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { Company } from '../entities/company.entity';

import { CreateCompanyDto } from '../dto/create-company.dto';

import { UpdateCompanyDto } from '../dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const legalName = createCompanyDto.legalName.trim();

    const ruc = createCompanyDto.ruc.trim();

    // ==========================================================
    // VALIDAR RAZÓN SOCIAL
    // ==========================================================

    const existingLegalName = await this.companyRepository.findOne({
      where: {
        legalName,
      },
    });

    if (existingLegalName) {
      throw new ConflictException(
        'Ya existe una empresa con esa razón social.',
      );
    }

    // ==========================================================
    // VALIDAR RUC
    // ==========================================================

    const existingRuc = await this.companyRepository.findOne({
      where: {
        ruc,
      },
    });

    if (existingRuc) {
      throw new ConflictException('Ya existe una empresa con ese RUC.');
    }

    // ==========================================================
    // CREAR
    // ==========================================================

    const company = this.companyRepository.create({
      legalName,

      tradeName: createCompanyDto.tradeName?.trim() || undefined,

      ruc,

      address: createCompanyDto.address?.trim() || undefined,
    });

    return this.companyRepository.save(company);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      order: {
        legalName: 'ASC',
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada.');
    }

    return company;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);

    // ==========================================================
    // RAZÓN SOCIAL
    // ==========================================================

    if (updateCompanyDto.legalName !== undefined) {
      const legalName = updateCompanyDto.legalName.trim();

      const existingLegalName = await this.companyRepository.findOne({
        where: {
          legalName,
          id: Not(id),
        },
      });

      if (existingLegalName) {
        throw new ConflictException(
          'Ya existe otra empresa con esa razón social.',
        );
      }

      company.legalName = legalName;
    }

    // ==========================================================
    // RUC
    // ==========================================================

    if (updateCompanyDto.ruc !== undefined) {
      const ruc = updateCompanyDto.ruc.trim();

      const existingRuc = await this.companyRepository.findOne({
        where: {
          ruc,
          id: Not(id),
        },
      });

      if (existingRuc) {
        throw new ConflictException('Ya existe otra empresa con ese RUC.');
      }

      company.ruc = ruc;
    }

    // ==========================================================
    // NOMBRE COMERCIAL
    // ==========================================================

    if (updateCompanyDto.tradeName !== undefined) {
      company.tradeName = updateCompanyDto.tradeName?.trim() || undefined;
    }

    // ==========================================================
    // DIRECCIÓN
    // ==========================================================

    if (updateCompanyDto.address !== undefined) {
      company.address = updateCompanyDto.address?.trim() || undefined;
    }

    return this.companyRepository.save(company);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(id: number): Promise<Company> {
    const company = await this.findOne(id);

    company.isActive = false;

    return this.companyRepository.save(company);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(id: number): Promise<Company> {
    const company = await this.findOne(id);

    company.isActive = true;

    return this.companyRepository.save(company);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(id: number): Promise<void> {
    const company = await this.findOne(id);

    await this.companyRepository.remove(company);
  }
}
