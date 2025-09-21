import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEvolucaoIndividualDto {
  @IsInt()
  id_morador: number;

  @IsString()
  @MinLength(5, { message: 'Observações deve ter ao menos 5 caracteres.' })
  @MaxLength(1000, { message: 'Observações não pode ultrapassar 1000 caracteres.' })
  observacoes: string;
}
