import { PartialType } from '@nestjs/swagger';
import { CreateMedicamentoPrescricaoDto } from './create-medicamento-prescricao.dto';

export class UpdateMedicamentoPrescricaoDto extends PartialType(CreateMedicamentoPrescricaoDto) {}
