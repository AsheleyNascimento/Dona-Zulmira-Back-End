import { PartialType } from '@nestjs/swagger';
import { CreateEvolucaoIndividualDto } from './create-evolucao-individual.dto';

export class UpdateEvolucaoIndividualDto extends PartialType(CreateEvolucaoIndividualDto) {}
