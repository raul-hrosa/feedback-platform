# ADR-001 - Utilizar Monorepo com Nx

## Status

Accepted

## Contexto

O produto possui frontend, backend, documentação e bibliotecas compartilhadas.

É desejável centralizar a gestão do código e reduzir duplicações.

## Decisão

Utilizar arquitetura Monorepo baseada em Nx.

## Alternativas Consideradas

- Repositórios separados
- Turborepo

## Consequências Positivas

- Compartilhamento de tipos entre frontend e backend
- Build centralizado
- Gestão simplificada
- Escalabilidade para novos apps

## Consequências Negativas

- Curva inicial de aprendizado
- Pipeline mais complexa que um repositório simples
