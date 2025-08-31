# API de Gerenciamento - Dona Zulmira

API RESTful desenvolvida com **NestJS** e **Prisma** para o gerenciamento de uma instituição de cuidados. O sistema oferece funcionalidades para controle de usuários, moradores, medicamentos, evoluções clínicas e relatórios gerais.

A API é documentada utilizando **Swagger**, proporcionando uma interface interativa para visualização e teste dos endpoints.

## ✨ Principais Tecnologias

* **Framework:** NestJS v11.1.3
* **ORM:** Prisma v6.8.2
* **Banco de Dados:** MySQL
* **Autenticação:** JWT (JSON Web Token) com `@nestjs/jwt` v11.0.0
* **Validação:** class-validator v0.14.2, class-transformer v0.5.1
* **Documentação da API:** Swagger (OpenAPI) com `@nestjs/swagger` v11.2.0
* **Linguagem:** TypeScript v5.7.3

## 🚀 Funcionalidades

O projeto é dividido nos seguintes módulos:

* **Autenticação (`/auth`):** Sistema de login e atualização de tokens JWT.
* **Usuários (`/usuario`):** Gerenciamento completo (CRUD) de usuários do sistema, com controle de acesso por função.
* **Moradores (`/morador`):** Gerenciamento completo (CRUD) dos moradores da instituição.
* **Medicamentos (`/medicamentos`):** Cadastro e controle de medicamentos disponíveis.
* **Evolução Individual (`/evolucao-individual`):** Registro de observações e evoluções clínicas individuais dos moradores.
* **Relatório Geral (`/relatorio-geral`):** Criação e consulta de relatórios diários gerais.

## 🗄️ Estrutura do Banco de Dados

O schema do banco de dados é gerenciado pelo Prisma e inclui as seguintes tabelas principais:

* `Usuario`: Armazena os dados dos usuários do sistema (cuidadores, administradores, etc.).
* `Morador`: Armazena os dados dos moradores.
* `Medicamento`: Catálogo de medicamentos.
* `EvolucaoIndividual`: Registros de evolução de cada morador, feitos por usuários autorizados.
* `RelatorioDiarioGeral`: Relatórios gerais do dia.
* `Medico`: Cadastro de médicos.
* `Prescricao`: Prescrições médicas associadas a moradores e médicos.
* `MedicamentoPrescricao`: Detalha os medicamentos em uma prescrição.
* `Medicacao`: Registra a administração de um medicamento prescrito a um morador.

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### **Pré-requisitos**

* Node.js (versão >= 20)
* NPM ou Yarn
* Docker ou uma instância de MySQL em execução

### **1. Clone o Repositório**

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA>
```

### **2. Instale as Dependências**

```bash
npm install
```
### **3. Configure as Variáveis de Ambiente**

Crie um arquivo ```.env``` na raiz do projeto.

```base 
# URL de Conexão com o Banco de Dados (MySQL)
DATABASE_URL="mysql://root:root@localhost:3306/sistema_gerenciamento"

# Segredos para JWT (JSON Web Token)
JWT_SECRET="seu-segredo-super-secreto"
JWT_REFRESH_SECRET="seu-segredo-de-refresh-super-secreto"
JWT_TOKEN_AUDIENCE="seus-usuarios"
JWT_TOKEN_ISSUER="sua-api"
```

### **4. Aplique as Migrações do Banco de Dados**

Com o banco de dados MySQL em execução e acessível pela ```DATABASE_URL```, execute o seguinte 
comando para criar as tabelas e aplicar as migrações existentes :

```base 
npx prisma migrate dev 
```
Este comando utilizará os arquivos de migração localizados em ```prisma/migrations``` para 
configurar a estrutura do banco de dados.

Caso não tenha criado o banco de dados para executar e criar diretamente pelo prisma execute:

```base 
npx prisma migrate dev --sistema_gerenciamento
```
## ▶️ Executando a Aplicação
Utilize os scripts do ```package.json``` para executar a aplicação.

* **Modo de Desenvolvimento (com watch e reload):**
```base 
npm run start:dev
```

## 🧪 Testes
O Projeto está configurado com o jest para os testes unitários.

* **Executar todos os testes:**
```base 
npm run test
```
* **Executar testes com cobertura de código:**
```base 
npm run test:cov
```
## 📚 Documentação da API (Swagger)
Após iniciar a aplicação, acesse a documentação interativa da API, gerada pelo Swagger, no 
seguinte endereço:

http://localhost:3000/api

A documentação fornece detalhes sobre todos os endpoints, incluindo parâmetros, corpo das 
requisições, respostas esperadas e a necessidade de autenticação.

## Endpoints da API

**Observação:**  A maioria dos endpoints requer autenticação via Bearer Token JWT e verificação
de função (Role).


## 📋 Endpoints da API

A seguir, uma lista detalhada de todos os endpoints disponíveis na aplicação.

---

### Módulo: Autenticação (`/auth`)

- **`POST /auth`**
  - **Descrição:** Realiza o login do usuário com email e senha.
  - **Retorna:** `accessToken` e `refreshToken` em caso de sucesso.
  - **Protegido:** Não.
  - *Fonte: `src/auth/auth.controller.ts`*

- **`POST /auth/refresh`**
  - **Descrição:** Gera um novo par de tokens a partir de um `refreshToken` válido.
  - **Retorna:** Novo `accessToken` e `refreshToken`.
  - **Protegido:** Não.
  - *Fonte: `src/auth/auth.controller.ts`*

---

### Módulo: Usuário (`/usuario`)

- **`POST /usuario`**
  - **Descrição:** Cadastra um novo usuário no sistema.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/usuario/usuario.controller.ts`*

