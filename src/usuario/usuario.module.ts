import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { logger } from '../app/common/middleware/logger.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(
      { path: 'usuario', method: RequestMethod.POST }, // Para POST /usuarios
      { path: 'usuario', method: RequestMethod.GET }, // Para GET /usuarios
    );
  }
}
