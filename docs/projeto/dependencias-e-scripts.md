---
outline: deep
---

# Dependências e scripts

## Scripts principais

| Script | Comando | Uso |
| --- | --- | --- |
| `start:dev` | `node --env-file=.env --import tsx --watch src/server.ts` | Desenvolvimento com reload. |
| `start:local` | `node --env-file=.env --import tsx src/server.ts` | Execução local simples. |
| `build` | `tsup src --out-dir build` | Build da aplicação. |
| `test` | `vitest run` | Testes automatizados. |
| `docs:dev` | `vitepress dev docs` | Desenvolvimento da documentação. |
| `docs:build` | `vitepress build docs` | Build estático da documentação. |
| `observability:up` | `docker compose -f infra/docker-compose.yml up -d --build` | Sobe a stack completa. |
| `observability:down` | `docker compose -f infra/docker-compose.yml down -v` | Derruba a stack e remove volumes. |
| `observability:logs` | `docker compose -f infra/docker-compose.yml logs -f` | Acompanha logs da stack. |
| `observability:ps` | `docker compose -f infra/docker-compose.yml ps` | Lista status dos containers. |
| `observability:smoke` | `bash infra/scripts/generate-telemetry.sh` | Gera tráfego para validar telemetria. |

## Dependências de runtime

| Biblioteca | Papel no projeto |
| --- | --- |
| `fastify` | Servidor HTTP da aplicação. |
| `@fastify/otel` | Instrumentação do Fastify orientada ao ecossistema atual do framework. |
| `@opentelemetry/api` | API base de tracing, metrics e logs. |
| `@opentelemetry/sdk-node` | SDK principal do OpenTelemetry no Node.js. |
| `@opentelemetry/auto-instrumentations-node` | Pacote de auto-instrumentação para bibliotecas comuns do runtime. |
| `@opentelemetry/exporter-metrics-otlp-http` | Exportador OTLP/HTTP usado explicitamente para métricas. |
| `@opentelemetry/exporter-trace-otlp-http` | Dependência necessária para exportação OTLP de traces. |
| `@opentelemetry/resources` | Suporte a atributos de recurso como `service.name`. |

## Dependências de desenvolvimento

| Biblioteca | Papel no projeto |
| --- | --- |
| `typescript` | Tipagem e compilação. |
| `tsx` | Execução TypeScript no Node sem build prévio para desenvolvimento. |
| `vitest` | Testes unitários. |
| `vitepress` | Site da documentação. |
| `@types/node` | Tipos do Node.js. |

## Regras gerais de uso

:::info Convenção prática
O projeto usa bibliotecas de observabilidade tanto em código quanto em infraestrutura. A regra é simples: a aplicação produz telemetria, o Collector distribui e o Grafana consome os backends.
:::

- A aplicação não envia dados diretamente para Grafana.
- O Collector é o ponto central de ingestão.
- O Grafana consulta Tempo, Loki, Mimir e Prometheus.

## Checklist operacional rápido

```bash
npm run start:local
npm test
npm run docs:build
npm run observability:up
npm run observability:smoke
```
