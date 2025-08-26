import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentoPrescricaoService } from './medicamento-prescricao.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  medicamentoprescricao: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('MedicamentoPrescricaoService', () => {
  let service: MedicamentoPrescricaoService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicamentoPrescricaoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MedicamentoPrescricaoService>(MedicamentoPrescricaoService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call prisma.medicamentoprescricao.create', async () => {
    const dto = { id_medicamento: 1, id_prescricao: 2, posologia: '1x ao dia' };
    prisma.medicamentoprescricao.create.mockResolvedValue({ id_medicamento_prescricao: 1, ...dto });
    const result = await service.create(dto as any);
    expect(prisma.medicamentoprescricao.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual({ id_medicamento_prescricao: 1, ...dto });
  });

  it('findAll should return paginated data', async () => {
    prisma.$transaction.mockResolvedValueOnce([
      [{ id_medicamento_prescricao: 1 }],
      1,
    ]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('lastPage', 1);
  });

  it('findOne should return a medicamentoprescricao', async () => {
    prisma.medicamentoprescricao.findUnique.mockResolvedValue({ id_medicamento_prescricao: 1 });
    const result = await service.findOne(1);
    expect(result).toEqual({ id_medicamento_prescricao: 1 });
  });

  it('update should update and return medicamentoprescricao', async () => {
    prisma.medicamentoprescricao.findUnique.mockResolvedValue({ id_medicamento_prescricao: 1 });
    prisma.medicamentoprescricao.update.mockResolvedValue({ id_medicamento_prescricao: 1, updated: true });
    const result = await service.update(1, { id_medicamento: 2 } as any);
    expect(result).toEqual({ id_medicamento_prescricao: 1, updated: true });
  });

  it('update should throw if not found', async () => {
    prisma.medicamentoprescricao.findUnique.mockResolvedValue(null);
    await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('remove should delete and return medicamentoprescricao', async () => {
    prisma.medicamentoprescricao.findUnique.mockResolvedValue({ id_medicamento_prescricao: 1 });
    prisma.medicamentoprescricao.delete.mockResolvedValue({ id_medicamento_prescricao: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ id_medicamento_prescricao: 1 });
  });

  it('remove should throw if not found', async () => {
    prisma.medicamentoprescricao.findUnique.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
