import { Test, TestingModule } from '@nestjs/testing';
import { MoradorService } from './morador.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  morador: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('MoradorService', () => {
  let service: MoradorService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoradorService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<MoradorService>(MoradorService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um morador novo', async () => {
      prisma.morador.findUnique.mockResolvedValue(null);
      prisma.morador.create.mockResolvedValue({
        id_morador: 1,
        nome_completo: 'Fulano',
        cpf: '12345678901',
      });
      const result = await service.create(
        {
          nome_completo: 'Fulano',
          data_cadastro: '2025-06-15',
          cpf: '12345678901',
          rg: '1234567',
          situacao: true,
        },
        1,
      );
      expect(result).toHaveProperty('id_morador');
      expect(prisma.morador.create).toHaveBeenCalled();
    });
    it('deve lançar erro se CPF já existir', async () => {
      prisma.morador.findUnique.mockResolvedValue({ id_morador: 1 });
      await expect(
        service.create(
          {
            nome_completo: 'Fulano',
            data_cadastro: '2025-06-15',
            cpf: '12345678901',
            rg: '1234567',
            situacao: true,
          },
          1,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os moradores', async () => {
      const mockMoradores = [{ id_morador: 1 }];
      const mockCount = 1;

      prismaMock.$transaction.mockResolvedValue([mockMoradores, mockCount]);

      const result = await service.findAll();
      expect(result.data).toEqual([{ id_morador: 1, cpf_usuario_cadastro: undefined, usuario: undefined }]);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar um morador pelo id', async () => {
      prisma.morador.findUnique.mockResolvedValue({ id_morador: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id_morador: 1 });
    });
    it('deve lançar erro se não encontrar', async () => {
      prisma.morador.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um morador existente', async () => {
      prisma.morador.findUnique.mockResolvedValue({ id_morador: 1 });
      prisma.morador.update.mockResolvedValue({
        id_morador: 1,
        nome_completo: 'Novo',
      });
      const result = await service.update(1, { nome_completo: 'Novo' });
      expect(result).toHaveProperty('nome_completo', 'Novo');
    });
    it('deve lançar erro se não encontrar para atualizar', async () => {
      prisma.morador.findUnique.mockResolvedValue(null);
      await expect(
        service.update(1, { nome_completo: 'Novo' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um morador existente', async () => {
      prisma.morador.findUnique.mockResolvedValue({ id_morador: 1 });
      prisma.morador.delete.mockResolvedValue({ id_morador: 1 });
      const result = await service.remove(1);
      expect(result).toHaveProperty('id_morador', 1);
    });
    it('deve lançar erro se não encontrar para remover', async () => {
      prisma.morador.findUnique.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
