import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ValidateCpfPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Aplica somente no corpo inteiro (DTO) para garantir valor cpf
    if (metadata.type !== 'body') {
      return value;
    }

    const cpf = value.cpf;
    if (!cpf) {
      throw new BadRequestException('O campo CPF é obrigatório.');
    }

    const cleanCpf = cpf.replace(/[^\d]/g, '');

    if (!this.isValidCpf(cleanCpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    value.cpf = cleanCpf; // substitui pelo CPF limpo
    return value;
  }

  private isValidCpf(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }
}
