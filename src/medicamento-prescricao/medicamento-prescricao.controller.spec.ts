import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentoPrescricaoController } from './medicamento-prescricao.controller';
import { MedicamentoPrescricaoService } from './medicamento-prescricao.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CONFIGURATION } from '../auth/config';

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

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('MedicamentoPrescricaoController', () => {
  let controller: MedicamentoPrescricaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicamentoPrescricaoController],
      providers: [
        MedicamentoPrescricaoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CONFIGURATION('jwt'), useValue: { secret: 'jwt-secret' } },
      ],
    }).compile();

    controller = module.get<MedicamentoPrescricaoController>(MedicamentoPrescricaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
