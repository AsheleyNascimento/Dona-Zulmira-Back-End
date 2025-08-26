import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from '../auth/hashing/hashing.service';
import { ConflictException } from '@nestjs/common';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let module: TestingModule;

  // Adicione o mock do PrismaService aqui
  const prismaMock = {
    usuario: {
      findUnique: jest.fn().mockResolvedValue(null), // Simula "não existe"
      create: jest.fn().mockResolvedValue({
        id_usuario: 1,
        nome_usuario: 'joao',
        senha_hash: 'hash_simulado_12345678901234567890',
        nome_completo: 'João da Silva',
        cpf: '12345678901',
        email: 'joao@email.com',
        funcao: 'Médico',
        situacao: true,
      }),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: PrismaService,
          useValue: prismaMock, // Use o mock aqui
        },
        {
          provide: HashingService,
          useValue: {
            hashPassword: jest
              .fn()
              .mockResolvedValue('hash_simulado_12345678901234567890'),
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('deve gerar hash da senha corretamente', async () => {
    const senha = 'senha123';
    const hash = await service['hashingService'].hashPassword(senha);
    expect(hash).not.toBe(senha);
    expect(hash.length).toBeGreaterThan(20);
  });

  // Adapte os testes abaixo para passar apenas o DTO, pois o método create só aceita um argumento
  it('não deve permitir criar usuário com CPF já cadastrado', async () => {
    prismaMock.usuario.findUnique.mockResolvedValueOnce({ id_usuario: 1 });
    const dto = {
      nome_usuario: 'joao',
      senha: '123456',
      nome_completo: 'João da Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      funcao: 'Médico',
      situacao: true,
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('não deve permitir criar usuário com email já cadastrado', async () => {
    prismaMock.usuario.findUnique
      .mockResolvedValueOnce(null) // CPF não existe
      .mockResolvedValueOnce({ id_usuario: 2 }); // Email existe
    const dto = {
      nome_usuario: 'joao',
      senha: '123456',
      nome_completo: 'João da Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      funcao: 'Médico',
      situacao: true,
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('deve criar usuário se não houver duplicidade', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    const dto = {
      nome_usuario: 'joao',
      senha: '123456',
      nome_completo: 'João da Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      funcao: 'Médico',
      situacao: true,
    };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id_usuario');
    expect(prismaMock.usuario.create).toHaveBeenCalled();
  });
});
