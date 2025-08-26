import { Module } from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { PrescricaoController } from './prescricao.controller';

@Module({
  controllers: [PrescricaoController],
  providers: [PrescricaoService],
})
export class PrescricaoModule {}
