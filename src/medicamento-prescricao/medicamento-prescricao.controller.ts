import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MedicamentoPrescricaoService } from './medicamento-prescricao.service';
import { CreateMedicamentoPrescricaoDto } from './dto/create-medicamento-prescricao.dto';
import { UpdateMedicamentoPrescricaoDto } from './dto/update-medicamento-prescricao.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Medicamento-Prescrição')
@ApiBearerAuth()
@Controller('medicamento-prescricao')
@UseGuards(AuthTokenGuard, RolesGuard)
export class MedicamentoPrescricaoController {
  constructor(private readonly service: MedicamentoPrescricaoService) {}

  @Post()
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Criar um novo vínculo de medicamento à prescrição' })
  @ApiBody({ type: CreateMedicamentoPrescricaoDto })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso.' })
  create(@Body() dto: CreateMedicamentoPrescricaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vínculos de medicamento-prescrição com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de vínculos.' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vínculo por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Atualizar vínculo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateMedicamentoPrescricaoDto })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado.' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicamentoPrescricaoDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('Enfermeiro', 'Cuidador', 'Administrador')
  @ApiOperation({ summary: 'Remover vínculo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vínculo removido.' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
