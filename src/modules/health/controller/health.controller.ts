import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export default class HealthController {
  @Get()
  getHealth(): string {
    return 'Service is running';
  }
}
