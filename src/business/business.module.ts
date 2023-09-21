import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { UserModule } from 'src/user/user.module';
import { SharedModule } from 'src/shared/shared.module';
import { Business } from './entities/business.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Business])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
