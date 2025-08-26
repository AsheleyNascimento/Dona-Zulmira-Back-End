import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioGeralController } from './relatorio-geral.controller';
import { RelatorioGeralService } from './relatorio-geral.service';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';

describe('RelatorioGeralController', () => {
  let controller: RelatorioGeralController;

  const mockRelatorioGeralService = {
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
      controllers: [RelatorioGeralController],
      providers: [
        {
          provide: RelatorioGeralService,
          useValue: mockRelatorioGeralService,
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockAuthTokenGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<RelatorioGeralController>(RelatorioGeralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
