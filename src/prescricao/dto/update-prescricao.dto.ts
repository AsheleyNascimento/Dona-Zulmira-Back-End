import { PartialType } from '@nestjs/swagger';
import { CreatePrescricaoDto } from './create-prescricao.dto';

export class UpdatePrescricaoDto extends PartialType(CreatePrescricaoDto) {}
