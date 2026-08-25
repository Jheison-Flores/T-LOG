import { Controller, Get } from '@nestjs/common';

@Controller('health') // Esto mapea la ruta /health
export class HealthController {
  @Get() // Esto mapea el método GET
  check() {
    return { status: 'ok', database: 'connected' };
  }
}
