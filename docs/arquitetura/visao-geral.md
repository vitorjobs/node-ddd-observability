---
outline: deep
---

# Visão geral da arquitetura

## Organização por responsabilidade

| Caminho | Papel |
| --- | --- |
| `src/server.ts` | Ponto de entrada da aplicação. |
| `src/app.ts` | Montagem do Fastify, hooks globais e registro de rotas. |
| `src/http/routes/` | Borda HTTP atual da aplicação. |
| `src/domain/` | Entidades, value objects e use cases. |
| `src/telemetry/` | SDK, auto-instrumentação e camada manual de observabilidade. |
| `infra/` | Stack Docker e configurações operacionais. |
| `docs/` | Documentação técnica da solução. |

## Fluxo de request no estado atual

```txt
HTTP request
   ->
Fastify route
   ->
metadata de telemetria da rota
   ->
runObservedOperation()
   ->
regra principal
   ->
logs, métricas e spans
   ->
OTel Collector
```

## Papel das funções centrais

| Função | Arquivo | Responsabilidade |
| --- | --- | --- |
| `bootstrap()` | `src/server.ts` | Sobe a aplicação e registra log de início. |
| `buildApp()` | `src/app.ts` | Cria a instância Fastify e conecta telemetria + rotas. |
| `registerRoutes()` | `src/http/routes/index.ts` | Organiza o registro das rotas. |
| `registerHttpTelemetry()` | `src/telemetry/application-telemetry.ts` | Hooks HTTP globais para rastreamento e métricas. |
| `runObservedOperation()` | `src/telemetry/application-telemetry.ts` | Instrumentação manual da operação principal. |

## Regras arquiteturais recomendadas

:::tip Regra de ouro
OpenTelemetry deve ficar concentrado na borda da aplicação e na camada de telemetria, não espalhado em entidades e value objects.
:::

- O domínio deve permanecer independente de Fastify e Docker.
- Rotas devem declarar sua operação de forma semântica.
- Controllers futuros podem chamar use cases, mas a observabilidade deve continuar centralizada.
- Métricas devem usar atributos estáveis; contexto de alta cardinalidade deve ficar em spans e logs.

## O que muda quando entrarem controllers

```txt
Route
   ->
Controller
   ->
Use Case
   ->
Repository / DB / API externa
```

Nesse cenário:

- a rota continua declarando `config.telemetry`
- o controller passa a orquestrar entrada e saída
- o use case continua focado em negócio
- a instrumentação continua usando `runObservedOperation()` na borda
