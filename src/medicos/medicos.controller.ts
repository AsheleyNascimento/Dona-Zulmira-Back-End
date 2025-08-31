import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { CurrentUser } from '../app/common/decorators/current-user.decorator';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@UseGuards(AuthTokenGuard)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post()
  async create(@Body(ValidationPipe) createMedicoDto: CreateMedicoDto, @CurrentUser() user: any) {
    return await this.medicosService.create(createMedicoDto, user.id_usuario);
  }

  @Get()
  findAll(@Query('name') name?: string) {
    return this.medicosService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateMedicoDto: UpdateMedicoDto) {
    return this.medicosService.update(+id, updateMedicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicosService.remove(+id);
  }
}


