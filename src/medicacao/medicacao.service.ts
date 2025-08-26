import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicacaoDto } from './dto/create-medicacao.dto';
import { UpdateMedicacaoDto } from './dto/update-medicacao.dto';

@Injectable()
export class MedicacaoService {
  constructor(private readonly prisma: PrismaService) {}

   create(dto: CreateMedicacaoDto & { id_usuario: number }) {
    return this.prisma.medicacao.create({ data: dto });
  }

  async findAll(page = 1, limit = 10, dataInicio?: string, dataFim?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (dataInicio || dataFim) {
      where.data_hora = {};
      if (dataInicio) where.data_hora.gte = new Date(dataInicio);
      if (dataFim) where.data_hora.lte = new Date(dataFim);
    }
    const [data, total] = await Promise.all([
      this.prisma.medicacao.findMany({
        skip,
        take: limit,
        where,
        include: { medicamentoprescricao: true, usuario: true },
      }),
      this.prisma.medicacao.count({ where }),
    ]);
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.prisma.medicacao.findUnique({
      where: { id_medicacao: id },
      include: { medicamentoprescricao: true, usuario: true },
    });
  }

  async update(id: number, dto: UpdateMedicacaoDto) {
    const exists = await this.prisma.medicacao.findUnique({ where: { id_medicacao: id } });
    if (!exists) throw new NotFoundException('Medicação não encontrada');
    return this.prisma.medicacao.update({ where: { id_medicacao: id }, data: dto });
  }

  async remove(id: number) {
    const exists = await this.prisma.medicacao.findUnique({ where: { id_medicacao: id } });
    if (!exists) throw new NotFoundException('Medicação não encontrada');
    return this.prisma.medicacao.delete({ where: { id_medicacao: id } });
  }
}
