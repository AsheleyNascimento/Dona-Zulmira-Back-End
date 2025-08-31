import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Verifica se já existe algum usuário administrador
  const adminExists = await prisma.usuario.findFirst({
    where: { funcao: 'Administrador' },
  });

  if (!adminExists) {
    const senhaHash = await bcrypt.hash('admin123', 10); // senha padrão
    await prisma.usuario.create({
      data: {
        nome_usuario: 'admin',
        nome_completo: 'Administrador do Sistema',
        cpf: '00000000000',
        email: 'admin@zulmira.com',
        senha_hash: senhaHash,
        funcao: 'Administrador',
        situacao: true,
      },
    });
    console.log('Usuário administrador criado: admin / admin123');
  } else {
    console.log('Usuário administrador já existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
