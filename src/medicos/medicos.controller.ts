import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Controller("medicos")
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post()
  create(@Body(ValidationPipe) createMedicoDto: CreateMedicoDto) {
    return this.medicosService.create(createMedicoDto);
  }

  @Get()
  findAll(@Query("name") name?: string) {
    return this.medicosService.findAll(name);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.medicosService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body(ValidationPipe) updateMedicoDto: UpdateMedicoDto) {
    return this.medicosService.update(+id, updateMedicoDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.medicosService.remove(+id);
  }
}


