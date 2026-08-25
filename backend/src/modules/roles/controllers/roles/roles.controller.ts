import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { RolesService } from '../../services/roles/roles.service';

import { CreateRoleDto } from '../../dto/create-role.dto';

import { UpdateRoleDto } from '../../dto/update-role.dto';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../../common/guards/roles.guard';

import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/disable')
  disable(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.rolesService.disable(id);
  }

  @Patch(':id/enable')
  enable(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.rolesService.enable(id);
  }
}
