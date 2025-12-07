import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }
  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        email: loginDto.email,
      },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email: true,
        senha_hash: true, // <-- necessário
        funcao: true,
        situacao: true, // <-- necessário para verificar se o usuário está ativo
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Pessoa não autorizada!');
    }
    if (usuario.situacao !== true) {
      throw new UnauthorizedException('Usuário não autorizado!');
    }

    const passwordIsValid = await this.hashingService.comparePassword(
      loginDto.senha,
      usuario.senha_hash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida!');
    }

    if (!usuario.email) {
      throw new UnauthorizedException('Usuário sem e-mail cadastrado!');
    }
    return this.createTokens({
      id_usuario: usuario.id_usuario,
      nome_usuario: usuario.nome_usuario, // Incluindo o nome do usuário no payload
      funcao: usuario.funcao, // Incluindo a função do usuário no payload
      email: usuario.email,
    });
  }

  private async createTokens(usuario: {
    id_usuario: number;
    nome_usuario: string;
    funcao: string;
    email: string;
  }) {
    const accessTokenPromise = this.signJwtAsync(
      usuario.id_usuario,
      this.jwtConfiguration.jwtTtl,
      {
        nome: usuario.nome_usuario, // Incluindo o nome do usuário no payload
        email: usuario.email,
        funcao: usuario.funcao, // Incluindo a função do usuário no payload
      },
    );

    const refreshTokenPromise = this.signJwtAsync(
      usuario.id_usuario,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
      funcao: usuario.funcao // Inclui a função do usuário na resposta
    };
  }

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );
      const usuario = await this.prisma.usuario.findUnique({
        where: {
          id_usuario: sub,
        },
        select: {
          id_usuario: true,
          nome_usuario: true,
          email: true,
          funcao: true,
          situacao: true, // Verifica se o usuário está ativo
        },
      });

      if (!usuario || usuario.situacao !== true) {
        throw new UnauthorizedException('Usuário não autorizado!');
      }

      if (!usuario.email) {
        throw new UnauthorizedException('Usuário sem e-mail cadastrado!');
      }
      return this.createTokens({
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        funcao: usuario.funcao,
        email: usuario.email,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Busca o usuário pelo e-mail
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id_usuario: true,
        nome_completo: true,
        email: true,
        situacao: true,
      },
    });

    // Por segurança, sempre retornamos sucesso mesmo que o e-mail não exista
    // Isso evita que atacantes descubram quais e-mails estão cadastrados
    if (!usuario || !usuario.situacao) {
      return {
        message:
          'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
      };
    }

    // Gera token único usando crypto
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Define data de expiração (1 hora a partir de agora)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Salva o token e a data de expiração no banco
    await this.prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Envia e-mail com link de recuperação
    try {
      await this.mailService.sendPasswordResetEmail(
        usuario.email,
        resetToken,
        usuario.nome_completo,
      );
    } catch (error) {
      // Se falhar ao enviar e-mail, limpa o token do banco
      await this.prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      throw new BadRequestException(
        'Erro ao enviar e-mail de recuperação. Tente novamente.',
      );
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Busca usuário pelo token
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        passwordResetToken: token,
      },
      select: {
        id_usuario: true,
        passwordResetExpires: true,
        situacao: true,
      },
    });

    if (!usuario) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    if (!usuario.situacao) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    // Verifica se o token expirou
    if (!usuario.passwordResetExpires || new Date() > usuario.passwordResetExpires) {
      // Limpa o token expirado
      await this.prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      throw new BadRequestException('Token expirado. Solicite uma nova recuperação de senha.');
    }

    // Gera hash da nova senha
    const hashedPassword = await this.hashingService.hashPassword(newPassword);

    // Atualiza a senha e limpa o token
    await this.prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        senha_hash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: 'Senha redefinida com sucesso. Você já pode fazer login com a nova senha.',
    };
  }
}
