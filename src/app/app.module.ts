import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from '../usuario/usuario.module';
import { MoradorModule } from '../morador/morador.module';
import { AuthModule } from '../auth/auth.module';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { EvolucaoIndividualModule } from '../evolucao-individual/evolucao-individual.module';
import { RelatorioGeralModule } from '../relatorio-geral/relatorio-geral.module';
import { MedicosModule } from 'src/medicos/medicos.module';
import { PrescricaoModule } from 'src/prescricao/prescricao.module';
import { MedicamentoPrescricao } from 'src/medicamento-prescricao/entities/medicamento-prescricao.entity';
import { MedicamentoPrescricaoModule } from 'src/medicamento-prescricao/medicamento-prescricao.module';
import { MedicacaoModule } from 'src/medicacao/medicacao.module';

@Module({
  imports: [
    UsuarioModule,
    MoradorModule,
    AuthModule,
    MedicamentosModule,
    EvolucaoIndividualModule,
    RelatorioGeralModule,
    MedicosModule,
    PrescricaoModule,
    MedicamentoPrescricaoModule,
    MedicacaoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
