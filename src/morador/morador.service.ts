import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de que o caminho está correto
import { CreateMoradorDto } from './dto/create-morador.dto';
import { UpdateMoradorDto } from './dto/update-morador.dto';

@Injectable()
export class MoradorService {
  constructor(private prisma: PrismaService) {}

  async create(createMoradorDto: CreateMoradorDto, id_usuario: number) {
    try {
      // Verifica se o CPF já está cadastrado
      const existingMorador = await this.prisma.morador.findUnique({
        where: { cpf: createMoradorDto.cpf },
      });

      if (existingMorador) {
        throw new ConflictException('CPF já cadastrado para outro morador.');
      }

      // Só adiciona data_cadastro se vier no DTO
      const data: any = { ...createMoradorDto };
      if (createMoradorDto.data_cadastro) {
        data.data_cadastro = new Date(createMoradorDto.data_cadastro);
      } else {
        delete data.data_cadastro;
      }

      return await this.prisma.morador.create({
        data: {
          ...data,
          usuario: {
            connect: { id_usuario },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: { nome_completo?: string; cpf?: string; situacao?: boolean },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.nome_completo)
      where.nome_completo = {
        contains: filters.nome_completo,
        mode: 'insensitive',
      };
    if (filters?.cpf) where.cpf = filters.cpf;

    const [moradores, total] = await this.prisma.$transaction([
      this.prisma.morador.findMany({
        skip,
        take: limit,
        where,
        include: {
          usuario: {
            select: { cpf: true },
          },
        },
      }),
      this.prisma.morador.count({ where }),
    ]);
    return {
      data: moradores.map((morador) => ({
        ...morador,
        cpf_usuario_cadastro: morador.usuario?.cpf,
        usuario: undefined,
      })),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const morador = await this.prisma.morador.findUnique({
      where: { id_morador: id },
      include: {
        usuario: {
          select: {
            cpf: true,
          },
        },
      },
    });
    if (!morador) {
      throw new NotFoundException(`Morador com ID ${id} não encontrado.`);
    }
    // Mapeia para trazer o cpf_usuario_cadastro no root do objeto
    return {
      ...morador,
      cpf_usuario_cadastro: morador.usuario?.cpf,
      usuario: undefined,
    };
  }

  async update(id: number, updateMoradorDto: UpdateMoradorDto) {
    const morador = await this.prisma.morador.findUnique({
      where: { id_morador: id },
    });

    if (!morador) {
      throw new NotFoundException(
        `Morador com ID ${id} não encontrado para atualização.`,
      );
    }

    // Se 'data_cadastro' for atualizado, convertê-lo para Date
    const data: any = { ...updateMoradorDto };
    if (updateMoradorDto.data_cadastro) {
      data.data_cadastro = new Date(updateMoradorDto.data_cadastro);
    }
    // Remove qualquer referência a id_usuario
    delete data.id_usuario;

    return this.prisma.morador.update({
      where: { id_morador: id },
      data,
    });
  }

  async remove(id: number) {
    const morador = await this.prisma.morador.findUnique({
      where: { id_morador: id },
    });

    if (!morador) {
      throw new NotFoundException(
        `Morador com ID ${id} não encontrado para remoção.`,
      );
    }

    return this.prisma.morador.delete({
      where: { id_morador: id },
    });
  }
}
