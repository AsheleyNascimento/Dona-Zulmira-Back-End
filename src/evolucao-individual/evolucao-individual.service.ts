import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvolucaoIndividualDto } from './dto/create-evolucao-individual.dto';
import { UpdateEvolucaoIndividualDto } from './dto/update-evolucao-individual.dto';

@Injectable()
export class EvolucaoIndividualService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeObservacoes(texto: string): string {
    if (!texto) return texto;
    const MAX = 1000;
    if (texto.length > MAX) {
      return texto.slice(0, MAX);
    }
    return texto;
  }

  async create(createDto: CreateEvolucaoIndividualDto, userId: number) {
    // Validação de existência do morador
    const morador = await this.prisma.morador.findUnique({ where: { id_morador: createDto.id_morador } });
    if (!morador) {
      throw new NotFoundException('Morador não encontrado para cadastro da evolução.');
    }
    const observacoesSanit = this.sanitizeObservacoes(createDto.observacoes);
    return this.prisma.evolucaoindividual.create({
      data: {
        id_morador: createDto.id_morador,
        observacoes: observacoesSanit,
        id_usuario: userId,
      },
    });
  }

  async findAll(params: { page?: number; limit?: number; id_morador?: number; id_usuario?: number; data_inicio?: string; data_fim?: string; observacoes?: string }) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 10;
  const skip = (page - 1) * limit;
      const where: any = {};
      if (params.id_morador) where.id_morador = Number(params.id_morador);
      if (params.id_usuario) where.id_usuario = Number(params.id_usuario);
    if (params.data_inicio || params.data_fim) {
      where.data_hora = {};
      if (params.data_inicio) where.data_hora.gte = new Date(params.data_inicio);
      if (params.data_fim) where.data_hora.lte = new Date(params.data_fim);
    }
    if (params.observacoes) {
      where.observacoes = { contains: params.observacoes };
    }
      const [data, total] = await this.prisma.$transaction([
        this.prisma.evolucaoindividual.findMany({
          skip: Number(skip),
          take: Number(limit),
          where,
          include: {
            usuario: { select: { nome_usuario: true } },
            morador: { select: { nome_completo: true } }
          }
        }),
        this.prisma.evolucaoindividual.count({ where }),
      ]);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const evolucao = await this.prisma.evolucaoindividual.findUnique({
      where: { id_evolucao_individual: id },
      include: {
        morador: { select: { nome_completo: true } },
        usuario: { select: { nome_usuario: true } },
      },
    });
    if (!evolucao) throw new NotFoundException('Evolução individual não encontrada.');
    return evolucao;
  }

  async update(id: number, updateDto: UpdateEvolucaoIndividualDto) {
    const evolucao = await this.prisma.evolucaoindividual.findUnique({ where: { id_evolucao_individual: id } });
    if (!evolucao) throw new NotFoundException('Evolução individual não encontrada.');
    const dataUpdate: any = { ...updateDto };
    if (dataUpdate.observacoes) {
      dataUpdate.observacoes = this.sanitizeObservacoes(dataUpdate.observacoes);
    }
    const updated = await this.prisma.evolucaoindividual.update({ where: { id_evolucao_individual: id }, data: dataUpdate });
    return {
      message: 'Evolução individual atualizada com sucesso.',
      evolucao: updated,
    };
  }

  async remove(id: number) {
    const evolucao = await this.prisma.evolucaoindividual.findUnique({ where: { id_evolucao_individual: id } });
    if (!evolucao) throw new NotFoundException('Evolução individual não encontrada.');
    await this.prisma.evolucaoindividual.delete({ where: { id_evolucao_individual: id } });
    return { message: 'Evolução individual removida com sucesso.' };
  }
}
