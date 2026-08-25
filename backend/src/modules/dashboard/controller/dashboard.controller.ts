import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import { DashboardService } from '../service/dashboard.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email?: string;
    role?: string;
  };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  getDashboard(
    @Req()
    req: RequestWithUser,
  ) {
    return this.dashboardService.getDashboard(req.user.id);
  }
}
