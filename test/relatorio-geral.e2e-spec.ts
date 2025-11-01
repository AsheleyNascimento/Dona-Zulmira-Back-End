// Em test/relatorio-geral.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { AuthTokenGuard } from '../src/app/common/guards/auth-token.guard';
import { RolesGuard } from '../src/app/common/guards/roles.guard';
import { CreateRelatorioGeralDto } from '../src/relatorio-geral/dto/create-relatorio-geral.dto';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../src/auth/auth.constants';

// 1. Importe o PrismaService
import { PrismaService } from '../src/prisma/prisma.service';

describe('RelatorioGeralController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService; 

  let evolucaoId: number;
  let moradorId: number;
  const mockUserId = 999; // ID do nosso usuário mockado

  const mockUser = { id_usuario: mockUserId, nome_completo: 'Usuário Teste E2E' };

  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req[REQUEST_TOKEN_PAYLOAD_KEY] = { pessoa: mockUser };
      return true;
    },
  };

  const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // 2. Instância do PrismaService
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // 3. Limpeza ANTES de criar (garante que não haja lixo de testes anteriores)
    // A ordem importa por causa das chaves estrangeiras (Foreign Keys)
    await prisma.relatorioEvolucao.deleteMany({});
    await prisma.relatoriodiariogeral.deleteMany({});
    await prisma.evolucaoindividual.deleteMany({});
    await prisma.morador.deleteMany({});
    await prisma.usuario.deleteMany({ where: { id_usuario: mockUserId } });

    // 4. Crie os dados de pré-requisito (Seed)
    
    // Criando Usuario
    const usuario = await prisma.usuario.create({
      data: {
        id_usuario: mockUserId, // ID que estamos mockando
        nome_usuario: 'teste.e2e',
        nome_completo: 'Usuário Teste E2E',
        cpf: '12345678900', // CPF fake (precisa ser único)
        senha_hash: 'hash-fake-para-teste',
        email: 'teste.e2e@dominio.com', // Email fake (precisa ser único)
        funcao: 'Enfermeiro',
        situacao: true,
      },
    });

    // Criando Morador (corrigido de Paciente)
    const morador = await prisma.morador.create({
      data: {
        nome_completo: 'Morador Teste E2E',
        id_usuario: usuario.id_usuario, // Criado pelo usuário mockado
        cpf: '00987654321', // CPF fake (precisa ser único)
        rg: '1234567',
        situacao: true,
      },
    });
    moradorId = morador.id_morador; // Salva o ID do morador

    // Criando Evolucaoindividual
    const evolucao = await prisma.evolucaoindividual.create({
      data: {
        id_morador: morador.id_morador,     // <- ID do morador que criamos
        id_usuario: usuario.id_usuario, // <- ID do usuário que criamos
        observacoes: 'Evolução de teste E2E',
      },
    });
    evolucaoId = evolucao.id_evolucao_individual; // <- Salva o ID da evolução
  });

  afterAll(async () => {
    // 5. Limpeza DEPOIS de todos os testes
    // A ordem importa
    await prisma.relatorioEvolucao.deleteMany({});
    await prisma.relatoriodiariogeral.deleteMany({});
    await prisma.evolucaoindividual.deleteMany({});
    await prisma.morador.deleteMany({ where: { id_morador: moradorId } });
    await prisma.usuario.deleteMany({ where: { id_usuario: mockUserId } });

    await app.close(); // Fechar a aplicação
  });

  // Variável para o Teste 3
  let createdRelatorioId: number;

  // Teste 1: GET /relatorio-geral
  it('GET /relatorio-geral - deve listar relatórios', () => {
    return request(app.getHttpServer()).get('/relatorio-geral').expect(200);
  });

  // Teste 2: POST /relatorio-geral
  it('POST /relatorio-geral - deve criar um novo relatório', async () => {
    const createDto: CreateRelatorioGeralDto = {
      observacoes: 'Paciente estável. (Teste E2E)',
      // 6. Use o ID da evolução que acabamos de criar
      ids_evolucoes: [evolucaoId], 
    };

    const response = await request(app.getHttpServer())
      .post('/relatorio-geral')
      .send(createDto)
      .expect(201); // Agora esperamos 201 Created

    // O serviço retorna { message: '...', relatorio: {...} }
    expect(response.body.message).toBe('Relatório criado com sucesso');
    expect(response.body.relatorio).toHaveProperty('id_relatorio_diario_geral');
    expect(response.body.relatorio.id_usuario).toBe(mockUserId);

    // Salva o ID do relatório para o próximo teste
    createdRelatorioId = response.body.relatorio.id_relatorio_diario_geral;
  });

  // Teste 3: GET /relatorio-geral/:id
  it('GET /relatorio-geral/:id - deve buscar o relatório criado pelo ID', async () => {
    if (!createdRelatorioId) {
      throw new Error('O teste de POST falhou, então este teste não pode rodar.');
    }

    const response = await request(app.getHttpServer())
      .get(`/relatorio-geral/${createdRelatorioId}`)
      .expect(200);

    expect(response.body.id_relatorio_diario_geral).toBe(createdRelatorioId);
    expect(response.body.usuario.id_usuario).toBe(mockUserId);
  });

  // Teste 4: GET /relatorio-geral/:id (para um ID que não existe)
  it('GET /relatorio-geral/:id - deve retornar 404 para um ID inexistente', () => {
    const idInexistente = 999999;
    return request(app.getHttpServer())
      .get(`/relatorio-geral/${idInexistente}`)
      .expect(404);
  });
});