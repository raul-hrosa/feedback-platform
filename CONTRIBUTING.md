# Contributing

## Commits

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/). O formato é obrigatório e validado automaticamente pelo Commitlint no `commit-msg` hook.

### Formato

```
<type>(<scope>): <subject>
```

### Types

| Type       | Quando usar                             |
| ---------- | --------------------------------------- |
| `feat`     | Nova funcionalidade                     |
| `fix`      | Correção de bug                         |
| `docs`     | Documentação                            |
| `style`    | Formatação (sem mudança de lógica)      |
| `refactor` | Refatoração sem nova feature ou fix     |
| `test`     | Adição ou correção de testes            |
| `chore`    | Tarefas de build, configs, dependências |
| `perf`     | Melhoria de performance                 |
| `ci`       | Mudanças em CI/CD                       |

### Scopes sugeridos

`api`, `web`, `auth`, `company`, `unit`, `feedback`, `dashboard`, `db`, `infra`

### Exemplos

```
feat(auth): add JWT login endpoint
fix(feedback): correct NPS score calculation
chore(deps): update prisma to v7
docs: add CONTRIBUTING guide
refactor(api): move database to core module
```

## Workflow

### Pré-requisitos

- Node.js 22+
- Docker (para MySQL e Redis)

### Setup

```bash
npm install
docker compose -f infra/docker/docker-compose.yml up -d mysql redis
```

### Desenvolvimento

```bash
npx nx serve api   # API NestJS em http://localhost:3003
npx nx serve web   # Angular em http://localhost:4200
```

### Antes de commitar

O Husky roda automaticamente no `pre-commit`:

- **lint-staged** — Prettier + ESLint apenas nos arquivos staged

E no `commit-msg`:

- **commitlint** — valida o formato da mensagem

```bash
npm run format:check   # verificar formatação
npm run lint           # rodar ESLint em todos os projetos
```
