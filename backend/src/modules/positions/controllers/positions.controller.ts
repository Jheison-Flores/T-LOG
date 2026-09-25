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

import { PositionsService } from '../services/positions.service';

import { CreatePositionDto } from '../dto/create-position.dto';

import { UpdatePositionDto } from '../dto/update-position.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    createPositionDto: CreatePositionDto,
  ) {
    return this.positionsService.create(createPositionDto);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll() {
    return this.positionsService.findAll();
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.positionsService.findOne(id);
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
    updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
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
    return this.positionsService.deactivate(id);
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
    return this.positionsService.activate(id);
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
    return this.positionsService.remove(id);
  }
}
