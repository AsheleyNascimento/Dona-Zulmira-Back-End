// Em test/medicos.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { AuthTokenGuard } from '../src/app/common/guards/auth-token.guard';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../src/auth/auth.constants';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateMedicoDto } from '../src/medicos/dto/create-medico.dto';
import { UpdateMedicoDto } from '../src/medicos/dto/update-medico.dto';

describe('MedicosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // IDs dos dados que vamos criar
  let createdMedicoId: number;
  const mockUserId = 998; // ID do usuário que vai "criar" o médico
  const mockUserCpf = '12345678998'; // CPF único para o usuário de teste
  const mockMedicoCrm = '123456-MG'; // CRM único para o médico de teste

  // Mock do usuário que será injetado pelo @CurrentUser()
  const mockUser = {
    id_usuario: mockUserId,
    nome_completo: 'Usuário Criador de Médicos',
  };

  // Mock do AuthGuard 
  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req[REQUEST_TOKEN_PAYLOAD_KEY] = { pessoa: mockUser };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockAuthGuard) // Aplicamos o mock
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Limpeza ANTES de criar
    // A ordem importa: Medico (depende de Usuario) -> Usuario
    await prisma.medico.deleteMany({ where: { crm: mockMedicoCrm } });
    await prisma.usuario.deleteMany({ where: { id_usuario: mockUserId } });

    await prisma.usuario.create({
      data: {
        id_usuario: mockUserId,
        nome_usuario: 'teste.e2e.medico',
        nome_completo: 'Usuário Criador de Médicos',
        cpf: mockUserCpf,
        senha_hash: 'hash-fake-para-teste',
        email: 'teste.e2e.medico@dominio.com',
        funcao: 'Administrador',
        situacao: true,
      },
    });
  });

  afterAll(async () => {
    // Limpeza DEPOIS de todos os testes
    // A ordem importa
    await prisma.medico.deleteMany({ where: { crm: mockMedicoCrm } });
    await prisma.usuario.deleteMany({ where: { id_usuario: mockUserId } });

    await app.close();
  });

  // Teste 1: POST /medicos
  it('POST /medicos - deve criar um novo médico', async () => {
    const createDto: CreateMedicoDto = {
      nome_completo: 'Dr. Teste E2E',
      crm: mockMedicoCrm, // CRM deve ser único
      situacao: true,
    };

    const response = await request(app.getHttpServer())
      .post('/medicos')
      .send(createDto)
      .expect(201); // 201 Created

    // Verifica se a resposta está correta
    expect(response.body).toHaveProperty('id_medico');
    expect(response.body.nome_completo).toBe(createDto.nome_completo);
    expect(response.body.crm).toBe(createDto.crm);
    expect(response.body.id_usuario).toBe(mockUserId); // Confirma que o @CurrentUser() foi usado

    // Salva o ID para os próximos testes
    createdMedicoId = response.body.id_medico;
  });

  // Teste 2: GET /medicos
  it('GET /medicos - deve listar os médicos criados', async () => {
    const response = await request(app.getHttpServer())
      .get('/medicos')
      .expect(200);

    // Espera que a lista contenha pelo menos 1 médico
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    // Verifica se o médico que acabamos de criar está na lista
    const medicoCriado = response.body.find(
      (m) => m.id_medico === createdMedicoId,
    );
    expect(medicoCriado).toBeDefined();
    expect(medicoCriado.nome_completo).toBe('Dr. Teste E2E');
  });

  // Teste 3: GET /medicos/:id (Sucesso)
  it('GET /medicos/:id - deve buscar o médico criado pelo ID', async () => {
    if (!createdMedicoId) {
      throw new Error('O teste de POST falhou, ID do médico não está definido.');
    }

    const response = await request(app.getHttpServer())
      .get(`/medicos/${createdMedicoId}`)
      .expect(200);

    expect(response.body.id_medico).toBe(createdMedicoId);
    expect(response.body.crm).toBe(mockMedicoCrm);
  });

  // Teste 4: PATCH /medicos/:id
  it('PATCH /medicos/:id - deve atualizar o médico criado', async () => {
    if (!createdMedicoId) {
      throw new Error('O teste de POST falhou, ID do médico não está definido.');
    }

    const updateDto: UpdateMedicoDto = {
      nome_completo: 'Dr. Teste E2E Atualizado',
      situacao: false,
    };

    const response = await request(app.getHttpServer())
      .patch(`/medicos/${createdMedicoId}`)
      .send(updateDto)
      .expect(200);

    // Verifica se os dados foram atualizados
    expect(response.body.id_medico).toBe(createdMedicoId);
    expect(response.body.nome_completo).toBe(updateDto.nome_completo);
    expect(response.body.situacao).toBe(false);
  });

  // Teste 5: DELETE /medicos/:id
  it('DELETE /medicos/:id - deve remover o médico criado', async () => {
    if (!createdMedicoId) {
      throw new Error('O teste de POST falhou, ID do médico não está definido.');
    }

    await request(app.getHttpServer())
      .delete(`/medicos/${createdMedicoId}`)
      .expect(200);
  });

  // Teste 6: GET /medicos/:id (Falha após Delete)
  it('GET /medicos/:id - deve retornar 404 após remover o médico', async () => {
    if (!createdMedicoId) {
      throw new Error('O teste de POST falhou, ID do médico não está definido.');
    }

    // Tenta buscar o médico que acabamos de deletar
    await request(app.getHttpServer())
      .get(`/medicos/${createdMedicoId}`)
      .expect(404); // Espera 404 Not Found
  });

  // Teste 7: GET /medicos/:id (Falha ID Inexistente)
  it('GET /medicos/:id - deve retornar 404 para um ID inexistente', () => {
    const idInexistente = 999999;
    return request(app.getHttpServer())
      .get(`/medicos/${idInexistente}`)
      .expect(404); // Espera 404 Not Found
  });
});