# Contributing Guide

## Branch Strategy

Este projeto usa um fluxo baseado em `main` como branch de produção.

### Branches

| Branch            | Propósito                                |
| ----------------- | ---------------------------------------- |
| `main`            | Produção — sempre estável                |
| `feat/<slug>`     | Nova funcionalidade                      |
| `fix/<slug>`      | Correção de bug                          |
| `chore/<slug>`    | Configuração, deps, infra                |
| `docs/<slug>`     | Documentação                             |
| `refactor/<slug>` | Refatoração sem mudança de comportamento |

### Fluxo

```
main
 └── feat/auth-login
      └── [commits]
           └── Pull Request → main
```

1. Crie uma branch a partir de `main`
2. Faça commits seguindo Conventional Commits
3. Abra um Pull Request para `main`
4. Após aprovação e CI verde, faça merge com **Squash and Merge**

---

## Conventional Commits

Formato obrigatório, validado automaticamente pelo Commitlint.

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
docs: add contributing guide
refactor(api): move database to core module
```

---

## Pull Request Checklist

Antes de abrir um PR, confirme:

- [ ] Branch criada a partir de `main` atualizado
- [ ] Commits seguem Conventional Commits
- [ ] `npm run lint` passa sem erros
- [ ] `npm run format:check` passa sem erros
- [ ] `npm run test` passa sem falhas
- [ ] Nenhum `console.log` de debug esquecido
- [ ] Variáveis de ambiente novas documentadas no `.env.example`
- [ ] Migrations do Prisma incluídas se houve mudança de schema
- [ ] Título do PR segue o formato: `type(scope): descrição`
