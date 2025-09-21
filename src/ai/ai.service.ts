import { Injectable, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GerarRelatorioDto } from './dto/gerar-relatorio.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI | null = null;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
    } else {
      // sem chave, rota irá lançar erro ao tentar gerar
    }
  }

  async gerarRelatorio(usuarioId: number, dto: GerarRelatorioDto) {
    if (!this.genAI) throw new InternalServerErrorException('Serviço de IA não configurado');
    const ids = [...new Set(dto.ids_evolucoes.map(Number))];
    if (ids.length === 0) throw new BadRequestException('ids_evolucoes vazio');
    if (ids.length > 30) throw new BadRequestException('Máximo de 30 evoluções por geração');

    // Buscar evoluções e garantir que usuário tem acesso (regra simples: autor é o próprio ou ignorar; adaptar conforme política)
    const evolucoes = await this.prisma.evolucaoindividual.findMany({
      where: { id_evolucao_individual: { in: ids } },
      select: { id_evolucao_individual: true, observacoes: true, data_hora: true, morador: { select: { nome_completo: true } }, id_usuario: true }
    });

    if (evolucoes.length !== ids.length) {
      throw new BadRequestException('Uma ou mais evoluções não encontradas');
    }

    // (Opcional) Regra de autorização simplificada: todas devem pertencer ao mesmo profissional ou ignorar
    const autores = new Set(evolucoes.map(e => e.id_usuario));
    if (autores.size > 1) {
      // permitido, mas poderia ser restringido. Mantemos aviso leve.
    }

    // Montar lista formatada e truncar observações
    const listaFormatada = evolucoes
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
      .map(ev => {
        const d = new Date(ev.data_hora);
        const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const morador = ev.morador?.nome_completo || 'Morador não identificado';
        let obs = (ev.observacoes || '').replace(/\s+/g, ' ').trim();
        if (obs.length > 400) obs = obs.slice(0, 400) + '…';
        return `[${hora}] Morador: ${morador} — ${obs}`;
      })
      .join('\n');

    const dataRelatorioFmt = dto.data_relatorio ? this.formatarData(dto.data_relatorio) : 'Não informada';
    const modo = dto.modo === 'detalhado' ? 'mais detalhado (até ~1500 caracteres)' : 'resumo (~800-1200 caracteres)';

    const prompt = `Você é um profissional de saúde registrando um relatório diário geral institucional.\n\nDados do dia: ${dataRelatorioFmt}\nModo desejado: ${modo}\n\nEvoluções individuais selecionadas (cada item possui horário e morador):\n${listaFormatada}\n\nInstruções:\n- Produza um texto coeso consolidando apenas as informações listadas.\n- Agrupe por temas (alimentação, sintomas, medicação, comportamento, intercorrências).\n- Tom: objetivo, clínico, português do Brasil.\n- Não invente dados não listados.\n- Se não houver intercorrências relevantes, expresse isso de forma adequada.\n- Responda somente com o texto final, sem título ou explicações.\n`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const resposta = result.response.text();
      const texto = this.limparResposta(resposta);
      return { texto, modelo: 'gemini-1.5-flash', chars: texto.length };
    } catch (e: any) {
      if (e instanceof ForbiddenException) throw e;
      throw new InternalServerErrorException('Falha ao gerar relatório');
    }
  }

  private limparResposta(raw: string) {
    if (!raw) return '';
    let t = raw.trim();
    // Remover asteriscos de markdown simples
    t = t.replace(/\*\*/g, '').replace(/\*/g, '');
    // Evitar prefixos comuns
    t = t.replace(/^Resposta:?/i, '').trim();
    return t;
  }

  private formatarData(isoDate: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }
}
