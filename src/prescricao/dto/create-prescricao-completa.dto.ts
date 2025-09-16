import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PrescricaoItemDto {
  @ApiProperty({ example: 1, description: 'ID do medicamento' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id_medicamento!: number;

  @ApiProperty({ example: '1 cp 12/12h por 7 dias', description: 'Posologia' })
  @IsNotEmpty()
  @IsString()
  posologia!: string;
}

export class CreatePrescricaoCompletaDto {
  @ApiProperty({ example: 1, description: 'ID do morador' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id_morador!: number;

  @ApiProperty({ example: 1, description: 'ID do médico' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id_medico!: number;

  @ApiProperty({ example: '06', description: 'Mês (MM)' })
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/)
  mes!: string;

  @ApiProperty({ example: '2025', description: 'Ano (YYYY)' })
  @IsNotEmpty()
  @Length(4, 4)
  ano!: string;

  @ApiProperty({ type: [PrescricaoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescricaoItemDto)
  itens!: PrescricaoItemDto[];
}
