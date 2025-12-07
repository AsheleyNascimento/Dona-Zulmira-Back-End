import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de recuperação enviado por e-mail',
        example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    })
    @IsNotEmpty({ message: 'Token é obrigatório' })
    @IsString()
    token: string;

    @ApiProperty({
        description: 'Nova senha do usuário',
        example: 'NovaSenha@123',
        minLength: 6,
    })
    @IsNotEmpty({ message: 'Nova senha é obrigatória' })
    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    newPassword: string;
}
