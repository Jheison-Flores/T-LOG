import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';

import { WarehousesService } from '../services/warehouses.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    createWarehouseDto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.warehousesService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.warehousesService.activate(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.warehousesService.remove(id);
  }
}
