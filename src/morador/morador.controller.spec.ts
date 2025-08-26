import { Test, TestingModule } from '@nestjs/testing';
import { MoradorController } from './morador.controller';
import { MoradorService } from './morador.service';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';

describe('MoradorController', () => {
  let controller: MoradorController;

  const mockMoradorService = {
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
      controllers: [MoradorController],
      providers: [
        {
          provide: MoradorService,
          useValue: mockMoradorService,
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockAuthTokenGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<MoradorController>(MoradorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
