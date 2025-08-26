import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MedicosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMedicoDto: CreateMedicoDto) {
    return this.prisma.medico.create({ data: createMedicoDto });
  }

  async findAll(name?: string) {
    if (name) {
      return this.prisma.medico.findMany({
        where: {
          nome_completo: {
            contains: name,
          },
        },
      });
    }
    return this.prisma.medico.findMany();
  }

  async findOne(id: number) {
    // Debug log removed before merging to production
    const medico = await this.prisma.medico.findUnique({
      where: { id_medico: Number(id) },
    });
    if (!medico) {
      throw new NotFoundException(`Médico com ID ${id} não encontrado.`);
    }
    return medico;
  }

   async update(id: number, updateMedicoDto: UpdateMedicoDto) {
    return this.prisma.medico.update({
      where: {
        id_medico: id,
      },
      data: updateMedicoDto,
    });
  }

  async remove(id: number) {
    const medico = await this.prisma.medico.findUnique({
      where: { id_medico: id },
    });
    if (!medico) {
      throw new NotFoundException(`Médico com ID ${id} não encontrado.`);
    }
    return this.prisma.medico.delete({
      where: { id_medico: id },
    });
  }
}
