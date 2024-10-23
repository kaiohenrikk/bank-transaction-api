import { Module } from '@nestjs/common';
import { DynamicModuleLoader } from './dynamic.module';

@Module({
  imports: [DynamicModuleLoader.register()]
})
export class AppModule {}
