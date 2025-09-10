import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateMoradorDto } from './dto/create-morador.dto';
import { UpdateMoradorDto } from './dto/update-morador.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParseIntIdPipe } from '../app/common/pipes/parse-int-id.pipe';
import { MoradorService } from './morador.service';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { CurrentUser } from '../app/common/decorators/current-user.decorator';

@UseGuards(AuthTokenGuard, RolesGuard)
@ApiTags('morador')
@ApiBearerAuth()
@Controller('morador')
export class MoradorController {
  constructor(private readonly moradorService: MoradorService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo morador' })
  @ApiResponse({ status: 201, description: 'Cadastro efetuado com sucesso.' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado.' })
  async create(@Body() createMoradorDto: CreateMoradorDto, @CurrentUser() user: any) {
    try {
      const morador = await this.moradorService.create(createMoradorDto, user.id_usuario);
      return {
        statusCode: 201,
        message: 'Cadastro efetuado com sucesso',
        morador,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao cadastrar morador',
      };
    }
  }

  @Get()
  @Roles('Administrador', 'Enfermeiro', 'Cuidador')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nome_completo') nome_completo?: string,
    @Query('cpf') cpf?: string,
  ) {
    const filters: any = {};
    if (nome_completo) filters.nome_completo = nome_completo;
    if (cpf) filters.cpf = cpf;
    return this.moradorService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      filters,
    );
  }

  @Get(':id')
  @Roles('Administrador', 'Enfermeiro', 'Cuidador')
  findOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.moradorService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Atualizar morador' })
  @ApiResponse({ status: 200, description: 'Morador atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Morador não encontrado.' })
  async update(@Param('id') id: string, @Body() updateMoradorDto: UpdateMoradorDto) {
    try {
      const antigo = await this.moradorService.findOne(+id);
      if (!antigo) {
        return {
          statusCode: 404,
          message: 'Morador não encontrado',
        };
      }
      const atualizado = await this.moradorService.update(+id, updateMoradorDto);
      const alteracoes: string[] = [];
      if (updateMoradorDto.nome_completo && updateMoradorDto.nome_completo !== antigo.nome_completo) alteracoes.push('nome_completo');
      if (updateMoradorDto.cpf && updateMoradorDto.cpf !== antigo.cpf) alteracoes.push('cpf');
      if (updateMoradorDto.rg && updateMoradorDto.rg !== antigo.rg) alteracoes.push('rg');
      if (updateMoradorDto.situacao !== undefined && updateMoradorDto.situacao !== antigo.situacao) alteracoes.push('situacao');
      if (updateMoradorDto.data_cadastro && new Date(updateMoradorDto.data_cadastro).toISOString() !== new Date(antigo.data_cadastro).toISOString()) alteracoes.push('data_cadastro');
      return {
        statusCode: 200,
        message: alteracoes.length > 0 ? alteracoes.map(campo => `${campo} alterado com sucesso`).join(' | ') : 'Nenhuma alteração detectada',
        morador: atualizado,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao atualizar morador',
      };
    }
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.moradorService.remove(+id);
  }
}
