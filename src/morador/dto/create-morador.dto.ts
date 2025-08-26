import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { IsCPF } from '../../app/common/validators/cpf.validator';

export class CreateMoradorDto {
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  @IsString({ message: 'O nome completo deve ser uma string.' })
  nome_completo: string;

  // id_usuario removido do DTO, será preenchido pelo backend

  @IsOptional()
  // data_cadastro é opcional, se não enviado o banco preenche automaticamente
  data_cadastro?: string;

  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  @IsCPF({ message: 'CPF inválido.' })
  cpf: string;

  @IsNotEmpty({ message: 'O RG é obrigatório.' })
  @IsString({ message: 'O RG deve ser uma string.' })
  rg: string;

  @IsNotEmpty({ message: 'A situação é obrigatória.' })
  @IsBoolean({ message: 'A situação deve ser um booleano.' })
  @Type(() => Boolean)
  situacao: boolean;
}
