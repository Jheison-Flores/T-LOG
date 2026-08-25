import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from '../../entities/product.entity';
import { Category } from '../../../categories/entities/category.entity';

import { CreateProductDto } from '../../dto/create-product.dto';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { ProductSearchDto } from '../../../products/dto/producto-search.dto';

import { ProductCodeHelper } from '../../helpers/product-code.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createDto: CreateProductDto): Promise<Product> {
    const exists = await this.productRepository.findOne({
      where: {
        name: createDto.name,
      },
    });

    if (exists) {
      throw new ConflictException('Ya existe un producto con ese nombre.');
    }

    const category = await this.categoryRepository.findOne({
      where: {
        id: createDto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe.');
    }

    const product = this.productRepository.create({
      name: createDto.name.trim(),
      description: createDto.description,
      brand: createDto.brand,
      model: createDto.model,
      unit: createDto.unit,
      minimumStock: createDto.minimumStock,
      currentPrice: createDto.currentPrice,
      requiresSerial: createDto.requiresSerial,
      requiresBatch: createDto.requiresBatch,
      category,
    });

    const saved = await this.productRepository.save(product);

    saved.sku = ProductCodeHelper.generateSku(saved.id);

    saved.internalCode = ProductCodeHelper.generateInternalCode(
      category.code,
      saved.id,
    );

    return this.productRepository.save(saved);
  }

  async findAll(search: ProductSearchDto): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (search.name) {
      query.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${search.name}%`,
      });
    }

    if (search.brand) {
      query.andWhere('LOWER(product.brand) LIKE LOWER(:brand)', {
        brand: `%${search.brand}%`,
      });
    }

    if (search.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: Number(search.categoryId),
      });
    }

    if (search.isActive !== undefined) {
      query.andWhere('product.isActive = :active', {
        active: search.isActive === 'true',
      });
    }

    query.orderBy('product.name', 'ASC');

    return query.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true, // Cambiado de ['category'] a un objeto tipado
      },
    });

    if (!product) {
      throw new NotFoundException('El producto no existe.');
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada.');
      }

      product.category = category;
    }

    Object.assign(product, dto);

    return this.productRepository.save(product);
  }

  async deactivate(id: number) {
    const product = await this.findOne(id);

    product.isActive = false;

    return this.productRepository.save(product);
  }

  async activate(id: number) {
    const product = await this.findOne(id);

    product.isActive = true;

    return this.productRepository.save(product);
  }
}
