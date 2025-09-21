import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GerarRelatorioDto } from './dto/gerar-relatorio.dto';
import { AuthTokenGuard } from '../app/common/guards/auth-token.guard';
import { RolesGuard } from '../app/common/guards/roles.guard';
import { Roles } from '../app/common/decorators/roles.decorator';
import { CurrentUser } from '../app/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(AuthTokenGuard, RolesGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('gerar-relatorio')
  @Roles('Enfermeiro', 'Cuidador')
  @ApiOperation({ summary: 'Gerar texto de relatório diário geral a partir de evoluções' })
  @ApiBody({ type: GerarRelatorioDto })
  @ApiResponse({ status: 201, description: 'Texto gerado com sucesso.' })
  async gerar(@Body() dto: GerarRelatorioDto, @CurrentUser() user: any) {
    return this.aiService.gerarRelatorio(user.id_usuario, dto);
  }
}
