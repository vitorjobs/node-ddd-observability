---
outline: deep
---

# Stack Docker de observabilidade

Esta página documenta a implementação dos containers baseada no diretório `infra/`.

## Objetivo da stack

A stack local existe para:

- receber a telemetria produzida pela aplicação
- armazenar traces, logs e métricas
- disponibilizar dashboards prontos para análise
- permitir troubleshooting local sem depender de serviços externos

## Estrutura do diretório `infra/`

```txt
infra/
  docker-compose.yml
  images/
    mimir/
    otel-collector/
  ops/
    grafana/
    loki.yaml
    mimir.yaml
    otel-collector-config.yaml
    prometheus.yml
    tempo.yaml
  scripts/
    generate-telemetry.sh
```

## Arquivo central

O arquivo mais importante é:

- `infra/docker-compose.yml`

Ele define todos os containers, dependências, portas, volumes, healthchecks e variáveis de ambiente.

## Visão da topologia

```txt
app
  -> otel-collector
      -> tempo
      -> loki
      -> mimir
      -> prometheus

grafana
  -> consulta tempo, loki, mimir e prometheus
```

## Serviços da stack

| Serviço | Função | Porta | Observações |
| --- | --- | --- | --- |
| `app` | aplicação Node.js instrumentada | `3333` | envia telemetria para o Collector |
| `otel-collector` | ingestão e roteamento OTLP | `4318`, `13133`, `8889` | recebe traces, metrics e logs da app |
| `tempo` | backend de traces | `3200` | recebe spans via OTLP/gRPC |
| `loki` | backend de logs | `3100` | recebe logs via OTLP/HTTP |
| `mimir` | backend principal de métricas | `9009` | recebe métricas OTLP e dados via remote_write |
| `prometheus` | scraping e apoio operacional | `9090` | raspa métricas da stack e também recebe OTLP |
| `grafana` | visualização | `3000` | chega com datasources e dashboards provisionados |

## Ordem de inicialização

O `docker-compose.yml` define dependências explícitas:

```txt
tempo, loki, mimir, prometheus
   ->
otel-collector
   ->
app

tempo, loki, mimir, prometheus
   ->
grafana
```

Isso reduz falsos positivos de inicialização e evita que a aplicação tente exportar telemetria para um Collector indisponível.

## Variáveis importantes do container `app`

| Variável | Função |
| --- | --- |
| `OTEL_SERVICE_NAME` | nome lógico do serviço observado |
| `OTEL_RESOURCE_ATTRIBUTES` | atributos de recurso expostos para observabilidade |
| `OTEL_TRACES_EXPORTER` | exportador de traces |
| `OTEL_METRICS_EXPORTER` | exportador de métricas |
| `OTEL_LOGS_EXPORTER` | exportador de logs |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | endpoint do Collector |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | protocolo OTLP usado |
| `OTEL_METRIC_EXPORT_INTERVAL` | intervalo de exportação de métricas |
| `OTEL_LOG_LEVEL` | nível de logs internos do SDK |

## Healthchecks

Cada serviço foi configurado para expor saúde operacional.

### `app`

- usa `fetch()` interno contra `http://127.0.0.1:3333/health`
- garante que o endpoint HTTP da aplicação está respondendo

### `otel-collector` e `mimir`

- usam binários customizados de healthcheck compilados em Go
- o binário faz uma requisição HTTP simples para o endpoint de saúde informado

### Demais serviços

- usam `wget` ou endpoint nativo de health

:::tip Por que existem imagens customizadas?
Nem toda imagem base vem com utilitários suficientes para healthcheck. As imagens customizadas em `infra/images/` resolvem isso de forma pequena e previsível.
:::

## Volumes persistentes

| Volume | Função |
| --- | --- |
| `tempo-data` | armazenamento local de traces |
| `loki-data` | armazenamento local de logs |
| `mimir-data-otel` | armazenamento local de métricas |
| `prometheus-data` | dados do Prometheus |
| `grafana-data-otel` | dados e estado do Grafana |

## Fluxo real da telemetria

### Traces

```txt
app -> otel-collector -> tempo -> grafana
```

### Logs

```txt
app -> otel-collector -> loki -> grafana
```

### Métricas da aplicação

```txt
app -> otel-collector -> mimir e prometheus -> grafana
```

### Métricas da própria stack

```txt
prometheus raspa:
  prometheus
  otel-collector
  grafana
  tempo
  loki
  mimir

prometheus -> remote_write -> mimir
grafana -> consulta mimir
```

## Scripts operacionais

```bash
npm run observability:up
npm run observability:ps
npm run observability:logs
npm run observability:smoke
npm run observability:down
```

## Smoke test

O arquivo `infra/scripts/generate-telemetry.sh` gera requisições em:

- `/health`
- `/questions/:id`

Objetivo:

- validar tráfego HTTP
- forçar geração de spans e métricas
- preencher dashboards e consultas iniciais

## Leitura honesta da stack

:::info Escopo atual
Esta stack foi pensada para ambiente local e aprendizado. Ela já tem boas práticas relevantes, como Collector separado, healthchecks e provisioning do Grafana, mas não substitui um ambiente de produção com segurança, retenção e alta disponibilidade mais completas.
:::
