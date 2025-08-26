import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'DATABASE_URL':
          return 'postgresql://test:test@localhost:5432/test';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    // Clean up any connections
    if (service) {
      await service.$disconnect();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeDefined();
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$disconnect).toBe('function');
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();

      connectSpy.mockRestore();
    });

    it('should handle connection errors', async () => {
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');

      connectSpy.mockRestore();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue();

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();

      disconnectSpy.mockRestore();
    });

    it('should handle disconnection errors', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockRejectedValue(new Error('Disconnection failed'));

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );

      disconnectSpy.mockRestore();
    });
  });

  describe('database operations', () => {
    it('should have access to all models', () => {
      // Test that the service has access to the main models
      expect(service.usuario).toBeDefined();
      expect(service.morador).toBeDefined();
      expect(service.medicamento).toBeDefined();
      expect(service.evolucaoindividual).toBeDefined();
      expect(service.relatoriodiariogeral).toBeDefined();
    });

    it('should be able to perform raw queries', async () => {
      const rawSpy = jest.spyOn(service, '$queryRaw').mockResolvedValue([]);

      await service.$queryRaw`SELECT 1 as test`;

      expect(rawSpy).toHaveBeenCalled();

      rawSpy.mockRestore();
    });

    it('should be able to perform transactions', async () => {
      const transactionSpy = jest
        .spyOn(service, '$transaction')
        .mockResolvedValue([]);

      await service.$transaction([]);

      expect(transactionSpy).toHaveBeenCalled();

      transactionSpy.mockRestore();
    });
  });
});
