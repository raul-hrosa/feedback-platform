# ADR-012 - Utilizar Clean Architecture por Módulo

## Status

Accepted

## Contexto

A plataforma Feedback Platform será desenvolvida utilizando uma arquitetura de Monólito Modular, organizada por domínios de negócio.

À medida que novos módulos forem adicionados, existe o risco de acoplamento entre regras de negócio, framework, banco de dados e infraestrutura.

É necessário definir uma estrutura que permita:

- Isolar regras de negócio
- Facilitar testes
- Reduzir acoplamento
- Permitir evolução da aplicação sem dependência excessiva de tecnologias específicas

## Decisão

Aplicar os princípios da Clean Architecture dentro de cada módulo de negócio.

A arquitetura será organizada em camadas:

```text
Module
├── Domain
├── Application
└── Infrastructure
```

Onde cada camada possui responsabilidades específicas e dependências unidirecionais.

## Estrutura

Exemplo utilizando o módulo Auth:

```text
modules/
└── auth/
    ├── domain/
    │   ├── entities/
    │   ├── repositories/
    │   └── errors/
    │
    ├── application/
    │   ├── dto/
    │   └── use-cases/
    │
    ├── infrastructure/
    │   ├── controllers/
    │   ├── repositories/
    │   └── persistence/
    │
    └── auth.module.ts
```

## Responsabilidades

### Domain

Contém regras de negócio puras.

Não possui dependência de:

- NestJS
- Prisma
- MySQL
- Redis
- Frameworks externos

Exemplos:

- Entities
- Value Objects
- Repository Contracts
- Domain Errors

### Application

Contém os casos de uso da aplicação.

Responsável por orquestrar regras de negócio.

Exemplos:

- RegisterUserUseCase
- LoginUserUseCase
- CreateCompanyUseCase
- CreateFeedbackUseCase

### Infrastructure

Contém implementações técnicas.

Responsável pela comunicação com sistemas externos.

Exemplos:

- Controllers
- Prisma Repositories
- Providers
- Gateways
- External Services

## Fluxo de Dependências

```text
Infrastructure
      ↓
Application
      ↓
Domain
```

As camadas internas nunca dependem das camadas externas.

## Exemplo

```text
AuthController
        ↓
RegisterUserUseCase
        ↓
UserRepository
        ↓
PrismaUserRepository
        ↓
MySQL
```

## Alternativas Consideradas

### Estrutura Tradicional NestJS

```text
auth/
├── controllers/
├── services/
├── dto/
└── entities/
```

Rejeitada por misturar regras de negócio e infraestrutura.

### Clean Architecture Global

```text
src/
├── application/
├── domain/
└── infrastructure/
```

Rejeitada por dificultar a separação por domínio e reduzir a modularidade da aplicação.

## Motivos

- Melhor organização por domínio
- Baixo acoplamento
- Facilidade para testes
- Evolução independente dos módulos
- Facilidade para substituição de tecnologias
- Alinhamento com princípios SOLID

## Consequências Positivas

- Regras de negócio independentes de frameworks
- Maior testabilidade
- Melhor manutenção a longo prazo
- Estrutura adequada para crescimento do produto

## Consequências Negativas

- Maior quantidade de arquivos
- Curva de aprendizado inicial
- Complexidade superior à estrutura padrão do NestJS

## Relação com Outras ADRs

Esta decisão complementa:

- ADR-008 - Modular Monolith
- ADR-011 - Organização em Core e Modules

A Clean Architecture será aplicada dentro dos módulos definidos pela arquitetura modular da aplicação.
