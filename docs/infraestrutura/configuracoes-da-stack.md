---
outline: deep
---

# Configurações da stack

Esta página detalha como os arquivos dentro de `infra/ops/` e `infra/images/` trabalham juntos.

## `infra/ops/otel-collector-config.yaml`

Este é o coração operacional da ingestão de telemetria.

### Receivers

- `otlp.grpc` em `4317`
- `otlp.http` em `4318`

Isso permite receber telemetria OTLP por dois protocolos.

### Processors

- `memory_limiter`: protege o Collector contra uso excessivo de memória
- `batch`: agrupa envios para reduzir overhead

### Exporters

| Exporter | Destino |
| --- | --- |
| `otlp_grpc/tempo` | traces para Tempo |
| `otlp_http/mimir` | métricas para Mimir |
| `otlp_http/prometheus` | métricas para Prometheus |
| `otlp_http/loki` | logs para Loki |

### Pipelines

| Pipeline | Fluxo |
| --- | --- |
| `traces` | `otlp -> processors -> tempo` |
| `metrics` | `otlp -> processors -> mimir + prometheus` |
| `logs` | `otlp -> processors -> loki` |

### Telemetria do próprio Collector

O bloco `service.telemetry.metrics` expõe métricas internas em modo `pull`, na porta `8888`.

Essas métricas são raspadas pelo Prometheus.

## `infra/ops/prometheus.yml`

Funções principais:

- raspar métricas da stack
- receber métricas OTLP
- promover atributos de recurso
- encaminhar dados para o Mimir via `remote_write`

### `otlp.promote_resource_attributes`

Promove atributos importantes para labels utilizáveis:

- `service.name`
- `service.namespace`
- `service.version`
- `deployment.environment.name`

### `scrape_configs`

O Prometheus raspa:

- ele mesmo
- `otel-collector`
- `grafana`
- `tempo`
- `loki`
- `mimir`

Resultado:

- observabilidade da aplicação
- observabilidade da própria plataforma

## `infra/ops/tempo.yaml`

O Tempo está configurado em modo local simples:

- recebe OTLP por gRPC e HTTP
- armazena traces em filesystem local
- retém blocos por 24h

É suficiente para desenvolvimento e validação local.

## `infra/ops/loki.yaml`

O Loki usa:

- armazenamento em filesystem
- schema `v13`
- metadata estruturada habilitada

Isso favorece:

- consultas locais simples
- correlação de logs com trace IDs

## `infra/ops/mimir.yaml`

O Mimir está em modo single-node local com:

- multitenancy desabilitada
- storage em filesystem
- limites de ingestão elevados para laboratório local

No projeto, ele funciona como datasource principal de métricas no Grafana.

## `infra/ops/grafana/provisioning/datasources/datasources.yaml`

O Grafana já sobe com os datasources:

- `Mimir` como datasource padrão de métricas
- `Prometheus` para inspeção adicional
- `Loki` para logs
- `Tempo` para traces

### Correlação configurada

O datasource `Tempo` já vem com:

- `tracesToLogsV2` apontando para Loki
- `serviceMap` usando Prometheus
- `nodeGraph` habilitado

Isso reduz configuração manual no ambiente local.

## `infra/ops/grafana/provisioning/dashboards/dashboards.yaml`

Os dashboards JSON em `infra/ops/grafana/dashboards/` são carregados automaticamente em uma pasta chamada `DesignSoftDDD`.

Isso evita:

- import manual após cada subida do ambiente
- drift entre ambientes locais

## `infra/images/otel-collector` e `infra/images/mimir`

Essas imagens adicionam um binário `/healthcheck` compilado em Go.

Motivo:

- algumas imagens base não trazem ferramentas de healthcheck convenientes
- o binário é pequeno, previsível e reduz dependência de shell tooling

## Dashboards provisionados

| Dashboard | Finalidade |
| --- | --- |
| `designsoftddd-stack-overview.json` | saúde da stack de observabilidade |
| `designsoftddd-api-overview.json` | visão HTTP e operacional da API |
| `designsoftddd-use-case-operations.json` | desempenho e erro por operação/use case |
| `designsoftddd-endpoint-drilldown.json` | análise detalhada por endpoint |

## Boas práticas já presentes na implementação

:::tip O que está bem alinhado
- Collector centralizado
- provisionamento automático do Grafana
- healthchecks consistentes
- pipelines separados por tipo de telemetria
- storage local persistente por volume
- smoke test para validação rápida
:::
