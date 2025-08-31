import { IsBoolean, IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  nome_completo: string;

  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsBoolean()
  @IsNotEmpty()
  situacao: boolean;

  @IsInt()
  @IsOptional()
  id_usuario?: number;
}


