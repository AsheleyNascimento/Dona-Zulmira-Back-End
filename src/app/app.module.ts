import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { MedicamentoPrescricaoModule } from 'src/medicamento-prescricao/medicamento-prescricao.module';
import { MedicacaoModule } from 'src/medicacao/medicacao.module';
import { AiModule } from 'src/ai/ai.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsuarioModule,
    MoradorModule,
    AuthModule,
    MedicamentosModule,
    EvolucaoIndividualModule,
    RelatorioGeralModule,
    MedicosModule,
    PrescricaoModule,
    MedicamentoPrescricaoModule,
    MedicacaoModule,
    AiModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
