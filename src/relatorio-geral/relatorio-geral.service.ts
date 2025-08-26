import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelatorioGeralDto } from './dto/create-relatorio-geral.dto';
import { UpdateRelatorioGeralDto } from './dto/update-relatorio-geral.dto';

@Injectable()
export class RelatorioGeralService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRelatorioGeralDto: CreateRelatorioGeralDto, id_usuario: number) {
    // Verifica existência de usuário e evolução individual
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    const evolucao = await this.prisma.evolucaoindividual.findUnique({ where: { id_evolucao_individual: createRelatorioGeralDto.id_evolucao_individual } });
    if (!evolucao) throw new NotFoundException('Evolução individual não encontrada');
    // Cria o relatório
    const relatorio = await this.prisma.relatoriodiariogeral.create({
      data: {
        id_usuario,
        id_evolucao_individual: createRelatorioGeralDto.id_evolucao_individual,
        data_hora: createRelatorioGeralDto.data_hora ? new Date(createRelatorioGeralDto.data_hora) : undefined,
        observacoes: createRelatorioGeralDto.observacoes,
      },
    });
    return { message: 'Relatório criado com sucesso', relatorio };
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
          evolucaoindividual: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true } },
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
        evolucaoindividual: { select: { id_evolucao_individual: true, observacoes: true, data_hora: true } },
      },
    });
    if (!relatorio) throw new NotFoundException('Relatório não encontrado');
    return relatorio;
  }

  async update(id: number, updateRelatorioGeralDto: UpdateRelatorioGeralDto) {
    const relatorio = await this.prisma.relatoriodiariogeral.findUnique({ where: { id_relatorio_diario_geral: id } });
    if (!relatorio) throw new NotFoundException('Relatório não encontrado');
    const updated = await this.prisma.relatoriodiariogeral.update({
      where: { id_relatorio_diario_geral: id },
      data: {
        ...updateRelatorioGeralDto,
        data_hora: updateRelatorioGeralDto.data_hora ? new Date(updateRelatorioGeralDto.data_hora) : undefined,
      },
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
