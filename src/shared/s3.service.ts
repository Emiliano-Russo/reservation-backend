import { Injectable, Req, Res } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket_name = process.env.S3_BUCKET_NAME;

  constructor() {
    this.s3 = new S3Client({ region: 'us-east-1' }); // Cambia a tu región
  }

  async deleteFile(imageName) {
    const params = {
      Bucket: this.bucket_name,
      Key: imageName
    }
    return await this.s3.send(new DeleteObjectCommand(params));
  }

  async uploadFile(file, folder) {
    const { originalname } = file;

    return this.s3_upload(
      file.buffer,
      this.bucket_name,
      originalname,
      file.mimetype,
      folder,
    );
  }

  private async s3_upload(file, bucket, name, mimetype, folder) {
    const params = {
      Bucket: bucket,
      Key: `${folder}${name}`,
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };

    try {
      return await this.s3.send(new PutObjectCommand(params));
    } catch (e) {
      console.log(e);
    }
  }
}
