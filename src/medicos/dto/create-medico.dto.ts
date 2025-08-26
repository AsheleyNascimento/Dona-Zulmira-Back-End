import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  usuario_criacao: string;
}


