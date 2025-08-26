import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRelatorioGeralDto } from './create-relatorio-geral.dto';

export class UpdateRelatorioGeralDto extends PartialType(CreateRelatorioGeralDto) {}
