import { Module } from '@nestjs/common';
import { BusinessTypeController } from './businessType.controller';
import { BusinessTypeService } from './businessType.service';

@Module({
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService],
  exports: [BusinessTypeService],
})
export class BusinessTypeModule {}
