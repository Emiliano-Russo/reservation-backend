require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //temporal / no apto para produccion / se necesita un certificado
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  // Habilitar CORS
  //en produccion  origin: ['http://miapp.com', 'http://otrodominio.com'].a
  app.enableCors({
    origin: '*', // Permitir todos los orígenes (no recomendado para producción)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(8081);
}
bootstrap();
