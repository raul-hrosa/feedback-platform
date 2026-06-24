# EP-01 - Authentication

## Objetivo

Permitir que usuários criem contas, realizem autenticação e acessem áreas protegidas da plataforma.

Este é o primeiro domínio de negócio da aplicação e servirá como base para todos os módulos futuros.

---

# FEAT-006 - User Registration

## Objetivo

Permitir o cadastro de novos usuários.

### Checklist

- [ ] Criar entidade User
- [ ] Criar migration da tabela users
- [ ] Criar DTO de registro
- [ ] Implementar validações
- [ ] Implementar hash de senha
- [ ] Criar endpoint de registro
- [ ] Criar testes unitários
- [ ] Criar testes de integração

### Critérios de Aceite

- Email é obrigatório
- Email deve ser único
- Senha deve ser armazenada com hash
- Usuário é criado com sucesso
- Senha nunca é retornada pela API

---

# FEAT-007 - User Login

## Objetivo

Permitir autenticação por email e senha.

### Checklist

- [ ] Criar DTO de login
- [ ] Validar credenciais
- [ ] Implementar autenticação
- [ ] Retornar JWT
- [ ] Criar testes unitários
- [ ] Criar testes de integração

### Critérios de Aceite

- Usuário autenticado recebe token JWT
- Credenciais inválidas retornam erro
- Senha não é retornada

---

# FEAT-008 - JWT Authentication

## Objetivo

Proteger endpoints privados.

### Checklist

- [ ] Configurar JWT Module
- [ ] Criar Auth Guard
- [ ] Criar decorator CurrentUser
- [ ] Proteger rotas privadas
- [ ] Criar endpoint de perfil
- [ ] Criar testes

### Critérios de Aceite

- Endpoint protegido sem token retorna 401
- Endpoint protegido com token válido retorna 200
- Usuário autenticado pode consultar seu perfil

---

# FEAT-009 - Password Recovery

## Objetivo

Permitir redefinição de senha.

### Checklist

- [ ] Criar endpoint solicitar recuperação
- [ ] Gerar token de recuperação
- [ ] Criar endpoint redefinir senha
- [ ] Atualizar senha do usuário
- [ ] Criar testes

### Critérios de Aceite

- Token de recuperação é gerado
- Senha pode ser redefinida
- Token inválido retorna erro

---

# Modelo Inicial

## User

Campos previstos:

```text
id
email
passwordHash
createdAt
updatedAt
```

---

# Fora do Escopo

Não faz parte deste épico:

- OAuth
- Login Google
- Login Microsoft
- MFA
- Refresh Tokens
- Roles
- Permissions
- Company
- Multi-tenancy

Esses assuntos serão tratados em épicos futuros.

---

# Resultado Esperado

Ao concluir o EP-01 será possível:

- Criar conta
- Fazer login
- Receber JWT
- Acessar rotas protegidas
- Recuperar senha

A plataforma terá seu primeiro domínio de negócio completo e funcional.
