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
import { MedicamentosService } from './medicamentos.service';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('medicamentos')
@ApiBearerAuth()
@Controller('medicamentos')
@UseGuards(AuthTokenGuard)
export class MedicamentosController {
  constructor(private readonly medicamentosService: MedicamentosService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo medicamento' })
  @ApiResponse({ status: 201, description: 'Cadastro efetuado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Medicamento já cadastrado.' })
  async create(@Body() createMedicamentoDto: CreateMedicamentoDto) {
    try {
      const medicamento =
        await this.medicamentosService.create(createMedicamentoDto);
      return {
        statusCode: 201,
        message: 'Cadastro efetuado com sucesso',
        medicamento,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao cadastrar medicamento',
      };
    }
  }

  @Get()
  @Roles('Administrador')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('nome_medicamento') nome_medicamento?: string,
  ) {
    const filters: any = {};
    if (nome_medicamento) filters.nome_medicamento = nome_medicamento;
    return this.medicamentosService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      filters,
    );
  }

  @Get(':id')
  @Roles('Administrador')
  findOne(@Param('id') id: string) {
    return this.medicamentosService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Atualizar medicamento' })
  @ApiResponse({
    status: 200,
    description: 'Medicamento atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Medicamento não encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateMedicamentoDto: UpdateMedicamentoDto,
  ) {
    try {
      const antigo = await this.medicamentosService.findOne(Number(id));
      if (!antigo) {
        return {
          statusCode: 404,
          message: 'Medicamento não encontrado',
        };
      }
      const atualizado = await this.medicamentosService.update(
        Number(id),
        updateMedicamentoDto,
      );
      const alteracoes: string[] = [];
      if (
        updateMedicamentoDto.nome_medicamento &&
        updateMedicamentoDto.nome_medicamento !== antigo.nome_medicamento
      )
        alteracoes.push('nome_medicamento');
      if (
        updateMedicamentoDto.situacao !== undefined &&
        updateMedicamentoDto.situacao !== antigo.situacao
      )
        alteracoes.push('situacao');
      return {
        statusCode: 200,
        message:
          alteracoes.length > 0
            ? alteracoes
                .map((campo) => `${campo} alterado com sucesso`)
                .join(' | ')
            : 'Nenhuma alteração detectada',
        medicamento: atualizado,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Erro ao atualizar medicamento',
      };
    }
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.medicamentosService.remove(Number(id));
  }
}
