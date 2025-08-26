import { Test, TestingModule } from '@nestjs/testing';
import { EvolucaoIndividualController } from './evolucao-individual.controller';
import { EvolucaoIndividualService } from './evolucao-individual.service';
import { CreateEvolucaoIndividualDto } from './dto/create-evolucao-individual.dto';
import { UpdateEvolucaoIndividualDto } from './dto/update-evolucao-individual.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';

describe('EvolucaoIndividualController', () => {
  let controller: EvolucaoIndividualController;
  let service: EvolucaoIndividualService;

  const mockEvolucaoIndividualService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthTokenGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvolucaoIndividualController],
      providers: [
        {
          provide: EvolucaoIndividualService,
          useValue: mockEvolucaoIndividualService,
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockAuthTokenGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<EvolucaoIndividualController>(
      EvolucaoIndividualController,
    );
    service = module.get<EvolucaoIndividualService>(EvolucaoIndividualService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create evolucao individual', async () => {
      const createDto: CreateEvolucaoIndividualDto = {
        id_morador: 1,
        observacoes: 'Paciente apresentou melhora',
      };
      const mockReq = { user: { id: 1 } };
      const expectedResult = {
        id_evolucao_individual: 1,
        ...createDto,
        id_usuario: 1,
        data_hora: new Date(),
      };

      mockEvolucaoIndividualService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockReq);

      expect(service.create).toHaveBeenCalledWith(createDto, mockReq.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all evolucoes with pagination', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        lastPage: 1,
      };

      mockEvolucaoIndividualService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should handle query filters', async () => {
      const query = {
        page: 2,
        limit: 5,
        id_morador: 1,
        observacoes: 'melhora',
      };

      mockEvolucaoIndividualService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        lastPage: 1,
      });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return one evolucao individual', async () => {
      const id = 1;
      const expectedResult = {
        id_evolucao_individual: 1,
        observacoes: 'Teste',
        data_hora: new Date(),
      };

      mockEvolucaoIndividualService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(Number(id));
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update evolucao individual', async () => {
      const id = 1;
      const updateDto: UpdateEvolucaoIndividualDto = {
        observacoes: 'Observações atualizadas',
      };
      const expectedResult = {
        id_evolucao_individual: 1,
        observacoes: 'Observações atualizadas',
      };

      mockEvolucaoIndividualService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(Number(id), updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove evolucao individual', async () => {
      const id = 1;
      const expectedResult = {
        id_evolucao_individual: 1,
        observacoes: 'Teste removido',
      };

      mockEvolucaoIndividualService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(Number(id));
      expect(result).toEqual(expectedResult);
    });
  });
});
