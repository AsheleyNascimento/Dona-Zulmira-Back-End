import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';

@Injectable()
export class MedicamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMedicamentoDto: CreateMedicamentoDto) {
    // Verifica se já existe medicamento com o mesmo nome
    const exists = await this.prisma.medicamento.findFirst({
      where: { nome_medicamento: createMedicamentoDto.nome_medicamento },
    });
    if (exists) {
      throw new ConflictException('Medicamento já cadastrado.');
    }
    return this.prisma.medicamento.create({
      data: {
        nome_medicamento: createMedicamentoDto.nome_medicamento,
        situacao: createMedicamentoDto.situacao,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: { nome_medicamento?: string },
  ): Promise<{ data: any[]; total: number; page: number; lastPage: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.nome_medicamento)
      where.nome_medicamento = {
        contains: filters.nome_medicamento,
      };

    const [medicamentos, total] = await this.prisma.$transaction([
      this.prisma.medicamento.findMany({
        skip,
        take: limit,
        where,
      }),
      this.prisma.medicamento.count({ where }),
    ]);
    return {
      data: medicamentos.map(({ id_medicamento, nome_medicamento, situacao }) => ({
        id_medicamento,
        nome_medicamento,
        situacao,
      })),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<any & { message: string }> {
    const medicamento = await this.prisma.medicamento.findUnique({
      where: { id_medicamento: id },
    });
    if (!medicamento) {
      throw new NotFoundException(`Medicamento com ID ${id} não encontrado.`);
    }
    return {
      id_medicamento: medicamento.id_medicamento,
      nome_medicamento: medicamento.nome_medicamento,
      situacao: medicamento.situacao,
      message: 'Medicamento encontrado com sucesso.',
    };
  }

  async update(id: number, updateMedicamentoDto: UpdateMedicamentoDto) {
    const medicamento = await this.prisma.medicamento.findUnique({
      where: { id_medicamento: id },
    });
    if (!medicamento) {
      throw new NotFoundException(
        `Medicamento com ID ${id} não encontrado para atualização.`,
      );
    }
    return this.prisma.medicamento.update({
      where: { id_medicamento: id },
      data: updateMedicamentoDto,
    });
  }

  async remove(id: number) {
    const medicamento = await this.prisma.medicamento.findUnique({
      where: { id_medicamento: id },
    });
    if (!medicamento) {
      throw new NotFoundException(
        `Medicamento com ID ${id} não encontrado para remoção.`,
      );
    }
    return {
      ...await this.prisma.medicamento.delete({
        where: { id_medicamento: id },
      }),
      message: `Medicamento removido com sucesso.`,
    };
  }
}
