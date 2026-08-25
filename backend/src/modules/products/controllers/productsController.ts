import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
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

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll(
    @Query()
    search: ProductSearchDto,
  ) {
    return this.productsService.findAll(search);
  }

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.findOne(id);
  }

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

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.productsService.deactivate(id);
  }
}
