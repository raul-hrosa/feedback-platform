# Project NPS

Plataforma SaaS multi-tenant para coleta e analise de feedbacks NPS.

## Stack

- Nx monorepo
- Angular em `apps/web`
- NestJS em `apps/api`
- Tipos compartilhados em `packages/shared-types`
- UI compartilhada em `packages/shared-ui`
- TypeScript

## Requisitos

- Node.js 20+
- npm 10+

## Instalar dependencias

```bash
npm install
```

## Executar localmente

### Angular

```bash
npx nx serve web
```

URL local:

```text
http://localhost:4200
```

### NestJS

```bash
npx nx serve api
```

URL local:

```text
http://localhost:3003/api
```

Para sobrescrever a porta da API:

```bash
PORT=3004 npx nx serve api
```

No PowerShell:

```powershell
$env:PORT = "3004"; npx nx serve api
```

## Comandos do workspace

Rodar build de todos os projetos:

```bash
npm run build
```

Rodar testes de todos os projetos:

```bash
npm run test
```

Rodar lint de todos os projetos:

```bash
npm run lint
```

Listar projetos registrados no Nx:

```bash
npx nx show projects
```

Saida esperada:

```json
["shared-types", "shared-ui", "api", "web"]
```

## Comandos por projeto

Build:

```bash
npx nx build web
npx nx build api
npx nx build shared-types
```

Testes:

```bash
npx nx test web
npx nx test api
npx nx test shared-types
npx nx test shared-ui
```

Lint:

```bash
npx nx lint web
npx nx lint api
npx nx lint shared-types
npx nx lint shared-ui
```

## Aliases TypeScript

Os path mappings ficam em `tsconfig.base.json`.

Aliases configurados:

```text
@project-nps/api/*
@project-nps/web/*
@project-nps/shared-types
@project-nps/shared-types/*
@project-nps/shared-ui
@project-nps/shared-ui/*
```
