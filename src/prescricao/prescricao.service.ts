import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';
import { UpdatePrescricaoDto } from './dto/update-prescricao.dto';

@Injectable()
export class PrescricaoService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePrescricaoDto) {
    return this.prisma.prescricao.create({ data: dto });
  }

  async findAll(params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.prescricao.findMany({
        skip,
        take: limit,
        include: { medicamentoprescricao: true, medico: true, morador: true },
      }),
      this.prisma.prescricao.count(),
    ]);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  findOne(id: number) {
    return this.prisma.prescricao.findUnique({
      where: { id_prescricao: id },
      include: { medicamentoprescricao: true, medico: true, morador: true },
    });
  }

  async update(id: number, dto: UpdatePrescricaoDto) {
    const exists = await this.prisma.prescricao.findUnique({ where: { id_prescricao: id } });
    if (!exists) throw new NotFoundException('Prescrição não encontrada');
    return this.prisma.prescricao.update({ where: { id_prescricao: id }, data: dto });
  }

  async remove(id: number) {
    const exists = await this.prisma.prescricao.findUnique({ where: { id_prescricao: id } });
    if (!exists) throw new NotFoundException('Prescrição não encontrada');
    return this.prisma.prescricao.delete({ where: { id_prescricao: id } });
  }
}
