import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateMedicacaoDto {
  // O campo 'id_usuario' foi removido deste DTO.
  // O controller já obtém essa informação do token do usuário autenticado,
  // tornando desnecessário e mais seguro não enviá-lo no corpo da requisição.

  @ApiProperty({ example: 1, description: 'ID do medicamento-prescrição' })
  @IsNotEmpty({ message: 'O ID do medicamento-prescrição não pode ser vazio.' })
  @IsInt({ message: 'O ID do medicamento-prescrição deve ser um número inteiro.' })
  @IsPositive({
    message: 'O ID do medicamento-prescrição deve ser um número positivo.',
  })
  id_medicamento_prescricao: number;

  @ApiProperty({
    example: '2025-06-27T08:00:00Z',
    required: false,
    description:
      'Data e hora da administração. Se não for fornecida, usa a data e hora atuais.',
  })
  @IsOptional()
  @IsDate({ message: 'A data e hora devem estar em um formato de data válido.' })
  @Type(() => Date) // Garante a transformação de string para Date
  data_hora?: Date;
}
