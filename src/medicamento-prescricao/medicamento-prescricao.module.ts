import { Module } from '@nestjs/common';
import { MedicamentoPrescricaoService } from './medicamento-prescricao.service';
import { MedicamentoPrescricaoController } from './medicamento-prescricao.controller';

@Module({
  controllers: [MedicamentoPrescricaoController],
  providers: [MedicamentoPrescricaoService],
})
export class MedicamentoPrescricaoModule {}
