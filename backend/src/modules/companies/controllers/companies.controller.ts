import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CompaniesService } from '../services/companies.service';

import { CreateCompanyDto } from '../dto/create-company.dto';

import { UpdateCompanyDto } from '../dto/update-company.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    createCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.create(createCompanyDto);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll() {
    return this.companiesService.findAll();
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.companiesService.findOne(id);
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.companiesService.deactivate(id);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.companiesService.activate(id);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.companiesService.remove(id);
  }
}
