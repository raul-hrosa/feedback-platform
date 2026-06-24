# ADR-011 - Organizar a Aplicação em Core e Modules

## Status

Accepted

## Contexto

A plataforma Feedback Platform será desenvolvida como um monólito modular utilizando NestJS.

Durante a evolução do produto serão adicionados múltiplos domínios de negócio, incluindo:

- Authentication
- Company
- Unit
- Feedback
- Dashboard
- Notifications

Além dos módulos de negócio, também existirão componentes compartilhados de infraestrutura, como:

- Database
- Configuration
- Logging
- Health Checks
- Queues

É necessário definir uma estrutura que mantenha a separação entre regras de negócio e componentes técnicos compartilhados.

## Decisão

Organizar o backend utilizando duas áreas principais:

```text
src/

core/
├── database/
├── config/
├── logger/
└── health/

modules/
├── auth/
├── company/
├── unit/
├── feedback/
├── dashboard/
└── notification/
```

## Definições

### Core

Contém componentes técnicos compartilhados por toda a aplicação.

Esses componentes não pertencem a um domínio de negócio específico.

Exemplos:

- Database
- Configuração
- Logging
- Monitoramento
- Filas

### Modules

Contém os domínios de negócio da aplicação.

Cada módulo deve encapsular:

- Controllers
- Services
- DTOs
- Entidades
- Casos de uso

Relacionados ao seu domínio.

## Alternativas Consideradas

### Estrutura Flat

```text
src/

auth/
company/
feedback/
database/
config/
```

Rejeitada por dificultar a separação entre infraestrutura e negócio.

### Clean Architecture Completa

```text
src/

application/
domain/
infrastructure/
```

Não adotada neste momento devido ao aumento de complexidade para o estágio atual do projeto.

Poderá ser considerada futuramente.

## Consequências Positivas

- Organização clara dos domínios
- Separação entre negócio e infraestrutura
- Facilidade de manutenção
- Evolução gradual para arquiteturas mais sofisticadas
- Menor acoplamento entre módulos

## Consequências Negativas

- Necessidade de disciplina para evitar dependências indevidas
- Possível refatoração futura caso a arquitetura evolua para Clean Architecture completa

## Exemplo

```text
src/

core/
└── database/

modules/
└── auth/
    ├── controllers/
    ├── services/
    ├── dto/
    └── entities/
```
