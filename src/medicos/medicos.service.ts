import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { Prisma } from '@prisma/client';

@Injectable()
export class MedicosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMedicoDto: CreateMedicoDto, id_usuario: number) {
    const { id_usuario: _, ...dados } = createMedicoDto;
    // Verifica se já existe CRM
    const crmExistente = await this.prisma.medico.findUnique({
      where: { crm: dados.crm },
    });
    if (crmExistente) {
      throw new Error('Já existe um médico cadastrado com este CRM.');
    }
    return await this.prisma.medico.create({
      data: {
        ...dados,
        usuario: {
          connect: { id_usuario },
        },
      },
    });
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
    const medico = await this.prisma.medico.findUnique({
      where: { id_medico: Number(id) },
    });
    if (!medico) {
      throw new NotFoundException(`Médico com ID ${id} não encontrado.`);
    }
    return medico;
  }

  // ...existing code...
  // ...existing code...

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
