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
} from '@nestjs/common';
import { PrescricaoService } from './prescricao.service';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';
import { UpdatePrescricaoDto } from './dto/update-prescricao.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Prescrição')
@ApiBearerAuth()
@Controller('prescricao')
@UseGuards(AuthTokenGuard, RolesGuard)
export class PrescricaoController {
  constructor(private readonly service: PrescricaoService) {}

  @Post()
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Criar uma nova prescrição' })
  @ApiBody({ type: CreatePrescricaoDto })
  @ApiResponse({ status: 201, description: 'Prescrição criada com sucesso.' })
  create(@Body() dto: CreatePrescricaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar prescrições com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'id_morador', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de prescrições.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('id_morador') id_morador?: number,
  ) {
    return this.service.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      id_morador: id_morador ? Number(id_morador) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma prescrição por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Prescrição encontrada.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Atualizar uma prescrição' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePrescricaoDto })
  @ApiResponse({ status: 200, description: 'Prescrição atualizada.' })
  update(@Param('id') id: string, @Body() dto: UpdatePrescricaoDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Remover uma prescrição' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Prescrição removida.' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
