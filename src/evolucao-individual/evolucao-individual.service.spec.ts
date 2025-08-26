import { Test, TestingModule } from '@nestjs/testing';
import { EvolucaoIndividualService } from './evolucao-individual.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateEvolucaoIndividualDto } from './dto/create-evolucao-individual.dto';
import { UpdateEvolucaoIndividualDto } from './dto/update-evolucao-individual.dto';

describe('EvolucaoIndividualService', () => {
  let service: EvolucaoIndividualService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    morador: {
      findUnique: jest.fn(),
    },
    evolucaoindividual: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvolucaoIndividualService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EvolucaoIndividualService>(EvolucaoIndividualService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateEvolucaoIndividualDto = {
      id_morador: 1,
      observacoes: 'Paciente apresentou melhora',
    };
    const userId = 1;

    it('should create evolucao individual successfully', async () => {
      const mockMorador = { id_morador: 1, nome_morador: 'João' };
      const mockCreatedEvolucao = {
        id_evolucao_individual: 1,
        id_morador: 1,
        observacoes: 'Paciente apresentou melhora',
        id_usuario: 1,
        data_hora: new Date(),
      };

      mockPrismaService.morador.findUnique.mockResolvedValue(mockMorador);
      mockPrismaService.evolucaoindividual.create.mockResolvedValue(
        mockCreatedEvolucao,
      );

      const result = await service.create(createDto, userId);

      expect(prismaService.morador.findUnique).toHaveBeenCalledWith({
        where: { id_morador: createDto.id_morador },
      });
      expect(prismaService.evolucaoindividual.create).toHaveBeenCalledWith({
        data: {
          id_morador: createDto.id_morador,
          observacoes: createDto.observacoes,
          id_usuario: userId,
        },
      });
      expect(result).toEqual(mockCreatedEvolucao);
    });

    it('should throw NotFoundException when morador not found', async () => {
      mockPrismaService.morador.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto, userId)).rejects.toThrow(
        'Morador não encontrado para cadastro da evolução.',
      );

      expect(prismaService.morador.findUnique).toHaveBeenCalledWith({
        where: { id_morador: createDto.id_morador },
      });
      expect(prismaService.evolucaoindividual.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated evolucoes with default pagination', async () => {
      const mockEvolucoes = [
        { id_evolucao_individual: 1, observacoes: 'Teste 1' },
        { id_evolucao_individual: 2, observacoes: 'Teste 2' },
      ];
      const mockCount = 2;

      mockPrismaService.$transaction.mockResolvedValue([
        mockEvolucoes,
        mockCount,
      ]);

      const result = await service.findAll({});

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.evolucaoindividual.findMany({
          skip: 0,
          take: 10,
          where: {},
        }),
        prismaService.evolucaoindividual.count({ where: {} }),
      ]);
      expect(result).toEqual({
        data: mockEvolucoes,
        total: mockCount,
        page: 1,
        lastPage: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const params = {
        page: 2,
        limit: 5,
        id_morador: 1,
        id_usuario: 2,
        observacoes: 'melhora',
      };

      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      await service.findAll(params);

      const expectedWhere = {
        id_morador: 1,
        id_usuario: 2,
        observacoes: { contains: 'melhora' },
      };

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.evolucaoindividual.findMany({
          skip: 5,
          take: 5,
          where: expectedWhere,
        }),
        prismaService.evolucaoindividual.count({ where: expectedWhere }),
      ]);
    });

    it('should apply date filters correctly', async () => {
      const params = {
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
      };

      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      await service.findAll(params);

      const expectedWhere = {
        data_hora: {
          gte: new Date('2024-01-01'),
          lte: new Date('2024-12-31'),
        },
      };

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.evolucaoindividual.findMany({
          skip: 0,
          take: 10,
          where: expectedWhere,
        }),
        prismaService.evolucaoindividual.count({ where: expectedWhere }),
      ]);
    });
  });

  describe('findOne', () => {
    it('should return evolucao when found', async () => {
      const mockEvolucao = {
        id_evolucao_individual: 1,
        observacoes: 'Teste',
        data_hora: new Date(),
      };

      mockPrismaService.evolucaoindividual.findUnique.mockResolvedValue(
        mockEvolucao,
      );

      const result = await service.findOne(1);

      expect(prismaService.evolucaoindividual.findUnique).toHaveBeenCalledWith({
        where: { id_evolucao_individual: 1 },
      });
      expect(result).toEqual(mockEvolucao);
    });

    it('should throw NotFoundException when evolucao not found', async () => {
      mockPrismaService.evolucaoindividual.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Evolução individual não encontrada.',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateEvolucaoIndividualDto = {
      observacoes: 'Observações atualizadas',
    };

    it('should update evolucao successfully', async () => {
      const mockEvolucao = {
        id_evolucao_individual: 1,
        observacoes: 'Original',
      };
      const mockUpdatedEvolucao = {
        id_evolucao_individual: 1,
        observacoes: 'Observações atualizadas',
      };

      mockPrismaService.evolucaoindividual.findUnique.mockResolvedValue(
        mockEvolucao,
      );
      mockPrismaService.evolucaoindividual.update.mockResolvedValue(
        mockUpdatedEvolucao,
      );

      const result = await service.update(1, updateDto);

      expect(prismaService.evolucaoindividual.findUnique).toHaveBeenCalledWith({
        where: { id_evolucao_individual: 1 },
      });
      expect(prismaService.evolucaoindividual.update).toHaveBeenCalledWith({
        where: { id_evolucao_individual: 1 },
        data: updateDto,
      });
      expect(result).toEqual({
        message: 'Evolução individual atualizada com sucesso.',
        evolucao: mockUpdatedEvolucao,
      });
    });
  });

  describe('remove', () => {
    it('should remove evolucao successfully', async () => {
      const mockEvolucao = {
        id_evolucao_individual: 1,
        observacoes: 'Teste',
      };

      mockPrismaService.evolucaoindividual.findUnique.mockResolvedValue(
        mockEvolucao,
      );
      mockPrismaService.evolucaoindividual.delete.mockResolvedValue(
        mockEvolucao,
      );

      const result = await service.remove(1);

      expect(prismaService.evolucaoindividual.findUnique).toHaveBeenCalledWith({
        where: { id_evolucao_individual: 1 },
      });
      expect(prismaService.evolucaoindividual.delete).toHaveBeenCalledWith({
        where: { id_evolucao_individual: 1 },
      });
      expect(result).toEqual({
        message: 'Evolução individual removida com sucesso.',
      });
    });
  });
});
