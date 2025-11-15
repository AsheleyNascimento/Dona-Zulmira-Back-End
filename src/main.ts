import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  // Permitimos localhost (porta padrão do Next) e IP/porta da rede local usada no desenvolvimento
  // Enable CORS
  // Permitimos localhost (porta padrão do Next) e IP/porta da rede local usada no desenvolvimento
  // Ajustes: incluir OPTIONS e permitir headers comuns (Content-Type, Authorization)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.1.92:3001',
      // Permitimos também acesso ao front rodando em 192.168.1.92:3000
      'http://192.168.1.92:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // levantar erro quando a chave não existir
      transform: false, // tenta transformar os tipos de dados de param e dtos
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Dona Zulmira')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 4000);
  // Listen on 0.0.0.0 so the server is reachable from other machines in the LAN
  await app.listen(port, '0.0.0.0');
}
bootstrap();
