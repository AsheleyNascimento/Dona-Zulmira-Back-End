import { Test, TestingModule } from '@nestjs/testing';
import { MedicacaoService } from './medicacao.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  medicacao: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('MedicacaoService', () => {
  let service: MedicacaoService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicacaoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MedicacaoService>(MedicacaoService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call prisma.medicacao.create', async () => {
    const dto = { id_usuario: 1, id_medicamento_prescricao: 2 };
    prisma.medicacao.create.mockResolvedValue({ id_medicacao: 1, ...dto });
    const result = await service.create(dto as any);
    expect(prisma.medicacao.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual({ id_medicacao: 1, ...dto });
  });

  it('findAll should return paginated data', async () => {
    prisma.medicacao.findMany.mockResolvedValue([{ id_medicacao: 1 }]);
    prisma.medicacao.count.mockResolvedValue(1);
    const result = await service.findAll(1, 10);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('lastPage', 1);
  });

  it('findOne should return a medicacao', async () => {
    prisma.medicacao.findUnique.mockResolvedValue({ id_medicacao: 1 });
    const result = await service.findOne(1);
    expect(result).toEqual({ id_medicacao: 1 });
  });

  it('update should update and return medicacao', async () => {
    prisma.medicacao.findUnique.mockResolvedValue({ id_medicacao: 1 });
    prisma.medicacao.update.mockResolvedValue({ id_medicacao: 1, updated: true });
    const result = await service.update(1, { id_usuario: 2 } as any);
    expect(result).toEqual({ id_medicacao: 1, updated: true });
  });

  it('update should throw if not found', async () => {
    prisma.medicacao.findUnique.mockResolvedValue(null);
    await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('remove should delete and return medicacao', async () => {
    prisma.medicacao.findUnique.mockResolvedValue({ id_medicacao: 1 });
    prisma.medicacao.delete.mockResolvedValue({ id_medicacao: 1 });
    const result = await service.remove(1);
    expect(result).toEqual({ id_medicacao: 1 });
  });

  it('remove should throw if not found', async () => {
    prisma.medicacao.findUnique.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
