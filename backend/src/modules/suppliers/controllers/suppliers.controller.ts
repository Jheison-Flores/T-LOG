import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request as ExpressRequest } from 'express';

import { SuppliersService } from '../services/suppliers.service';

import { CreateSupplierDto } from '../dto/create-supplier.dto';

import { UpdateSupplierDto } from '../dto/update-supplier.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll(
    @Req()
    req: RequestWithUser,
  ) {
    return this.suppliersService.findAll(req.user.id);
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  @Get(':id')
  findOne(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.suppliersService.findOne(id, req.user.id);
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  @Patch(':id')
  update(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto, req.user.id);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  @Delete(':id')
  remove(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.suppliersService.remove(id, req.user.id);
  }
}
