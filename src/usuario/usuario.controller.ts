import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { ParseIntIdPipe } from '../app/common/pipes/parse-int-id.pipe';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { CurrentUser } from '../app/common/decorators/current-user.decorator';
import { Roles } from '../app/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('usuario')
@ApiBearerAuth()
@Controller('usuario')
/* @UseGuards(AuthTokenGuard, RolesGuard)
@Roles('*') */
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  getProfile(@CurrentUser() pessoa) {
    return pessoa; // Dados da pessoa já populados no guard
  }

  @Get('buscar')
  /*  @Roles('Administrador') */
  async findOneBySingleQuery(
    @Query('cpf') cpf?: string,
    @Query('email') email?: string,
    @Query('funcao') funcao?: string,
  ) {
    return this.usuarioService.findOneBySingleQuery({ cpf, email, funcao });
  }

  @Post()
  /* @Roles('Administrador') */
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Cadastro efetuado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Usuário ou e-mail já cadastrado.' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    try {
      const usuario = await this.usuarioService.create(createUsuarioDto);
      return {
        statusCode: 201,
        message: 'Cadastro efetuado com sucesso',
        usuario,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao cadastrar usuário',
      };
    }
  }

  @Get()
  @Roles('Administrador')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nome_completo') nome_completo?: string,
    @Query('cpf') cpf?: string,
    @Query('email') email?: string,
    @Query('funcao') funcao?: string,
  ) {
    const filters: any = {};
    if (nome_completo) filters.nome_completo = nome_completo;
    if (cpf) filters.cpf = cpf;
    if (email) filters.email = email;
    if (funcao) filters.funcao = funcao;
    return this.usuarioService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      filters,
    );
  }

  @Get(':id')
  @Roles('Administrador')
  findOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async update(
    @Param('id', ParseIntIdPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    try {
      const usuarioAntigo = await this.usuarioService.findOne(id);
      if (!usuarioAntigo) {
        return {
          statusCode: 404,
          message: 'Usuário não encontrado',
        };
      }
      const usuarioAtualizado = await this.usuarioService.update(
        id,
        updateUsuarioDto,
      );
      const alteracoes: string[] = [];
      if (
        updateUsuarioDto.nome_usuario &&
        updateUsuarioDto.nome_usuario !== usuarioAntigo.nome_usuario
      ) {
        alteracoes.push('nome_usuario');
      }
      if (
        updateUsuarioDto.nome_completo &&
        updateUsuarioDto.nome_completo !== usuarioAntigo.nome_completo
      ) {
        alteracoes.push('nome_completo');
      }
      if (
        updateUsuarioDto.email &&
        updateUsuarioDto.email !== usuarioAntigo.email
      ) {
        alteracoes.push('email');
      }
      if (
        updateUsuarioDto.funcao &&
        updateUsuarioDto.funcao !== usuarioAntigo.funcao
      ) {
        alteracoes.push('funcao');
      }
      if (
        updateUsuarioDto.situacao !== undefined &&
        updateUsuarioDto.situacao !== usuarioAntigo.situacao
      ) {
        alteracoes.push('situacao');
      }
      if (updateUsuarioDto.senha) {
        alteracoes.push('senha');
      }
      return {
        statusCode: 200,
        message:
          alteracoes.length > 0
            ? alteracoes
                .map((campo) => `${campo} alterado com sucesso`)
                .join(' | ')
            : 'Nenhuma alteração detectada',
        usuario: usuarioAtualizado,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao atualizar usuário',
      };
    }
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id', ParseIntIdPipe) id: number) {
    return this.usuarioService.remove(+id);
  }
}
