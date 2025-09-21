import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelatorioGeralDto } from './dto/create-relatorio-geral.dto';
import { UpdateRelatorioGeralDto } from './dto/update-relatorio-geral.dto';

@Injectable()
export class RelatorioGeralService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly MAX_OBS = 8000; // limite lógico de observações

  private sanitizeObservacoes(text?: string) {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= this.MAX_OBS) return trimmed;
    return trimmed.slice(0, this.MAX_OBS);
  }

  async create(createRelatorioGeralDto: CreateRelatorioGeralDto, id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    // Suporte legado (um único id) ou novo (array ids_evolucoes)
    let evolucaoIds: number[] = [];
    if (createRelatorioGeralDto.ids_evolucoes && createRelatorioGeralDto.ids_evolucoes.length > 0) {
      evolucaoIds = [...new Set(createRelatorioGeralDto.ids_evolucoes.map(Number))];
    } else if (createRelatorioGeralDto.id_evolucao_individual) {
      evolucaoIds = [Number(createRelatorioGeralDto.id_evolucao_individual)];
    } else {
      throw new BadRequestException('Informe pelo menos uma evolução (ids_evolucoes ou id_evolucao_individual legado).');
    }

    const evolucoes = await this.prisma.evolucaoindividual.findMany({
      where: { id_evolucao_individual: { in: evolucaoIds } },
      select: { id_evolucao_individual: true },
    });
    if (evolucoes.length !== evolucaoIds.length) {
      throw new NotFoundException('Uma ou mais evoluções não encontradas');
    }

    // Estratégia fase 1: persiste o primeiro ID no campo legado e cria vínculos explícitos na tabela pivot.
    // (Evita qualquer comportamento inesperado do nested create enquanto validamos a migração.)
    const dataRelatorio = await this.prisma.relatoriodiariogeral.create({
      data: {
        id_usuario,
        id_evolucao_individual: evolucaoIds[0], // legado
        data_hora: createRelatorioGeralDto.data_hora ? new Date(createRelatorioGeralDto.data_hora) : undefined,
        observacoes: this.sanitizeObservacoes(createRelatorioGeralDto.observacoes),
      }
    });

    // Cria registros na pivot (incluindo também o primeiro para manter consistência N:N)
    if (evolucaoIds.length > 0) {
      await this.prisma.relatorioEvolucao.createMany({
        data: evolucaoIds.map(id => ({
          id_relatorio_diario_geral: dataRelatorio.id_relatorio_diario_geral,
          id_evolucao_individual: id
        })),
        skipDuplicates: true,
      });
    }

    // Retorna já com include atualizado
    const relatorioCompleto = await this.prisma.relatoriodiariogeral.findUnique({
      where: { id_relatorio_diario_geral: dataRelatorio.id_relatorio_diario_geral },
      include: {
        usuario: { select: { id_usuario: true, nome_completo: true } },
        evolucoes: { include: { evolucao: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true, usuario: { select: { id_usuario: true, nome_completo: true } } } } } }
      }
    });

    return { message: 'Relatório criado com sucesso', relatorio: relatorioCompleto };
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, id_usuario, data_inicio, data_fim } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (id_usuario) where.id_usuario = Number(id_usuario);
    if (data_inicio || data_fim) {
      where.data_hora = {};
      if (data_inicio) where.data_hora.gte = new Date(data_inicio);
      if (data_fim) where.data_hora.lte = new Date(data_fim);
    }
    const [relatorios, total] = await Promise.all([
      this.prisma.relatoriodiariogeral.findMany({
        where,
        include: {
          usuario: { select: { id_usuario: true, nome_completo: true, email: true } },
          evolucoes: { include: { evolucao: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true, usuario: { select: { id_usuario: true, nome_completo: true } } } } } },
        },
        orderBy: { data_hora: 'desc' },
        skip,
        take,
      }),
      this.prisma.relatoriodiariogeral.count({ where }),
    ]);
    return {
      data: relatorios,
      total,
      page: Number(page),
      limit: Number(limit),
      lastPage: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const relatorio = await this.prisma.relatoriodiariogeral.findUnique({
      where: { id_relatorio_diario_geral: id },
      include: {
        usuario: { select: { id_usuario: true, nome_completo: true, email: true } },
        evolucoes: { include: { evolucao: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true, usuario: { select: { id_usuario: true, nome_completo: true } } } } } },
      },
    });
    if (!relatorio) throw new NotFoundException('Relatório não encontrado');
    return relatorio;
  }

  async update(id: number, updateRelatorioGeralDto: UpdateRelatorioGeralDto) {
    const existente = await this.prisma.relatoriodiariogeral.findUnique({ where: { id_relatorio_diario_geral: id } });
    if (!existente) throw new NotFoundException('Relatório não encontrado');

    let evolucaoIds: number[] | undefined = undefined;
    if (updateRelatorioGeralDto.ids_evolucoes) {
      evolucaoIds = [...new Set(updateRelatorioGeralDto.ids_evolucoes.map(Number))];
      const evolucoes = await this.prisma.evolucaoindividual.findMany({ where: { id_evolucao_individual: { in: evolucaoIds } } });
      if (evolucoes.length !== evolucaoIds.length) throw new NotFoundException('Uma ou mais evoluções não encontradas');
    }

    const updated = await this.prisma.relatoriodiariogeral.update({
      where: { id_relatorio_diario_geral: id },
      data: {
        observacoes: updateRelatorioGeralDto.observacoes !== undefined
          ? this.sanitizeObservacoes(updateRelatorioGeralDto.observacoes)
          : existente.observacoes,
        data_hora: updateRelatorioGeralDto.data_hora ? new Date(updateRelatorioGeralDto.data_hora) : existente.data_hora,
        ...(evolucaoIds
          ? {
              evolucoes: {
                deleteMany: {},
                create: evolucaoIds.map(idE => ({ id_evolucao_individual: idE }))
              },
              // mantém compatibilidade do campo legado com o primeiro id
              id_evolucao_individual: evolucaoIds[0]
            }
          : {}),
      },
      include: {
        usuario: { select: { id_usuario: true, nome_completo: true } },
        evolucoes: { include: { evolucao: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true, usuario: { select: { id_usuario: true, nome_completo: true } } } } } }
      }
    });
    return { message: 'Relatório atualizado com sucesso', relatorio: updated };
  }

  async remove(id: number) {
    const relatorio = await this.prisma.relatoriodiariogeral.findUnique({ where: { id_relatorio_diario_geral: id } });
    if (!relatorio) throw new NotFoundException('Relatório não encontrado');
    await this.prisma.relatoriodiariogeral.delete({ where: { id_relatorio_diario_geral: id } });
    return { message: 'Relatório removido com sucesso' };
  }
}
