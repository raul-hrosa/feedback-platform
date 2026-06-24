# ADR-008 - Utilizar Arquitetura Modular Monolith

## Status

Accepted

## Contexto

O produto será desenvolvido por uma única pessoa e possui escopo limitado para o MVP.

## Decisão

Implementar um monólito modular organizado por domínios de negócio.

## Estrutura Esperada

- Auth
- Company
- Unit
- Feedback
- Dashboard
- Notification

## Alternativas Consideradas

- Microsserviços
- Monólito tradicional sem módulos

## Motivos

- Menor complexidade operacional
- Deploy simplificado
- Maior velocidade de desenvolvimento
- Possibilidade de extração futura de serviços

## Consequências Positivas

- Menor custo de manutenção
- Facilidade de debug

## Consequências Negativas

- Crescimento exige disciplina arquitetural
