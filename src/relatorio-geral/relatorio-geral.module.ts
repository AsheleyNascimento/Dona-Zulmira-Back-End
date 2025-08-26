import { Module } from '@nestjs/common';
import { RelatorioGeralService } from './relatorio-geral.service';
import { RelatorioGeralController } from './relatorio-geral.controller';

@Module({
  controllers: [RelatorioGeralController],
  providers: [RelatorioGeralService],
})
export class RelatorioGeralModule {}
