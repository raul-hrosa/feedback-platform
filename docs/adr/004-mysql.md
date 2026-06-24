# ADR-004 - Utilizar MySQL

## Status

Accepted

## Contexto

A plataforma necessita de armazenamento relacional para gerenciamento de empresas, unidades, usuários e feedbacks.

Os requisitos atuais não demandam funcionalidades específicas de bancos especializados.

## Decisão

Utilizar MySQL como banco de dados principal da aplicação.

## Alternativas Consideradas

- PostgreSQL
- SQL Server
- MongoDB

## Motivos

- Ampla adoção no mercado
- Facilidade de hospedagem
- Boa integração com Prisma
- Conhecimento prévio da equipe
- Excelente suporte para aplicações SaaS

## Consequências Positivas

- Simplicidade operacional
- Grande disponibilidade de profissionais
- Ecossistema maduro

## Consequências Negativas

- Menor quantidade de recursos analíticos avançados quando comparado ao PostgreSQL
- Algumas funcionalidades específicas exigem soluções alternativas
