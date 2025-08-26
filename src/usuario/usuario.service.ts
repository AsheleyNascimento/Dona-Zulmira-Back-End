import { PrismaService } from '../prisma/prisma.service'; // Criar o db
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { HashingService } from '../auth/hashing/hashing.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService, // Se necessário, mas não parece ser usado aqui
  ) {}

  // Defina o papel do usuário aqui, ou obtenha-o de algum lugar
  async create(createUsuarioDto: CreateUsuarioDto) {
    // Certifique-se de que 'cpf' existe no seu schema Prisma. Caso não exista, substitua por um campo único válido, como 'id_usuario' ou 'email'.
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { cpf: createUsuarioDto.cpf } as any, // Remova 'as any' se o tipo estiver correto no schema
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
      // Criar o db
      data: {
        // Use the correct field names as defined in your Prisma schema
        // For example, if the field is 'username' instead of 'nome_usuario':
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
    const data: any = { ...updateUsuarioDto };

    // Se for enviada uma nova senha, gerar o hash e substituir no campo certo
    if (updateUsuarioDto.senha) {
      const senhaHash = await bcrypt.hash(updateUsuarioDto.senha, 10);
      data.senha_hash = senhaHash;
      delete (data as { senha?: string }).senha; // Remover o campo 'senha' para evitar erro
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }
}
