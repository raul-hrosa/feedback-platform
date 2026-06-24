# ADR-007 - Utilizar Redis e BullMQ para Processamento Assíncrono

## Status

Accepted

## Contexto

Funcionalidades futuras exigirão processamento assíncrono.

Exemplos:

- Envio de emails
- Relatórios
- Classificação por IA

## Decisão

Utilizar Redis como broker e BullMQ como sistema de filas.

## Alternativas Consideradas

- RabbitMQ
- AWS SQS

## Motivos

- Simplicidade operacional
- Integração com NestJS
- Baixa complexidade para MVP

## Consequências

- Dependência adicional de infraestrutura
