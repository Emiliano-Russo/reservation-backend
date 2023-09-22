import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessTypeController } from './businessType.controller';
import { BusinessTypeService } from './businessType.service';
import { BusinessType } from './entities/businessType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessType])],
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService],
  exports: [BusinessTypeService],
})
export class BusinessTypeModule {}
