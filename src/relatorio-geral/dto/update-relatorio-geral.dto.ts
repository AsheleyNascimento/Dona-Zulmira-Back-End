import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRelatorioGeralDto } from './create-relatorio-geral.dto';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class UpdateRelatorioGeralDto extends PartialType(CreateRelatorioGeralDto) {
	@ApiPropertyOptional({ example: [5, 6], description: 'Substitui completamente o conjunto de evoluções vinculadas.' })
	@IsArray()
	@IsInt({ each: true })
	@IsOptional()
	ids_evolucoes?: number[];
}
