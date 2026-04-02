---
outline: deep
---

# Troubleshooting de observabilidade e Docker

Esta página serve como guia operacional rápido quando a stack ou a instrumentação não se comportarem como esperado.

## Comandos base

```bash
npm run observability:up
npm run observability:ps
npm run observability:logs
npm run observability:smoke
npm run observability:down
```

## Sintoma: os containers não ficam saudáveis

### O que checar

- `npm run observability:ps`
- `npm run observability:logs`

### Causas comuns

- porta ocupada na máquina local
- container dependente ainda não saudável
- erro de configuração em `infra/ops/*.yaml`

## Sintoma: a aplicação sobe, mas não aparecem traces

### Verificações

- confirme que `src/server.ts` importa `./telemetry/instrumentation` antes do bootstrap
- verifique `OTEL_EXPORTER_OTLP_ENDPOINT`
- confirme que o Collector está saudável
- gere tráfego com `npm run observability:smoke`

### Causas comuns

- SDK carregado tarde demais
- Collector indisponível
- endpoint `/health` sendo testado sozinho e sem tráfego real

## Sintoma: aparecem traces HTTP, mas não a operação de negócio

### Verificações

- a rota possui `config.telemetry`
- o handler chama `runObservedOperation()`

### Interpretação

Se só o span HTTP aparece, a auto-instrumentação está funcionando, mas a instrumentação manual da operação não foi aplicada.

## Sintoma: não aparecem métricas de operação

### Verificações

- o fluxo passou por `runObservedOperation()`
- o Collector está exportando métricas
- Mimir e Prometheus estão saudáveis

### Causas comuns

- rota fora do padrão de instrumentação
- erro de exportação de métricas
- consulta no datasource errado do Grafana

## Sintoma: não aparecem logs no Grafana

### Verificações

- `OTEL_LOGS_EXPORTER=otlp`
- Collector com pipeline `logs`
- Loki saudável

### Observação

Os logs dependem do logger da aplicação e da integração configurada no SDK. Sem logs emitidos pela aplicação, não há material útil para o Loki.

## Sintoma: dashboards vazios

### Checklist

- subiu a stack completa
- gerou telemetria com o script de smoke
- o datasource padrão no Grafana está funcional
- os serviços `tempo`, `loki`, `mimir` e `prometheus` estão saudáveis

## Sintoma: uma nova rota não aparece bem agrupada

### O que revisar

- `operation`
- `resource`
- `action`
- `endpointGroup`

### Regra

Os dashboards ficam melhores quando a rota segue a convenção semântica do projeto.

## Checklist rápido para novas features

- A instrumentação é importada cedo no bootstrap.
- A rota nova declara `config.telemetry`.
- A operação principal usa `runObservedOperation()`.
- O smoke test gera dados observáveis.
- A stack local responde em `3333`, `3000`, `3200`, `3100`, `9009` e `9090`.

## Páginas complementares

- [OpenTelemetry na arquitetura](/arquitetura/opentelemetry)
- [OpenTelemetry na prática](/arquitetura/opentelemetry-na-pratica)
- [Stack Docker](/infraestrutura/stack-docker)
- [Configurações da Stack](/infraestrutura/configuracoes-da-stack)
