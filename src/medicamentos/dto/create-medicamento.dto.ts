import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicamentoDto {
  @ApiProperty({ example: 'Dipirona', description: 'Nome do medicamento' })
  @IsNotEmpty()
  @IsString()
  nome_medicamento: string;

  @ApiProperty({
    example: true,
    description: 'Situação do medicamento (ativo/inativo)',
  })
  @IsNotEmpty()
  @IsBoolean()
  situacao: boolean;
}
