import { Injectable, Req, Res } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
    private s3: S3Client;
    private bucket_name = process.env.S3_BUCKET_NAME;

    constructor() {
        this.s3 = new S3Client({ region: 'us-east-1' }); // Cambia a tu región
    }

    async uploadFile(key: string, body: Buffer | Readable, contentType: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket_name,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: 'public-read'
        });

        await this.s3.send(command);

        // Construir la URL del objeto
        const objectUrl = `https://${this.bucket_name}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return objectUrl;
    }


    async downloadFile(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucket_name,
            Key: key
        });

        try {
            const { Body } = await this.s3.send(command);
            return Body as Readable;
        } catch (error) {
            console.error(`Error al descargar el archivo ${key}:`, error);
            throw error;
        }
    }
}