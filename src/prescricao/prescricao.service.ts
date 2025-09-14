/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { prescricao as PrescricaoModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';
import { UpdatePrescricaoDto } from './dto/update-prescricao.dto';
import { CreatePrescricaoCompletaDto } from './dto/create-prescricao-completa.dto';

@Injectable()
export class PrescricaoService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePrescricaoDto): Promise<PrescricaoModel> {
    return this.prisma.prescricao.create({ data: dto });
  }

  async createCompleta(
    dto: CreatePrescricaoCompletaDto,
    currentUserId?: number,
  ) {
    // Cria a prescrição e os itens (medicamentoprescricao) em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      const p = await tx.prescricao.create({
        data: {
          id_morador: dto.id_morador,
          id_medico: dto.id_medico,
          mes: dto.mes,
          ano: dto.ano,
        },
      });

      if (dto.itens && dto.itens.length) {
        await tx.medicamentoprescricao.createMany({
          data: dto.itens.map((i) => ({
            id_prescricao: p.id_prescricao,
            id_medicamento: i.id_medicamento,
            posologia: i.posologia,
            ...(currentUserId ? { id_usuario: currentUserId } : {}),
          })),
        });
      }

      // Retorna já com os relacionamentos principais
      return tx.prescricao.findUnique({
        where: { id_prescricao: p.id_prescricao },
        include: {
          morador: { select: { nome_completo: true } },
          medico: { select: { nome_completo: true } },
          medicamentoprescricao: {
            include: {
              medicamento: true,
              usuario: true,
            },
          },
        },
      });
    });

    return result;
  }

  async findAll(
    params: { page?: number; limit?: number; id_morador?: number } = {},
  ): Promise<{
    data: Array<
      PrescricaoJoin & {
        aplicador: string | null;
        data_hora_aplicacao: string | null;
      }
    >;
    total: number;
    page: number;
    lastPage: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = params.id_morador
      ? { id_morador: params.id_morador }
      : undefined;
    const data = (await this.prisma.prescricao.findMany({
      skip,
      take: limit,
      where,
      orderBy: { id_prescricao: 'desc' },
      include,
    })) as unknown as PrescricaoJoin[];
    const total = (await this.prisma.prescricao.count({ where })) as number;

    // Enriquecer com aplicador e data/hora da última administração
    const enhanced = data.map((p) => {
      // Encontrar a última aplicação dentre todos os itens de medicamentoprescricao
      let latest: {
        data_hora?: Date | string;
        usuario?: UsuarioBasic;
      } | null = null;
      if (Array.isArray(p.medicamentoprescricao)) {
        for (const mp of p.medicamentoprescricao) {
          const meds = mp.medicacao;
          if (Array.isArray(meds) && meds.length > 0) {
            const med = meds[0]; // já vem ordenado desc e com take:1
            const dh = med?.data_hora;
            const prev = latest?.data_hora
              ? new Date(latest.data_hora).getTime()
              : -Infinity;
            const cur = dh ? new Date(dh).getTime() : -Infinity;
            if (cur > prev) {
              latest = { data_hora: dh, usuario: med.usuario ?? undefined };
            }
          }
        }
      }

      let aplicador: string | null = null;
      let data_hora_aplicacao: string | null = null;
      if (latest) {
        const u = latest.usuario;
        if (u) {
          aplicador = u.nome_usuario ?? u.nome_completo ?? u.nome ?? null;
        }
        if (latest.data_hora) {
          const dt = new Date(latest.data_hora);
          if (!isNaN(dt.getTime())) data_hora_aplicacao = dt.toISOString();
        }
      }

      return {
        ...p,
        aplicador,
        data_hora_aplicacao,
      };
    });

    return { data: enhanced, total, page, lastPage: Math.ceil(total / limit) };
  }

  findOne(id: number): Promise<PrescricaoJoin | null> {
    return this.prisma.prescricao.findUnique({
      where: { id_prescricao: id },
      include: {
        medicamentoprescricao: {
          include: { medicamento: true },
        },
        medico: true,
        morador: true,
      },
    }) as unknown as Promise<PrescricaoJoin | null>;
  }

  async update(id: number, dto: UpdatePrescricaoDto): Promise<PrescricaoModel> {
    const exists = await this.prisma.prescricao.findUnique({
      where: { id_prescricao: id },
    });
    if (!exists) throw new NotFoundException('Prescrição não encontrada');
    return this.prisma.prescricao.update({
      where: { id_prescricao: id },
      data: dto,
    });
  }

  async remove(id: number): Promise<PrescricaoModel> {
    const exists = await this.prisma.prescricao.findUnique({
      where: { id_prescricao: id },
    });
    if (!exists) throw new NotFoundException('Prescrição não encontrada');
    return this.prisma.prescricao.delete({ where: { id_prescricao: id } });
  }

  // GET analítico (forma "linha a linha" por medicamento-prescrição), equivalente ao SQL fornecido
  async findAnalitico(
    params: {
      page?: number;
      limit?: number;
      id_morador?: number;
      id_prescricao?: number;
    } = {},
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const where: Record<string, unknown> = {};
    if (params.id_morador) (where as any).id_morador = params.id_morador;
    if (params.id_prescricao)
      (where as any).id_prescricao = params.id_prescricao;

    // Busca as prescrições com todos os relacionamentos necessários
    const list = await this.prisma.prescricao.findMany({
      where: Object.keys(where).length ? (where as any) : undefined,
      orderBy: { id_prescricao: 'desc' },
      include: {
        morador: { select: { nome_completo: true } },
        medico: { select: { nome_completo: true } },
        medicamentoprescricao: {
          include: {
            medicamento: {
              select: { id_medicamento: true, nome_medicamento: true },
            },
            usuario: { select: { nome_usuario: true, nome_completo: true } }, // vinculado_por
            medicacao: {
              take: 1,
              orderBy: { data_hora: 'desc' },
              include: {
                usuario: {
                  select: { nome_usuario: true, nome_completo: true },
                },
              }, // aplicador
            },
          },
        },
      },
    });

    // Achata no formato desejado (1 linha por medicamento-prescrição)
    const flat: Array<RowAnalitico> = [];
    for (const p of list) {
      const morador_nome = p.morador?.nome_completo ?? null;
      const medico_nome = p.medico?.nome_completo ?? null;
      if (
        Array.isArray(p.medicamentoprescricao) &&
        p.medicamentoprescricao.length
      ) {
        for (const mp of p.medicamentoprescricao) {
          const vinculoUser = mp.usuario;
          const vinculado_por =
            vinculoUser?.nome_usuario ?? vinculoUser?.nome_completo ?? null;
          const ultimaAplic = mp.medicacao?.[0];
          let aplicacao_data_hora: string | null = null;
          if (ultimaAplic?.data_hora) {
            const dt = new Date(ultimaAplic.data_hora as unknown as string);
            if (!isNaN(dt.getTime())) aplicacao_data_hora = dt.toISOString();
          }
          const aplicadorUser = ultimaAplic?.usuario ?? null;
          const aplicador =
            aplicadorUser?.nome_usuario ?? aplicadorUser?.nome_completo ?? null;
          flat.push({
            id_prescricao: p.id_prescricao,
            mes: p.mes,
            ano: p.ano,
            morador_nome,
            medico_nome,
            nome_medicamento: mp.medicamento?.nome_medicamento ?? null,
            posologia: mp.posologia,
            vinculado_por,
            aplicacao_data_hora,
            aplicador,
            id_medicamento_prescricao: mp.id_medicamento_prescricao,
            id_medicamento: mp.medicamento?.id_medicamento ?? null,
          });
        }
      } else {
        // Prescrição sem itens ainda — opcionalmente incluir uma linha vazia
        flat.push({
          id_prescricao: p.id_prescricao,
          mes: p.mes,
          ano: p.ano,
          morador_nome,
          medico_nome,
          nome_medicamento: null,
          posologia: null,
          vinculado_por: null,
          aplicacao_data_hora: null,
          aplicador: null,
          id_medicamento_prescricao: null,
          id_medicamento: null,
        });
      }
    }

    const total = flat.length;
    const lastPage = Math.max(1, Math.ceil(total / (limit || 1)));
    const pageSafe = Math.min(Math.max(1, page), lastPage);
    const start = (pageSafe - 1) * limit;
    const data = flat.slice(start, start + limit);

    return { data, total, page: pageSafe, lastPage };
  }
}

