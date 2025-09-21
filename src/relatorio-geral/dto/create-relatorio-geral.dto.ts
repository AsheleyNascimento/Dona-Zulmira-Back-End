import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString, IsArray, ArrayMinSize, IsDefined, ValidateIf } from 'class-validator';

export class CreateRelatorioGeralDto {
  /**
   * Campo LEGADO (fase de transição). Será removido quando a migração N:N estiver consolidada.
   */
  @ApiProperty({ example: 1, required: false, description: 'LEGADO: usar ids_evolucoes no lugar.' })
  @ValidateIf((o) => !o.ids_evolucoes || o.ids_evolucoes.length === 0)
  @IsInt()
  @IsOptional()
  id_evolucao_individual?: number;

  @ApiProperty({ example: [1, 2, 3], required: false, description: 'Lista de IDs de evoluções individuais que compõem o relatório.' })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @ValidateIf((o) => o.id_evolucao_individual === undefined)
  @IsOptional() // opcional aqui, mas validado via ValidateIf + ArrayMinSize
  ids_evolucoes?: number[];

  @ApiProperty({ example: '2025-06-26T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  data_hora?: string;

  @ApiProperty({ example: 'Observações do relatório' })
  @IsString()
  observacoes: string;
}
