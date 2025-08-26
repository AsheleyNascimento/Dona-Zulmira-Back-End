import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioGeralService } from './relatorio-geral.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RelatorioGeralService', () => {
  let service: RelatorioGeralService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatorioGeralService,
        {
          provide: PrismaService,
          useValue: {
            usuario: { findUnique: jest.fn() },
            evolucaoindividual: { findUnique: jest.fn() },
            relatoriodiariogeral: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<RelatorioGeralService>(RelatorioGeralService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar relatório com sucesso', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 1,
    });
    (prisma.evolucaoindividual.findUnique as jest.Mock).mockResolvedValue({
      id_evolucao_individual: 1,
    });
    (prisma.relatoriodiariogeral.create as jest.Mock).mockResolvedValue({
      id_relatorio_diario_geral: 1,
    });
    const dto = { id_evolucao_individual: 1, observacoes: 'Teste' };
    const result = await service.create(dto as any, 1);
    expect(result.message).toBe('Relatório criado com sucesso');
    expect(prisma.relatoriodiariogeral.create).toHaveBeenCalled();
  });

  it('deve lançar erro se usuário não existir', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      service.create(
        { id_evolucao_individual: 1, observacoes: 'Teste' } as any,
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se evolução não existir', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id_usuario: 1,
    });
    (prisma.evolucaoindividual.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      service.create(
        { id_evolucao_individual: 1, observacoes: 'Teste' } as any,
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve buscar todos com paginação', async () => {
    (prisma.relatoriodiariogeral.findMany as jest.Mock).mockResolvedValue([
      { id_relatorio_diario_geral: 1 },
    ]);
    (prisma.relatoriodiariogeral.count as jest.Mock).mockResolvedValue(1);
    const result = await service.findAll({ page: 1, limit: 1 });
    expect(result.data.length).toBe(1);
    expect(result.total).toBe(1);
  });

  it('deve buscar por id', async () => {
    (prisma.relatoriodiariogeral.findUnique as jest.Mock).mockResolvedValue({
      id_relatorio_diario_geral: 1,
    });
    const result = await service.findOne(1);
    expect(result.id_relatorio_diario_geral).toBe(1);
  });

  it('deve lançar erro se relatório não existir ao buscar por id', async () => {
    (prisma.relatoriodiariogeral.findUnique as jest.Mock).mockResolvedValue(
      null,
    );
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar relatório', async () => {
    (prisma.relatoriodiariogeral.findUnique as jest.Mock).mockResolvedValue({
      id_relatorio_diario_geral: 1,
    });
    (prisma.relatoriodiariogeral.update as jest.Mock).mockResolvedValue({
      id_relatorio_diario_geral: 1,
    });
    const result = await service.update(1, {
      observacoes: 'Atualizado',
    } as any);
    expect(result.message).toBe('Relatório atualizado com sucesso');
  });

  it('deve remover relatório', async () => {
    (prisma.relatoriodiariogeral.findUnique as jest.Mock).mockResolvedValue({
      id_relatorio_diario_geral: 1,
    });
    (prisma.relatoriodiariogeral.delete as jest.Mock).mockResolvedValue({});
    const result = await service.remove(1);
    expect(result.message).toBe('Relatório removido com sucesso');
  });
});
