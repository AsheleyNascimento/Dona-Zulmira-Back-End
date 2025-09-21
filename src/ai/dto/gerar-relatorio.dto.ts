import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class GerarRelatorioDto {
  @IsArray()
  @ArrayNotEmpty()
  ids_evolucoes: number[];

  @IsOptional()
  @IsIn(['resumo', 'detalhado'])
  modo?: 'resumo' | 'detalhado';

  @IsOptional()
  @IsString()
  data_relatorio?: string; // YYYY-MM-DD
}
