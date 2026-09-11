import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ProductsService } from '../services/products/products.service';

import { CreateProductDto } from '../dto/create-product.dto';

import { UpdateProductDto } from '../dto/update-product.dto';

import { ProductSearchDto } from '../dto/producto-search.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================================
  // CREAR PRODUCTO
  //
  // ADMIN:
  // Puede crear productos desde el módulo Productos.
  //
  // LOGISTICS:
  // Puede crear productos durante la operación logística,
  // por ejemplo mientras registra un requerimiento.
  // ============================================================

  @Post()
  @Roles('ADMIN', 'LOGISTICS')
  create(
    @Body()
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  // ============================================================
  // LISTAR PRODUCTOS
  // ============================================================

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll(
    @Query()
    search: ProductSearchDto,
  ) {
    return this.productsService.findAll(search);
  }

  // ============================================================
  // OBTENER PRODUCTO
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.findOne(id);
  }

  // ============================================================
  // EDITAR PRODUCTO
  //
  // Se mantiene solamente para ADMIN.
  // ============================================================

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // ============================================================
  // ACTIVAR PRODUCTO
  // ============================================================

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.activate(id);
  }

  // ============================================================
  // DESACTIVAR PRODUCTO
  // ============================================================

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.deactivate(id);
  }
}