- **`GET /usuario`**
  - **Descrição:** Lista todos os usuários com suporte a filtros e paginação (`page`, `limit`, `nome_completo`, etc.).
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/usuario/usuario.controller.ts`*

- **`GET /usuario/me`**
  - **Descrição:** Retorna os dados do perfil do usuário atualmente logado.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/usuario/usuario.controller.ts`*

- **`GET /usuario/:id`**
  - **Descrição:** Busca um usuário específico pelo seu ID.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/usuario/usuario.controller.ts`*

- **`PATCH /usuario/:id`**
  - **Descrição:** Atualiza os dados de um usuário específico.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/usuario/usuario.controller.ts`*

- **`DELETE /usuario/:id`**
  - **Descrição:** Remove um usuário do sistema.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/usuario/usuario.controller.ts`*

---

### Módulo: Morador (`/morador`)

- **`POST /morador`**
  - **Descrição:** Cadastra um novo morador.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/morador/morador.controller.ts`*

- **`GET /morador`**
  - **Descrição:** Lista todos os moradores com suporte a filtros e paginação.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/morador/morador.controller.ts`*

- **`GET /morador/:id`**
  - **Descrição:** Busca um morador específico pelo seu ID.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/morador/morador.controller.ts`*

- **`PATCH /morador/:id`**
  - **Descrição:** Atualiza os dados de um morador específico.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/morador/morador.controller.ts`*

- **`DELETE /morador/:id`**
  - **Descrição:** Remove um morador do sistema.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/morador/morador.controller.ts`*

---

### Módulo: Medicamentos (`/medicamentos`)

- **`POST /medicamentos`**
  - **Descrição:** Cadastra um novo medicamento.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/medicamentos/medicamentos.controller.ts`*

- **`GET /medicamentos`**
  - **Descrição:** Lista todos os medicamentos com filtros e paginação.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/medicamentos/medicamentos.controller.ts`*

- **`GET /medicamentos/:id`**
  - **Descrição:** Busca um medicamento pelo seu ID.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/medicamentos/medicamentos.controller.ts`*

- **`PATCH /medicamentos/:id`**
  - **Descrição:** Atualiza os dados de um medicamento.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/medicamentos/medicamentos.controller.ts`*

- **`DELETE /medicamentos/:id`**
  - **Descrição:** Remove um medicamento do sistema.
  - **Função Requerida:** `Administrador`
  - *Fonte: `src/medicamentos/medicamentos.controller.ts`*

---

### Módulo: Evolução Individual (`/evolucao-individual`)

- **`POST /evolucao-individual`**
  - **Descrição:** Cria um novo registro de evolução para um morador.
  - **Função Requerida:** `Enfermeiro`, `Cuidador`
  - *Fonte: `src/evolucao-individual/evolucao-individual.controller.ts`*

- **`GET /evolucao-individual`**
  - **Descrição:** Lista todos os registros de evolução com filtros.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/evolucao-individual/evolucao-individual.controller.ts`*

- **`GET /evolucao-individual/:id`**
  - **Descrição:** Busca um registro de evolução pelo seu ID.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/evolucao-individual/evolucao-individual.controller.ts`*

- **`PATCH /evolucao-individual/:id`**
  - **Descrição:** Atualiza um registro de evolução.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/evolucao-individual/evolucao-individual.controller.ts`*

- **`DELETE /evolucao-individual/:id`**
  - **Descrição:** Remove um registro de evolução.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/evolucao-individual/evolucao-individual.controller.ts`*

---

### Módulo: Relatório Geral (`/relatorio-geral`)

- **`POST /relatorio-geral`**
  - **Descrição:** Cria um novo relatório geral.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/relatorio-geral/relatorio-geral.controller.ts`*

- **`GET /relatorio-geral`**
  - **Descrição:** Lista todos os relatórios gerais com filtros.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/relatorio-geral/relatorio-geral.controller.ts`*

- **`GET /relatorio-geral/:id`**
  - **Descrição:** Busca um relatório geral pelo seu ID.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/relatorio-geral/relatorio-geral.controller.ts`*

- **`PATCH /relatorio-geral/:id`**
  - **Descrição:** Atualiza um relatório geral.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/relatorio-geral/relatorio-geral.controller.ts`*

- **`DELETE /relatorio-geral/:id`**
  - **Descrição:** Remove um relatório geral.
  - **Função Requerida:** Qualquer usuário autenticado.
  - *Fonte: `src/relatorio-geral/relatorio-geral.controller.ts`*
