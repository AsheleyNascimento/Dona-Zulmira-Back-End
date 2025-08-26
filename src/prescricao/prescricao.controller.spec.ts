import { Test, TestingModule } from '@nestjs/testing';
import { PrescricaoController } from './prescricao.controller';
import { PrescricaoService } from './prescricao.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CONFIGURATION } from '../auth/config';

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

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('PrescricaoController', () => {
  let controller: PrescricaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescricaoController],
      providers: [
        PrescricaoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CONFIGURATION('jwt'), useValue: { secret: 'jwt-secret' } },
      ],
    }).compile();

    controller = module.get<PrescricaoController>(PrescricaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
