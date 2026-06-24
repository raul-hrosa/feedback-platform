# ADR-006 - Utilizar JWT para Autenticação

## Status

Accepted

## Contexto

A API será consumida pelo frontend web e futuramente poderá atender outros clientes.

## Decisão

Utilizar autenticação baseada em JWT.

## Alternativas Consideradas

- Session Cookies
- OAuth Server próprio

## Motivos

- Stateless
- Escalabilidade horizontal
- Ampla adoção no mercado

## Consequências

- Necessidade de estratégia para revogação de tokens
