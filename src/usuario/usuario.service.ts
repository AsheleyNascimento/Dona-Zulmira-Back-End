import { PrismaService } from '../prisma/prisma.service'; // Criar o db
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { HashingService } from '../auth/hashing/hashing.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}


  async create(createUsuarioDto: CreateUsuarioDto) {
  const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { cpf: createUsuarioDto.cpf } as any,
    });
    if (usuarioExistente) {
      throw new ConflictException('Usuario cadastrado no sistema');
    }

    const emailExiste = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email },
    });
    if (emailExiste) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    const senhaHash = await this.hashingService.hashPassword(
      createUsuarioDto.senha,
    );

    return this.prisma.usuario.create({
      data: {
        nome_usuario: createUsuarioDto.nome_usuario,
        senha_hash: senhaHash,
        nome_completo: createUsuarioDto.nome_completo,
        cpf: createUsuarioDto.cpf,
        email: createUsuarioDto.email,
        funcao: createUsuarioDto.funcao,
        situacao: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      nome_completo?: string;
      cpf?: string;
      email?: string;
      funcao?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.nome_completo)
      where.nome_completo = {
        contains: filters.nome_completo,
      };
    if (filters?.cpf) where.cpf = filters.cpf;
    if (filters?.email) where.email = { contains: filters.email };
    if (filters?.funcao) where.funcao = { contains: filters.funcao };

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        where,
      }),
      this.prisma.usuario.count({ where }),
    ]);
    return {
      data: usuarios.map(({ senha_hash, ...rest }) => rest),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
    if (!usuario) return null;
    const { senha_hash, ...rest } = usuario;
    return rest;
  }

  async findOneBySingleQuery(filters: {
    cpf?: string;
    email?: string;
    funcao?: string;
  }) {
    const filterKeys = Object.entries(filters).filter(([_, value]) => !!value);

    if (filterKeys.length !== 1) {
      throw new BadRequestException(
        'Informe apenas um dos parâmetros: cpf, email ou funcao.',
      );
    }

    const [key, value] = filterKeys[0];

    return this.prisma.usuario.findFirst({
      where: {
        [key]: value,
      },
    });
  }

async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    
    // 1. [LÓGICA MOVIDA] Buscar o usuário antigo PRIMEIRO
    const usuarioAntigo = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    // 2. [LÓGICA MOVIDA] Se não existir, lança a exceção
    if (!usuarioAntigo) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // 3. [LÓGICA EXISTENTE] Verificação de conflitos (CPF/Email)
    const data: any = { ...updateUsuarioDto };

    if (data.cpf) {
      const cpfJaExiste = await this.prisma.usuario.findFirst({
        where: { cpf: data.cpf, id_usuario: { not: id } },
      });
      if (cpfJaExiste) {
        throw new ConflictException('CPF já cadastrado no sistema');
      }
    }
    if (data.email) {
      const emailJaExiste = await this.prisma.usuario.findFirst({
        where: { email: data.email, id_usuario: { not: id } },
      });
      if (emailJaExiste) {
        throw new ConflictException('Email já cadastrado no sistema');
      }
    }

    // 4. [LÓGICA EXISTENTE] Hash da senha
    if (data.senha) {
      const senhaHash = await this.hashingService.hashPassword(data.senha);
      data.senha_hash = senhaHash;
      delete (data as { senha?: string }).senha;
    }

    // 5. [LÓGICA EXISTENTE] Executar o update
    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
    });

    // 6. [LÓGICA MOVIDA] Lógica de detecção de mudanças
    const alteracoes: string[] = [];
    if (
      data.nome_usuario &&
      data.nome_usuario !== usuarioAntigo.nome_usuario
    ) {
      alteracoes.push('nome_usuario');
    }
    if (
      data.nome_completo &&
      data.nome_completo !== usuarioAntigo.nome_completo
    ) {
      alteracoes.push('nome_completo');
    }
    if (
      data.email &&
      data.email !== usuarioAntigo.email
    ) {
      alteracoes.push('email');
    }
    if (
      data.funcao &&
      data.funcao !== usuarioAntigo.funcao
    ) {
      alteracoes.push('funcao');
    }
    if (
      data.situacao !== undefined && // Correto para booleano
      data.situacao !== usuarioAntigo.situacao
    ) {
      alteracoes.push('situacao');
    }
    if (updateUsuarioDto.senha) { // Checa o DTO original
      alteracoes.push('senha');
    }

    // 7. [LÓGICA MOVIDA] Gerar a mensagem de retorno
    const message =
      alteracoes.length > 0
        ? alteracoes
            .map((campo) => `${campo} alterado com sucesso`)
            .join(' | ')
        : 'Nenhuma alteração detectada';

    // 8. Retornar o objeto completo que o Controller espera
    if (usuarioAtualizado && typeof usuarioAtualizado === 'object' && 'senha_hash' in usuarioAtualizado) {
      delete (usuarioAtualizado as { senha_hash?: string }).senha_hash; // Always remove the hash!
    }
    
    return {
      message: message,
      usuario: usuarioAtualizado,
    };
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }
}
