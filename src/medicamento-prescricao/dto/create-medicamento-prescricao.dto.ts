import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateMedicamentoPrescricaoDto {
  @ApiProperty({ example: 1, description: 'ID do medicamento' })
  @IsNotEmpty({ message: 'O ID do medicamento não pode ser vazio.' })
  @IsInt({ message: 'O ID do medicamento deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do medicamento deve ser um número positivo.' })
  id_medicamento: number;

  @ApiProperty({ example: 1, description: 'ID da prescrição' })
  @IsNotEmpty({ message: 'O ID da prescrição não pode ser vazio.' })
  @IsInt({ message: 'O ID da prescrição deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID da prescrição deve ser um número positivo.' })
  id_prescricao: number;

  @ApiProperty({ example: '1 comprimido a cada 8h', description: 'Posologia do medicamento' })
  @IsNotEmpty({ message: 'A posologia não pode ser vazia.' })
  @IsString({ message: 'A posologia deve ser um texto.' })
  posologia: string;
}