// Tipos auxiliares locais para os includes usados acima
type UsuarioBasic = {
  nome_usuario?: string | null;
  nome_completo?: string | null;
  nome?: string | null;
};

type PrescricaoJoin = {
  id_prescricao: number;
  id_morador: number;
  id_medico: number;
  mes: string;
  ano: string;
  medicamentoprescricao?: Array<{
    id_medicamento_prescricao: number;
    medicacao?: Array<{
      data_hora: Date | string;
      usuario?: UsuarioBasic | null;
    }> | null;
    medicamento?: unknown;
  }> | null;
  medico?: { nome_completo?: string | null } | null;
  morador?: { nome_completo?: string | null } | null;
};

type RowAnalitico = {
  id_prescricao: number;
  mes: string;
  ano: string;
  morador_nome: string | null;
  medico_nome: string | null;
  nome_medicamento: string | null;
  posologia: string | null;
  vinculado_por: string | null;
  aplicacao_data_hora: string | null; // ISO
  aplicador: string | null;
  id_medicamento_prescricao: number | null;
  id_medicamento: number | null;
};

const include = {
  medicamentoprescricao: {
    include: {
      medicamento: true,
      medicacao: {
        take: 1,
        orderBy: { data_hora: 'desc' as const },
        include: { usuario: true },
      },
    },
  },
  medico: true,
  morador: true,
} as const;
