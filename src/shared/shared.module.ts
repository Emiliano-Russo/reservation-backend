import { Module, Global } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [S3Service, FirebaseService],
  exports: [S3Service, FirebaseService],
})
export class SharedModule {}
