# EP-00 — Foundation

## O que foi entregue

### Monorepo

- Estrutura Nx com `apps/api`, `apps/web`, `packages/shared-types`, `packages/shared-ui`
- Configuração de workspaces npm

### Backend (NestJS)

- Aplicação NestJS funcional com `AppModule`
- Estrutura `core/` separada de `modules/` conforme ADR-011
- `core/database/` com `DatabaseModule`, `DatabaseService` e `DATABASE_CLIENT` token

### Banco de dados

- Schema Prisma com model `User` (primeira migration: `init`)
- Campos: `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- Migration executada e banco sincronizado

### Qualidade de código

- **Prettier** configurado com regras compartilhadas (`singleQuote`, `trailingComma`, `printWidth: 100`)
- **ESLint** compartilhado na raiz com integração Prettier, regras TypeScript e ignores para código gerado
- **Husky** com hooks `pre-commit` e `commit-msg`
- **lint-staged** — Prettier + ESLint apenas nos arquivos staged
- **Commitlint** com preset Conventional Commits

### Documentação

- `CONTRIBUTING.md` na raiz
- `docs/contributing.md` com branch strategy, conventional commits e PR checklist

### CI/CD

- GitHub Actions workflow (`ci.yml`) rodando em `pull_request` e `push` para `master`
- Pipeline: Install → Lint → Test → Build

### Repositório

- Git inicializado com branch `master`
- Remote configurado: `github.com/raul-hrosa/feedback-platform`
- Git user configurado localmente (separado da conta corporativa)

---

## ADRs Implementadas

| ADR     | Decisão                     | Status                    |
| ------- | --------------------------- | ------------------------- |
| ADR-001 | Monorepo com Nx             | Implementado              |
| ADR-002 | Frontend Angular            | Implementado              |
| ADR-003 | Backend NestJS              | Implementado              |
| ADR-004 | Banco MySQL                 | Implementado              |
| ADR-005 | ORM Prisma                  | Implementado              |
| ADR-008 | Modular Monolith            | Implementado              |
| ADR-011 | Estrutura Core + Modules    | Implementado              |
| ADR-006 | JWT Authentication          | Aceita — não implementada |
| ADR-007 | Redis + BullMQ              | Aceita — não implementada |
| ADR-009 | Multi-Tenancy por companyId | Aceita — não implementada |
| ADR-010 | API First                   | Aceita — não implementada |

---

## Arquitetura Atual

```text
apps/
├── api/
│   └── src/
│       ├── app/
│       │   └── app.module.ts
│       ├── core/
│       │   └── database/
│       │       ├── database.constants.ts
│       │       ├── database.module.ts
│       │       └── database.service.ts
│       └── generated/
│           └── prisma/
└── web/
    └── src/

prisma/
├── schema.prisma          ← model User
└── migrations/
    └── 20260624_init/

.github/
└── workflows/
    └── ci.yml
```

Nenhum módulo de negócio (`auth`, `company`, `unit`, `feedback`, `dashboard`) foi implementado ainda — apenas a infraestrutura base está pronta.

---

## Lições Aprendidas

**Prisma 7 removeu `url` do `schema.prisma`**
A propriedade `url` da datasource não é mais suportada no schema. A connection string deve ser configurada exclusivamente no `prisma.config.ts` via `defineConfig`.

**`DATABASE_URL` com hostname Docker não funciona para migrations locais**
O hostname `mysql` (nome do serviço Docker) só resolve dentro da rede Docker. Para rodar `prisma migrate dev` na máquina host, é necessário substituir por `localhost` ou sobrescrever a variável de ambiente no terminal.

**lint-staged passa arquivos ignorados explicitamente para o ESLint**
Quando o lint-staged seleciona arquivos staged, ele passa os caminhos absolutos para o ESLint. Arquivos em pastas ignoradas (como `generated/`) recebem um warning em vez de serem silenciados. A flag `--no-warn-ignored` resolve o problema.

**Git user precisa ser configurado por repositório para separar contas**
O `~/.gitconfig` global pode apontar para a conta corporativa. Para repositórios pessoais, usar `git config user.email` sem `--global` para configurar o email localmente no repositório, sem afetar o restante do ambiente.
