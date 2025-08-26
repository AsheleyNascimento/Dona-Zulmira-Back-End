import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const cpf = value.replace(/\D/g, '');
          if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
          let sum = 0;
          for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
          let rev = 11 - (sum % 11);
          if (rev === 10 || rev === 11) rev = 0;
          if (rev !== parseInt(cpf.charAt(9))) return false;
          sum = 0;
          for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
          rev = 11 - (sum % 11);
          if (rev === 10 || rev === 11) rev = 0;
          return rev === parseInt(cpf.charAt(10));
        },
        defaultMessage(_args: ValidationArguments) {
          return 'CPF inválido.';
        },
      },
    });
  };
}
