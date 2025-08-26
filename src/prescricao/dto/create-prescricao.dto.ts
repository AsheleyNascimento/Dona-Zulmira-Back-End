import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreatePrescricaoDto {
  @ApiProperty({ example: 1, description: 'ID do morador' })
  @IsNotEmpty({ message: 'O ID do morador não pode estar vazio.' })
  @IsInt({ message: 'O ID do morador deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do morador deve ser um número positivo.' })
  id_morador: number;

  @ApiProperty({ example: 1, description: 'ID do médico' })
  @IsNotEmpty({ message: 'O ID do médico não pode estar vazio.' })
  @IsInt({ message: 'O ID do médico deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do médico deve ser um número positivo.' })
  id_medico: number;

  @ApiProperty({ example: '06', description: 'Mês da prescrição' })
  @IsNotEmpty({ message: 'O mês não pode estar vazio.' })
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'O mês deve estar no formato MM (01-12).' })
  mes: string;

  @ApiProperty({ example: '2025', description: 'Ano da prescrição' })
  @IsNotEmpty({ message: 'O ano não pode estar vazio.' })
  @Length(4, 4, { message: 'O ano deve ter 4 dígitos.' })
  ano: string;
}
