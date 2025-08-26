import { IsInt, IsString } from 'class-validator';

export class CreateEvolucaoIndividualDto {
  @IsInt()
  id_morador: number;

  @IsString()
  observacoes: string;
}
