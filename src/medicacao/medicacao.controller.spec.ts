import { Test, TestingModule } from '@nestjs/testing';
import { MedicacaoController } from './medicacao.controller';
import { MedicacaoService } from './medicacao.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CONFIGURATION } from '../auth/config';

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

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('MedicacaoController', () => {
  let controller: MedicacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicacaoController],
      providers: [
        MedicacaoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CONFIGURATION('jwt'), useValue: { secret: 'jwt-secret' } },
      ],
    }).compile();

    controller = module.get<MedicacaoController>(MedicacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
