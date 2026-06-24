# ADR-013 - Estratégia de Identidade do Usuário

## Status

Accepted

## Contexto

O módulo de autenticação será o primeiro domínio de negócio da plataforma Feedback Platform.

É necessário definir a estrutura inicial da entidade User, garantindo suporte a:

- Autenticação por email e senha
- Auditoria de dados
- Soft Delete
- Evolução futura para autorização e multi-tenancy

A decisão deve priorizar simplicidade para o MVP sem limitar a evolução da plataforma.

---

## Decisão

A entidade User será composta pelos seguintes campos:

```text
User

id
email
passwordHash
status
createdAt
updatedAt
deletedAt
```

---

## Identificador

O identificador principal será:

```text
UUID
```

Exemplo:

```text
550e8400-e29b-41d4-a716-446655440000
```

### Motivos

- Não expõe volume de registros
- Facilita integrações futuras
- Facilita migração para arquiteturas distribuídas
- Evita dependência de sequências globais

---

## Email

O email será utilizado como identidade única do usuário.

Restrições:

- Obrigatório
- Único
- Normalizado para comparação

Exemplo:

```text
usuario@email.com
```

---

## Password Hash

A senha nunca será armazenada em texto puro.

Será persistido apenas:

```text
passwordHash
```

O algoritmo de hash será definido na implementação da autenticação.

---

## Status do Usuário

Será utilizado um campo de status para controle de acesso.

Valores iniciais:

```text
ACTIVE
INACTIVE
```

### ACTIVE

Usuário pode autenticar e utilizar a plataforma.

### INACTIVE

Usuário existe na base mas não pode autenticar.

---

## Soft Delete

A remoção lógica será realizada através do campo:

```text
deletedAt
```

Quando preenchido:

```text
deletedAt != null
```

o usuário será considerado removido.

O registro permanecerá disponível para:

- Auditoria
- Histórico
- Recuperação de dados

---

## Auditoria

Todos os registros deverão possuir:

```text
createdAt
updatedAt
```

### createdAt

Data de criação do usuário.

### updatedAt

Data da última atualização.

---

## Modelo Inicial

```text
User

id UUID
email VARCHAR
passwordHash VARCHAR
status ENUM
createdAt DATETIME
updatedAt DATETIME
deletedAt DATETIME NULL
```

---

## Alternativas Consideradas

### Auto Increment

```text
BIGINT
```

Rejeitado por expor volume de registros e dificultar futuras integrações.

### Exclusão Física

```text
DELETE
```

Rejeitada devido à perda de histórico e auditoria.

### Usuário sem Status

```text
id
email
passwordHash
```

Rejeitado por limitar o gerenciamento operacional dos usuários.

---

## Consequências Positivas

- Auditoria completa
- Facilidade de recuperação de usuários
- Flexibilidade para futuras regras de autorização
- Compatibilidade com arquiteturas distribuídas
- Maior segurança operacional

---

## Consequências Negativas

- Consultas devem considerar registros removidos logicamente
- Necessidade de filtros para soft delete
- Estrutura ligeiramente mais complexa que o modelo mínimo

---

## Relação com Outras ADRs

Esta decisão complementa:

- ADR-006 - JWT Authentication
- ADR-008 - Modular Monolith
- ADR-009 - Multi-Tenancy
- ADR-012 - Clean Architecture por Módulo

Esta ADR servirá como base para a implementação da FEAT-006 - User Registration.
