/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsBoolean,
  MinLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { IsCPF } from '../../app/common/validators/cpf.validator';

export enum Funcao {
  ADMINISTRADOR = 'Administrador',
  ENFERMEIRO = 'Enfermeiro',
  TECNICO_ENFERMAGEM = 'Tecnico de Enfermagem',
  CUIDADOR = 'Cuidador',
  MEDICO = 'Medico',
  FARMACEUTICO = 'Farmaceutico',
}

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
  @IsEnum(Funcao)
  funcao: Funcao;

  @IsNotEmpty()
  @IsBoolean()
  situacao: boolean;
}
