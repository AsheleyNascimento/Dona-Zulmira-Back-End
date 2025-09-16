import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicamentoPrescricaoDto } from './dto/create-medicamento-prescricao.dto';
import { UpdateMedicamentoPrescricaoDto } from './dto/update-medicamento-prescricao.dto';

@Injectable()
export class MedicamentoPrescricaoService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMedicamentoPrescricaoDto, userId?: number) {
    return this.prisma.medicamentoprescricao.create({
      data: {
        ...dto,
        ...(userId ? { id_usuario: userId } : {}),
      },
      include: { medicamento: true, prescricao: true, medicacao: true },
    });
  }

  async findAll(params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.medicamentoprescricao.findMany({
        skip,
        take: limit,
        include: { medicamento: true, prescricao: true, medicacao: true },
      }),
      this.prisma.medicamentoprescricao.count(),
    ]);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  findOne(id: number) {
    return this.prisma.medicamentoprescricao.findUnique({
      where: { id_medicamento_prescricao: id },
      include: { medicamento: true, prescricao: true, medicacao: true },
    });
  }

  async update(id: number, dto: UpdateMedicamentoPrescricaoDto) {
    const exists = await this.prisma.medicamentoprescricao.findUnique({ where: { id_medicamento_prescricao: id } });
    if (!exists) throw new NotFoundException('MedicamentoPrescricao não encontrado');
    return this.prisma.medicamentoprescricao.update({ where: { id_medicamento_prescricao: id }, data: dto });
  }

  async remove(id: number) {
    const exists = await this.prisma.medicamentoprescricao.findUnique({ where: { id_medicamento_prescricao: id } });
    if (!exists) throw new NotFoundException('MedicamentoPrescricao não encontrado');
    return this.prisma.medicamentoprescricao.delete({ where: { id_medicamento_prescricao: id } });
  }
}
