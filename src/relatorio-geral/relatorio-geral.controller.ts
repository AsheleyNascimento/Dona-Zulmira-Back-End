import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RelatorioGeralService } from './relatorio-geral.service';
import { CreateRelatorioGeralDto } from './dto/create-relatorio-geral.dto';
import { UpdateRelatorioGeralDto } from './dto/update-relatorio-geral.dto';
import { CurrentUser } from '../app/common/decorators/current-user.decorator';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('relatorio-geral')
@ApiBearerAuth()
@Controller('relatorio-geral')
@UseGuards(AuthTokenGuard, RolesGuard)
export class RelatorioGeralController {
  constructor(private readonly relatorioGeralService: RelatorioGeralService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo relatório geral' })
  @ApiBody({ type: CreateRelatorioGeralDto })
  @ApiResponse({ status: 201, description: 'Relatório criado com sucesso.' })
  @Roles('Enfermeiro', 'Cuidador')
  create(@Body() createRelatorioGeralDto: CreateRelatorioGeralDto, @CurrentUser() user: any) {
    return this.relatorioGeralService.create(createRelatorioGeralDto, user.id_usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar relatórios gerais' })
  @ApiResponse({ status: 200, description: 'Lista de relatórios.' })
  @Roles('Enfermeiro', 'Cuidador')
  findAll(@Query() query) {
    return this.relatorioGeralService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar relatório geral por ID' })
  @ApiResponse({ status: 200, description: 'Relatório encontrado.' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  @Roles('Enfermeiro', 'Cuidador')
  findOne(@Param('id') id: string) {
    return this.relatorioGeralService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar relatório geral' })
  @ApiBody({ type: UpdateRelatorioGeralDto })
  @ApiResponse({ status: 200, description: 'Relatório atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  @Roles('Enfermeiro', 'Cuidador')
  update(@Param('id') id: string, @Body() updateRelatorioGeralDto: UpdateRelatorioGeralDto) {
    return this.relatorioGeralService.update(+id, updateRelatorioGeralDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover relatório geral' })
  @ApiResponse({ status: 200, description: 'Relatório removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  @Roles('Enfermeiro', 'Cuidador')
  remove(@Param('id') id: string) {
    return this.relatorioGeralService.remove(+id);
  }
}
