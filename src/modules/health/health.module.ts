import { Module } from '@nestjs/common';
import HealthController from './controller/health.controller';
import { LoggerService } from '../../common/logger/service/logger.service';

@Module({
  controllers: [HealthController],
  providers: [LoggerService],
})
export class HealthModule {}
