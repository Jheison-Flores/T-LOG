import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../../entities/category.entity';

import { CreateCategoryDto } from '../../dto/create-category.dto';
import { UpdateCategoryDto } from '../../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ===============================================
  // Crear categoría
  // ===============================================

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findOne({
      where: [
        { code: createCategoryDto.code },
        { name: createCategoryDto.name },
      ],
    });

    if (exists) {
      throw new ConflictException(
        'Ya existe una categoría con ese código o nombre.',
      );
    }

    const category = this.categoryRepository.create({
      code: createCategoryDto.code.trim().toUpperCase(),
      name: createCategoryDto.name.trim(),
      description: createCategoryDto.description?.trim(),
      color: createCategoryDto.color,
      icon: createCategoryDto.icon?.trim(),
    });

    return await this.categoryRepository.save(category);
  }

  // ===============================================

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ===============================================

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    return category;
  }

  // ===============================================

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.code)
      category.code = updateCategoryDto.code.trim().toUpperCase();

    if (updateCategoryDto.name) category.name = updateCategoryDto.name.trim();

    if (updateCategoryDto.description !== undefined)
      category.description = updateCategoryDto.description?.trim();

    if (updateCategoryDto.color) category.color = updateCategoryDto.color;

    if (updateCategoryDto.icon !== undefined)
      category.icon = updateCategoryDto.icon?.trim();

    return await this.categoryRepository.save(category);
  }

  // ===============================================

  async activate(id: number): Promise<Category> {
    const category = await this.findOne(id);

    category.isActive = true;

    return await this.categoryRepository.save(category);
  }

  // ===============================================

  async deactivate(id: number): Promise<Category> {
    const category = await this.findOne(id);

    category.isActive = false;

    return await this.categoryRepository.save(category);
  }

  // ===============================================

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);
  }

  async findEntityById(id: number): Promise<Category> {
    // Cambiado de categoriesRepository a categoryRepository
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe.');
    }

    return category;
  }

  async findByCode(code: string): Promise<Category | null> {
    // Cambiado de categoriesRepository a categoryRepository
    return this.categoryRepository.findOne({
      where: {
        code,
      },
    });
  }
}
