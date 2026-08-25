import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      application: 'T-LOG API',
      version: '0.1.0',
      environment: process.env.NODE_ENV,
    };
  }
}
