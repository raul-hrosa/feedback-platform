# ADR-009 - Estratégia de Multi-Tenancy

## Status

Accepted

## Contexto

A plataforma atenderá múltiplas empresas utilizando a mesma infraestrutura.

## Decisão

Utilizar estratégia Shared Database, Shared Schema.

Todos os registros possuirão um identificador de empresa (companyId).

## Exemplo

Users
Companies
Units
Feedbacks

Todos os dados serão vinculados a uma empresa.

## Alternativas Consideradas

- Database por cliente
- Schema por cliente

## Motivos

- Simplicidade operacional
- Menor custo
- Escalabilidade adequada para o MVP

## Consequências

- Necessidade de isolamento lógico rigoroso
- Validação obrigatória do companyId em consultas
