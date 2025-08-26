import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentosService } from './medicamentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  medicamento: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('MedicamentosService', () => {
  let service: MedicamentosService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicamentosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<MedicamentosService>(MedicamentosService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um medicamento novo', async () => {
      prisma.medicamento.findFirst.mockResolvedValue(null);
      prisma.medicamento.create.mockResolvedValue({
        id_medicamento: 1,
        nome_medicamento: 'Dipirona',
        situacao: true,
      });
      const result = await service.create({
        nome_medicamento: 'Dipirona',
        situacao: true,
      });
      expect(result).toHaveProperty('id_medicamento');
      expect(prisma.medicamento.create).toHaveBeenCalled();
    });
    it('deve lançar erro se medicamento já existir', async () => {
      prisma.medicamento.findFirst.mockResolvedValue({ id_medicamento: 1 });
      await expect(
        service.create({ nome_medicamento: 'Dipirona', situacao: true }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os medicamentos', async () => {
      const mockMedicamentos = [
        { id_medicamento: 1, nome_medicamento: 'Test', situacao: true },
      ];
      const mockCount = 1;

      prismaMock.$transaction.mockResolvedValue([mockMedicamentos, mockCount]);

      const result = await service.findAll(1, 10, {});
      expect(result.data).toEqual([
        { id_medicamento: 1, nome_medicamento: 'Test', situacao: true },
      ]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um medicamento pelo id', async () => {
      const mockMedicamento = {
        id_medicamento: 1,
        nome_medicamento: 'Test',
        situacao: true,
      };
      prisma.medicamento.findUnique.mockResolvedValue(mockMedicamento);
      const result = await service.findOne(1);
      expect(result).toEqual({
        id_medicamento: 1,
        nome_medicamento: 'Test',
        situacao: true,
        message: 'Medicamento encontrado com sucesso.',
      });
    });
    it('deve lançar erro se não encontrar', async () => {
      prisma.medicamento.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um medicamento existente', async () => {
      prisma.medicamento.findUnique.mockResolvedValue({ id_medicamento: 1 });
      prisma.medicamento.update.mockResolvedValue({
        id_medicamento: 1,
        nome_medicamento: 'Novo',
        situacao: false,
      });
      const result = await service.update(1, {
        nome_medicamento: 'Novo',
        situacao: false,
      });
      expect(result).toHaveProperty('nome_medicamento', 'Novo');
    });
    it('deve lançar erro se não encontrar para atualizar', async () => {
      prisma.medicamento.findUnique.mockResolvedValue(null);
      await expect(
        service.update(1, { nome_medicamento: 'Novo', situacao: false }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um medicamento existente', async () => {
      const mockMedicamento = {
        id_medicamento: 1,
        nome_medicamento: 'Test',
        situacao: true,
      };
      prisma.medicamento.findUnique.mockResolvedValue(mockMedicamento);
      prisma.medicamento.delete.mockResolvedValue(mockMedicamento);
      const result = await service.remove(1);
      expect(result).toEqual({
        id_medicamento: 1,
        nome_medicamento: 'Test',
        situacao: true,
        message: 'Medicamento removido com sucesso.',
      });
    });
    it('deve lançar erro se não encontrar para remover', async () => {
      prisma.medicamento.findUnique.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
