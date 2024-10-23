import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../../../common/logger.service';

@ApiTags('Health')
@Controller('health')
export default class HealthController {
  constructor(
    private readonly logger: LoggerService
  ) {}
  @Get()
  getHealth(): string {
    this.logger.info('Service is running');
    return 'Service is running';
  }
}
