import { Test, TestingModule } from '@nestjs/testing';
import { PrescricaoService } from './prescricao.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  prescricao: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('PrescricaoService', () => {
  let service: PrescricaoService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescricaoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PrescricaoService>(PrescricaoService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call prisma.prescricao.create', async () => {
    const dto = { id_morador: 1, id_medico: 2, mes: '06', ano: '2025' };
    prisma.prescricao.create.mockResolvedValue({ id_prescricao: 1, ...dto });
    const result = await service.create(dto as any);
    expect(prisma.prescricao.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual({ id_prescricao: 1, ...dto });
  });

  it('findAll should return paginated data', async () => {
    prisma.$transaction.mockResolvedValueOnce([
      [{ id_prescricao: 1 }],
      1,
    ]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('lastPage', 1);
  });

  it('findOne should return a prescricao', async () => {
    prisma.prescricao.findUnique.mockResolvedValue({ id_prescricao: 1 });
    const result = await service.findOne(1);
    expect(result).toEqual({ id_prescricao: 1 });
  });

  it('update should update and return prescricao', async () => {
    prisma.prescricao.findUnique.mockResolvedValue({ id_prescricao: 1 });
    prisma.prescricao.update.mockResolvedValue({ id_prescricao: 1, updated: true });
    const result = await service.update(1, { id_morador: 2 } as any);
    expect(result).toEqual({ id_prescricao: 1, updated: true });
  });

  it('update should throw if not found', async () => {
    prisma.prescricao.findUnique.mockResolvedValue(null);
    await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('remove should delete and return prescricao', async () => {
    prisma.prescricao.findUnique.mockResolvedValue({ id_prescricao: 1 });
    prisma.prescricao.delete.mockResolvedValue({ id_prescricao: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ id_prescricao: 1 });
  });

  it('remove should throw if not found', async () => {
    prisma.prescricao.findUnique.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
