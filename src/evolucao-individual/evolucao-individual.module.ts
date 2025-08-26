import { Module } from '@nestjs/common';
import { EvolucaoIndividualService } from './evolucao-individual.service';
import { EvolucaoIndividualController } from './evolucao-individual.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvolucaoIndividualController],
  providers: [EvolucaoIndividualService],
})
export class EvolucaoIndividualModule {}
