import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let hashingService: HashingService;
  let jwtService: JwtService;

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockHashingService = {
    comparePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockJwtConfig = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    accessTokenTtl: 3600,
    refreshTokenTtl: 86400,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const validUser = {
      id_usuario: 1,
      nome_usuario: 'testuser',
      email: 'test@example.com',
      senha_hash: 'hashed_password',
      funcao: 'Administrador',
      situacao: true,
    };

    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(validUser);
      mockHashingService.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.login(loginDto);

      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: {
          id_usuario: true,
          nome_usuario: true,
          email: true,
          senha_hash: true,
          funcao: true,
          situacao: true,
        },
      });
      expect(hashingService.comparePassword).toHaveBeenCalledWith(
        loginDto.senha,
        validUser.senha_hash,
      );
      expect(result).toHaveProperty('accessToken', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        senha: 'password123',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Pessoa não autorizada!',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...validUser, situacao: false };
      const loginDto: LoginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Usuário não autorizado!',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        senha: 'wrongpassword',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(validUser);
      mockHashingService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow('Senha inválida!');
    });

    it('should throw UnauthorizedException when user has no email', async () => {
      const userWithoutEmail = { ...validUser, email: null };
      const loginDto: LoginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(userWithoutEmail);
      mockHashingService.comparePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Usuário sem e-mail cadastrado!',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const validUser = {
        id_usuario: 1,
        nome_usuario: 'testuser',
        email: 'test@example.com',
        funcao: 'Administrador',
        situacao: true,
      };

      const decodedToken = {
        sub: 1,
        email: 'test@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);
      mockPrismaService.usuario.findUnique.mockResolvedValue(validUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.refreshTokens(refreshTokenDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        expect.any(Object),
      );
      expect(result).toHaveProperty('accessToken', 'new_access_token');
      expect(result).toHaveProperty('refreshToken', 'new_refresh_token');
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid_refresh_token',
      };

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found during refresh', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const decodedToken = {
        sub: 999,
        email: 'nonexistent@example.com',
      };

      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
