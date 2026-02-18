# Estrutura do Projeto Gamification (Connecta CI)

Este documento serve como guia para entender a organização do código, a arquitetura e as tecnologias utilizadas no projeto.

## 1. Visão Geral

O projeto é um sistema de gamificação para gestão de times (Connecta CI), composto por duas partes principais:
- **Backend**: API RESTful construída com Node.js, Express e PostgreSQL (via Prisma ORM).
- **Frontend**: Single-Page Application (SPA) construída com React, Vite e TypeScript.

## 2. Estrutura de Diretórios (Raiz)

```text
/
├── backend/            # Código fonte do servidor API
├── frontend/           # Código fonte da interface do usuário
├── .agent/             # Configurações de agentes de IA
├── setup.sh            # Script para instalação inicial e configuração
├── dev.sh              # Script para iniciar ambiente de desenvolvimento
└── README.md           # Documentação básica de introdução
```

## 3. Backend (`/backend`)

O backend segue uma arquitetura em camadas (Layered Architecture) para separar responsabilidades.

### Tecnologias Principais
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Linguagem**: TypeScript

### Organização de Pastas (`/backend/src`)

| Diretório | Descrição |
|-----------|-----------|
| `controllers/` | **Entrada da API**. Recebem as requisições HTTP, validam dados básicos e chamam os *Services*. Respondem ao cliente. |
| `services/` | **Regras de Negócio**. Contêm a lógica principal da aplicação. Não lidam diretamente com HTTP nem com SQL bruto. |
| `repositories/` | **Acesso a Dados**. Abstração sobre o Prisma. Responsáveis por buscar e salvar dados no banco. |
| `routes/` | **Definição de Rotas**. Mapeiam URLs para Controllers e aplicam Middlewares. |
| `middlewares/` | **Interceptadores**. Funções que rodam antes dos controllers (ex: Autenticação, Logging, Tratamento de Erros). |
| `schemas/` | **Validação**. Definições de estruturas de dados (provavelmente Zod ou Joi) para validar inputs. |
| `types/` | **Definições de Tipos**. Interfaces e tipos TypeScript compartilhados. |
| `utils/` | **Utilitários**. Funções auxiliares de uso geral. |
| `config/` | **Configuração**. Configurações de ambiente, banco de dados, etc. |

### Fluxo de uma Requisição
1. **Route**: Recebe o request (ex: `GET /users`).
2. **Middleware**: Valida token de acesso (se necessário).
3. **Controller**: Extrai parâmetros e chama o Service.
4. **Service**: Executa lógica (ex: verifica se usuário existe) e chama o Repository.
5. **Repository**: Consulta o banco de dados via Prisma.
6. **Controller**: Formata a resposta e devolve JSON ao frontend.

---

## 4. Frontend (`/frontend`)

O frontend é uma aplicação moderna em React, focada em performance e experiência do usuário.

### Tecnologias Principais
- **Framework**: React (com Vite)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS (dado o uso de classes utilitárias no código observado)
- **Ícones**: Lucide React (provável)

### Organização de Pastas (`/frontend/src`)

| Diretório | Descrição |
|-----------|-----------|
| `screens/` | **Páginas**. Componentes de alto nível que representam rotas/telas completas (ex: `DashboardScreen`, `ProjectDetailsScreen`). |
| `components/` | **Componentes UI**. Elementos reutilizáveis (botões, modais, cards). Ex: `TaskDetailModal`; |
| `services/` | **Integração API**. Funções para fazer chamadas HTTP ao backend (fetch/axios). |
| `hooks/` | **Custom Hooks**. Lógica de estado reutilizável e efeitos colaterais. |
| `assets/` | **Recursos**. Imagens, fontes e arquivos estáticos. |
| `types.ts` | **Tipagem**. Interfaces globais do frontend (Muitas vezes espelhando os dados do backend). |

## 5. Scripts de Automação

Na raiz do projeto, existem scripts para facilitar o dia a dia:

- **`./setup.sh`**: Prepara o ambiente. Instala dependências (backend e frontend), configura variáveis de ambiente (`.env`) e roda migrações do banco.
- **`./dev.sh`**: Inicia a aplicação. Roda simultaneamente o servidor backend e o servidor de desenvolvimento do frontend.

## 6. Padrões de Código

- **Nomenclatura**: CamelCase para variáveis/funções, PascalCase para Classes/Componentes.
- **Commits**: Seguir convenções semânticas se possível.
- **Arquivos**:
  - React Components: `.tsx`
  - Logic/Types: `.ts`
