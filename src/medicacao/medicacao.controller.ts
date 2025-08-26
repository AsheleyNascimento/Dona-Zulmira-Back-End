import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { MedicacaoService } from './medicacao.service';
import { CreateMedicacaoDto } from './dto/create-medicacao.dto';
import { UpdateMedicacaoDto } from './dto/update-medicacao.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Medicação')
@ApiBearerAuth()
@Controller('medicacao')
@UseGuards(AuthTokenGuard, RolesGuard)
export class MedicacaoController {
  constructor(private readonly service: MedicacaoService) {}

  @Post()
  @Roles('Enfermeiro', 'Cuidador')
  @ApiOperation({ summary: 'Criar uma nova medicação' })
  @ApiBody({ type: CreateMedicacaoDto })
  @ApiResponse({ status: 201, description: 'Medicação criada com sucesso.' })
  create(@Body() dto: CreateMedicacaoDto, @Request() req) {
    // Pega o id do usuário autenticado do token JWT
    const id_usuario = req.user?.id || req.user?.sub;
    return this.service.create({ ...dto, id_usuario });
  }

  @Get()
  @ApiOperation({ summary: 'Listar medicações com paginação e filtro por data' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'dataInicio', required: false, type: String, example: '2025-06-01T00:00:00Z' })
  @ApiQuery({ name: 'dataFim', required: false, type: String, example: '2025-06-30T23:59:59Z' })
  @ApiResponse({ status: 200, description: 'Lista de medicações.' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.service.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      dataInicio,
      dataFim,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma medicação por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Medicação encontrada.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('Enfermeiro', 'Cuidador')
  @ApiOperation({ summary: 'Atualizar uma medicação' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateMedicacaoDto })
  @ApiResponse({ status: 200, description: 'Medicação atualizada.' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicacaoDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('Enfermeiro', 'Cuidador')
  @ApiOperation({ summary: 'Remover uma medicação' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Medicação removida.' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
