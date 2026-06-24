# ADR-003 - Utilizar NestJS para Backend

## Status

Accepted

## Contexto

O backend será composto por múltiplos módulos de negócio e integrações futuras.

## Decisão

Utilizar NestJS como framework principal.

## Alternativas Consideradas

- Express
- Fastify
- AdonisJS

## Motivos

- Modularização nativa
- Dependency Injection
- Facilidade para testes
- Arquitetura alinhada com aplicações enterprise

## Consequências

- Maior quantidade de abstrações
- Menor simplicidade quando comparado ao Express puro
