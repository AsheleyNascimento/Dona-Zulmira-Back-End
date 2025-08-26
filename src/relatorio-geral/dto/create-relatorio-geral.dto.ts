import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateRelatorioGeralDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_evolucao_individual: number;

  @ApiProperty({ example: '2025-06-26T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  data_hora?: string;

  @ApiProperty({ example: 'Observações do relatório' })
  @IsString()
  observacoes: string;
}
