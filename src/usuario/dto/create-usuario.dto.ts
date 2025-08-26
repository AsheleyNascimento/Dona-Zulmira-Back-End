/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsBoolean,
  Matches,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { IsCPF } from '../../app/common/validators/cpf.validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nome_usuario: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha: string; // será convertida em senha_hash no backend

  @IsNotEmpty()
  @IsString()
  nome_completo: string;

  @IsNotEmpty()
  @IsCPF({ message: 'CPF inválido.' })
  cpf: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  funcao: string;

  @IsNotEmpty()
  @IsBoolean()
  situacao: boolean;
}
