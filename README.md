# Projeto Cypress QA - ServeRest

Projeto de automacao de testes para a aplicacao [ServeRest](https://serverest.dev) utilizando **Cypress 16.3.0**, cobrindo testes de API e testes E2E de interface.

O ServeRest e uma API REST gratuita que simula um e-commerce, utilizada como ambiente-alvo para validar fluxos de cadastro, autenticacao, gestao de produtos e carrinho de compras.

---

## Indice

- [Pre-requisitos](#pre-requisitos)
- [Como executar o projeto](#como-executar-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura e decisoes tecnicas](#arquitetura-e-decisoes-tecnicas)
- [Cenarios de teste - API](#cenarios-de-teste---api)
- [Cenarios de teste - E2E (UI)](#cenarios-de-teste---e2e-ui)
- [Custom Commands](#custom-commands)
- [URLs do ambiente](#urls-do-ambiente)

---

## Pre-requisitos

- **Node.js** 22 ou superior
- **npm** (incluido com o Node.js)
- **Git**

> Para verificar se o Node.js esta instalado, execute `node -v` no terminal. Caso nao tenha, baixe em [nodejs.org](https://nodejs.org).

---

## Como executar o projeto

### 1. Clonar o repositorio

```bash
git clone https://github.com/seu-usuario/motusit-serverest-cypress.git
cd motusit-serverest-cypress
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Executar os testes

#### Modo interativo (Cypress Runner)

Abre a interface grafica do Cypress para selecionar e acompanhar os testes visualmente:

```bash
npx cypress open
```

#### Todos os testes (headless)

Executa todos os testes no terminal, sem interface grafica:

```bash
npx cypress run
```

#### Apenas testes de API

```bash
npx cypress run --spec "cypress/e2e/api/**"
```

#### Apenas testes E2E (UI)

```bash
npx cypress run --spec "cypress/e2e/ui/**"
```

#### Um spec especifico

```bash
npx cypress run --spec "cypress/e2e/api/users.cy.js"
```

> **Nota:** Os testes utilizam a API publica do ServeRest (`serverest.dev`), que e compartilhada entre usuarios. Dados de teste sao gerados dinamicamente com `Date.now()` para evitar colisao.

---

## Estrutura do Projeto

```
motusit-serverest-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── api/                        # Testes de API (3 specs, 25 testes)
│   │   │   ├── users.cy.js             # 8 testes - CRUD de usuarios
│   │   │   ├── products.cy.js          # 11 testes - CRUD de produtos
│   │   │   └── shopping-carts.cy.js    # 6 testes - fluxo de carrinho e estoque
│   │   └── ui/                         # Testes E2E de UI (3 specs)
│   │       ├── login.cy.js             # Login com credenciais validas
│   │       ├── user-registration.cy.js # Cadastro de novo usuario
│   │       └── product-registration.cy.js # Cadastro de produto (admin)
│   ├── fixtures/
│   │   ├── users.json                  # Templates de dados de usuario
│   │   └── products.json               # Templates de dados de produto
│   └── support/
│       ├── api-commands.js             # 11 Custom Commands de API
│       ├── gui-commands.js             # 3 Custom Commands de UI
│       └── e2e.js                      # Importa os commands
├── cypress.config.js                   # Configuracao do Cypress
├── package.json
├── .gitignore
└── README.md
```

---

## Arquitetura e decisoes tecnicas

| Decisao | Justificativa |
|---------|---------------|
| **Custom Commands** em vez de Page Objects | Recomendacao oficial do Cypress - Page Objects sao uma abstracao do Selenium desnecessaria no contexto do Cypress |
| **Dois modos de login** | Login via UI apenas no spec que testa o login; demais specs usam login programatico via API com `cy.session()` para performance |
| **Dados dinamicos** com `Date.now()` | Evita colisao de dados entre execucoes paralelas ou sequenciais na API publica |
| **`failOnStatusCode: false`** nos commands de API | Permite que o spec valide o status code via assertion, nao via excecao do Cypress |
| **`Cypress.expose()`** para configuracao | Cypress 16 - substitui `Cypress.env()` para valores publicos como a URL da API |
| **Fixtures** para dados de teste | Dados estaticos reutilizaveis centralizados em JSON, com override por parametro |
| **Zero `cy.wait(numero)`** | Esperas explicitas por elementos, rotas interceptadas ou assertions - nunca timeouts arbitrarios |

---

## Cenarios de teste - API

Os testes de API estao organizados em **3 specs com 25 testes**, divididos em duas camadas:

- **Camada 1 - Testes individuais de endpoint** (`users.cy.js`, `products.cy.js`): validam contrato de resposta, regras de input e regras de negocio por endpoint.
- **Camada 2 - Testes de fluxo de negocio** (`shopping-carts.cy.js`): validam a interacao entre recursos e side effects no estoque.

### `users.cy.js` - Usuarios (8 testes)

| # | Cenario | Status esperado | O que valida |
|---|---------|-----------------|--------------|
| 1 | Cadastrar usuario com dados validos | 201 | Contrato de resposta (`_id`, `message`) |
| 2 | Impedir cadastro com email duplicado | 400 | Regra de unicidade de email |
| 3 | Impedir cadastro com email invalido | 400 | Validacao de formato de input |
| 4 | Impedir cadastro com campos ausentes | 400 | Validacao de campos obrigatorios |
| 5 | Retornar usuario por ID | 200 | Contrato de resposta (campos e tipos) |
| 6 | Retornar erro para ID inexistente | 400 | Tratamento de recurso nao encontrado |
| 7 | Excluir usuario com sucesso | 200 | Fluxo completo: criar, confirmar, excluir |
| 8 | Impedir exclusao de usuario com carrinho ativo | 400 | Regra de integridade referencial |

**Justificativa:** Usuarios sao o recurso base da aplicacao - toda autenticacao e autorizacao depende deles. Este spec cobre o ciclo CRUD completo com validacoes de input, contrato e regras de negocio que protegem a integridade dos dados.

### `products.cy.js` - Produtos (11 testes)

| # | Cenario | Status esperado | O que valida |
|---|---------|-----------------|--------------|
| 1 | Cadastrar produto com token admin | 201 | Criacao autenticada com sucesso |
| 2 | Impedir cadastro com nome duplicado | 400 | Regra de unicidade de nome |
| 3 | Rejeitar requisicao sem token | 401 | Autenticacao obrigatoria |
| 4 | Rejeitar requisicao de usuario nao-admin | 403 | Autorizacao por perfil (role-based) |
| 5 | Impedir cadastro com campos ausentes | 400 | Validacao de campos obrigatorios |
| 6 | Retornar produto por ID | 200 | Contrato de resposta (campos e tipos) |
| 7 | Retornar erro para ID inexistente | 400 | Tratamento de recurso nao encontrado |
| 8 | Editar produto existente | 200 | Atualizacao de recurso |
| 9 | Criar produto via upsert (PUT com ID inexistente) | 201 | Comportamento de upsert da API |
| 10 | Excluir produto com sucesso | 200 | Exclusao de recurso |
| 11 | Impedir exclusao de produto em carrinho ativo | 400 | Regra de integridade referencial |

**Justificativa:** Produtos sao o recurso central do e-commerce e o unico que exige autenticacao e autorizacao. Este spec valida o CRUD completo, incluindo cenarios de autorizacao (401/403) que nao se aplicam a usuarios, e o comportamento de upsert do PUT, que e uma particularidade da API.

### `shopping-carts.cy.js` - Carrinhos e estoque (6 testes)

| # | Cenario | Status esperado | O que valida |
|---|---------|-----------------|--------------|
| 1 | Decrementar estoque ao criar carrinho | 201 | Side effect: estoque reduzido |
| 2 | Impedir criacao com estoque insuficiente | 400 | Validacao de quantidade disponivel |
| 3 | Impedir segundo carrinho para mesmo usuario | 400 | Regra de limite: 1 carrinho por usuario |
| 4 | Impedir produto duplicado no carrinho | 400 | Regra de unicidade de item |
| 5 | Concluir compra sem restaurar estoque | 200 | Estoque consumido (compra efetivada) |
| 6 | Cancelar compra restaurando estoque | 200 | Estoque devolvido (compra cancelada) |

**Justificativa:** Carrinhos sao o fluxo de negocio mais critico - envolvem interacao entre recursos (usuario, produto, carrinho) e side effects no estoque. Os testes 5 e 6 formam o par mais importante: mesmo setup, mesmo cenario, **resultado oposto** no estoque, validando que concluir consome e cancelar devolve.

---

## Cenarios de teste - E2E (UI)

Os testes de UI cobrem **3 cenarios E2E** no frontend (`front.serverest.dev`), escolhidos para complementar a cobertura de API com validacao da interface real.

### `login.cy.js` - Login com sucesso

**Prioridade:** Alta

| Passo | Acao |
|-------|------|
| 1 | Visitar `/login` |
| 2 | Preencher email e senha |
| 3 | Clicar em "Entrar" |
| 4 | Verificar redirecionamento para `/admin/home` |
| 5 | Verificar que o nome do usuario aparece na tela |

**Justificativa:** O login e o ponto de entrada da aplicacao. Sem ele funcional, nenhuma funcionalidade protegida e acessivel. Este e o **unico cenario onde o login e feito via UI** - todos os demais usam `cy.loginViaAPI()`. Valida a integracao frontend com a API de autenticacao, o armazenamento do token no `localStorage` e o redirecionamento baseado em role.

### `user-registration.cy.js` - Cadastro de novo usuario

**Prioridade:** Alta

| Passo | Acao |
|-------|------|
| 1 | Visitar `/cadastrarusuarios` |
| 2 | Preencher nome, email (dinamico) e senha |
| 3 | Marcar checkbox de administrador |
| 4 | Clicar em "Cadastrar" |
| 5 | Verificar mensagem de sucesso |
| 6 | Verificar redirecionamento automatico |

**Justificativa:** Fluxo CRUD publico (nao requer autenticacao previa) que valida a integracao com `POST /usuarios`, o auto-login pos-cadastro e o redirect com `setTimeout`. Exercita multiplos tipos de input (text, email, password, checkbox).

### `product-registration.cy.js` - Cadastro de produto (admin)

**Prioridade:** Alta | **Pre-condicao:** Login via API

| Passo | Acao |
|-------|------|
| 1 | Login via API (`cy.loginViaAPI()`) |
| 2 | Visitar `/admin/cadastrarprodutos` |
| 3 | Preencher nome, preco, descricao e quantidade |
| 4 | Clicar em "Cadastrar" |
| 5 | Verificar redirecionamento para `/admin/listarprodutos` |
| 6 | Verificar que o produto aparece na tabela |

**Justificativa:** Operacao de negocio central do e-commerce, em fluxo autenticado. Demonstra o padrao `cy.loginViaAPI()` + `cy.session()` para specs que nao testam o login. Valida a integracao com `POST /produtos` e a renderizacao do produto na listagem.

### Por que esses 3 cenarios?

A combinacao dos 3 cenarios de UI foi escolhida para maximizar a cobertura com o minimo de testes:

| Aspecto coberto | Login | Cadastro usuario | Cadastro produto |
|-----------------|:-----:|:----------------:|:----------------:|
| Fluxo publico (sem auth) | x | x | |
| Fluxo autenticado (com token) | | | x |
| Login via UI (`cy.session`) | x | | |
| Login via API (`cy.loginViaAPI`) | | | x |
| Validacao de formulario | x | x | x |
| Integracao frontend - API | x | x | x |
| Redirecionamento pos-acao | x | x | x |

---

## Custom Commands

### API (`api-commands.js`)

| Command | Endpoint | Descricao |
|---------|----------|-----------|
| `cy.login(email, password)` | `POST /login` | Autentica e armazena o token |
| `cy.createUser(overrides)` | `POST /usuarios` | Cria usuario com dados dinamicos |
| `cy.getUser(id)` | `GET /usuarios/{id}` | Busca usuario por ID |
| `cy.deleteUser(id)` | `DELETE /usuarios/{id}` | Exclui usuario |
| `cy.createProduct(overrides)` | `POST /produtos` | Cria produto com token autenticado |
| `cy.getProduct(id)` | `GET /produtos/{id}` | Busca produto por ID |
| `cy.updateProduct(id, overrides)` | `PUT /produtos/{id}` | Edita produto |
| `cy.deleteProduct(id)` | `DELETE /produtos/{id}` | Exclui produto |
| `cy.createCart(produtos)` | `POST /carrinhos` | Cria carrinho com itens |
| `cy.completePurchase()` | `DELETE /carrinhos/concluir-compra` | Conclui compra (estoque consumido) |
| `cy.cancelPurchase()` | `DELETE /carrinhos/cancelar-compra` | Cancela compra (estoque devolvido) |

### UI (`gui-commands.js`)

| Command | Descricao |
|---------|-----------|
| `cy.getBySel(selector)` | Busca elemento por `data-testid` |
| `cy.loginViaUI(email, password)` | Login pela interface com `cy.session()` |
| `cy.loginViaAPI(email, password)` | Login programatico via API com `cy.session()` |

---

## URLs do ambiente

| Recurso | URL |
|---------|-----|
| Frontend ServeRest | https://front.serverest.dev |
| API ServeRest (Swagger) | https://serverest.dev |
