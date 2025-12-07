// ...existing code...
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EvolucaoIndividualService } from './evolucao-individual.service';
import { CreateEvolucaoIndividualDto } from './dto/create-evolucao-individual.dto';
import { UpdateEvolucaoIndividualDto } from './dto/update-evolucao-individual.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('evolucao-individual')
@ApiBearerAuth()
@Controller('evolucao-individual')
@UseGuards(AuthTokenGuard, RolesGuard)
export class EvolucaoIndividualController {
  constructor(private readonly service: EvolucaoIndividualService) { }

  @Get('morador/:id')
  @ApiOperation({ summary: 'Listar evoluções individuais de um morador' })
  @ApiResponse({ status: 200, description: 'Lista de evoluções do morador.' })
  @Roles('Enfermeiro', 'Tecnica_Enfermagem', 'Cuidador', 'Farmaceutico')
  async evolucoesPorMorador(@Param('id') id: number) {
    return this.service.findAll({ id_morador: Number(id), limit: 100 });
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova evolução individual' })
  @ApiBody({ type: CreateEvolucaoIndividualDto })
  @ApiResponse({ status: 201, description: 'Evolução criada com sucesso.' })
  @Roles('Enfermeiro', 'Tecnico de Enfermagem', 'Cuidador', 'Farmaceutico')
  async create(@Body() dto: CreateEvolucaoIndividualDto, @Req() req) {
    // req.user deve conter id
    return this.service.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar evoluções individuais' })
  @ApiResponse({ status: 200, description: 'Lista de evoluções.' })
  @Roles('Enfermeiro', 'Tecnico de Enfermagem', 'Cuidador', 'Farmaceutico')
  async findAll(@Query() query) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evolução individual por ID' })
  @ApiResponse({ status: 200, description: 'Evolução encontrada.' })
  @ApiResponse({ status: 404, description: 'Evolução não encontrada.' })
  @Roles('Enfermeiro', 'Cuidador')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar evolução individual' })
  @ApiBody({ type: UpdateEvolucaoIndividualDto })
  @ApiResponse({ status: 200, description: 'Evolução atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Evolução não encontrada.' })
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar evolução individual' })
  @ApiBody({ type: UpdateEvolucaoIndividualDto })
  @ApiResponse({ status: 200, description: 'Evolução atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Evolução não encontrada.' })
  @Roles('Enfermeiro', 'Tecnico de Enfermagem', 'Farmaceutico')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateEvolucaoIndividualDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover evolução individual' })
  @ApiResponse({ status: 200, description: 'Evolução removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Evolução não encontrada.' })
  @Roles('Enfermeiro', 'Tecnico de Enfermagem', 'Farmaceutico')
  async remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
