---
outline: deep
---

# OpenTelemetry como tecnologia

OpenTelemetry é o padrão aberto usado neste projeto para gerar, propagar e exportar telemetria.

## Por que começar por aqui

Antes de olhar a arquitetura implementada, é importante entender o problema que o OpenTelemetry resolve.

Sem essa base, a instrumentação pode parecer excesso de código ou configuração. Com essa base, fica mais claro por que parte do monitoramento é automática e por que outra parte precisa ser modelada pela aplicação.

## O que ele resolve

Sem OpenTelemetry, cada ferramenta costuma pedir um formato próprio de instrumentação.

Com OpenTelemetry:

- a aplicação produz telemetria em um padrão único
- o destino pode ser trocado com menos acoplamento
- traces, metrics e logs podem ser correlacionados

## O problema clássico sem OpenTelemetry

```txt
Aplicação
   ->
uma lib para métricas
   ->
outra lib para tracing
   ->
outra lib para logs
   ->
formatos diferentes
   ->
mais acoplamento
```

Com OpenTelemetry, a ideia muda:

```txt
Aplicação
   ->
OpenTelemetry
   ->
Collector / backends
```

## O que ele entrega na prática

- padronização de telemetria
- correlação entre traces, logs e métricas
- menor dependência de vendor
- base para observabilidade desde ambientes locais até produção

## Os três pilares

### Traces

Mostram o caminho de uma execução.

```txt
request
   ->
API
   ->
banco
   ->
API externa
```

### Metrics

Mostram tendências agregadas ao longo do tempo.

Exemplos:

- quantidade de requisições
- duração
- taxa de erro
- throughput por operação

### Logs

Mostram eventos detalhados e contexto textual.

Exemplos:

- falha em uma operação
- erro inesperado
- mensagem operacional com `trace_id`

## Como pensar nesses três pilares juntos

```txt
Métrica
  -> "algo está piorando"

Trace
  -> "onde o fluxo ficou lento ou falhou"

Log
  -> "o que exatamente aconteceu"
```

Essa combinação é o que torna a observabilidade realmente útil.

## Conceitos essenciais

| Conceito | Significado |
| --- | --- |
| `Trace` | fluxo completo de uma execução |
| `Span` | etapa individual dentro do trace |
| `Resource` | identidade do processo ou serviço |
| `Exporter` | componente que envia telemetria |
| `Collector` | agente intermediário que recebe e redistribui dados |
| `Instrumentation` | código ou biblioteca que produz telemetria |

## Onde entra o Collector

O Collector não é obrigatório em todos os cenários, mas ele é a abordagem mais flexível e profissional para evoluir observabilidade.

Ele pode:

- receber telemetria em OTLP
- aplicar processamento
- redistribuir para destinos diferentes
- isolar a aplicação dos detalhes dos backends

## Instrumentação automática x manual

### Automática

Boa para capturar:

- requests HTTP
- chamadas de bibliotecas suportadas
- spans técnicos do runtime

### Manual

Boa para capturar:

- nome da operação de negócio
- contexto funcional relevante
- métricas semânticas da aplicação

## O que é automático e o que não é

Exemplo mental:

```txt
Request HTTP /students
   ->
criar estudante
   ->
salvar no banco
```

O OpenTelemetry pode capturar automaticamente:

- a entrada do request
- o tempo total da requisição
- a chamada ao banco, se a biblioteca tiver suporte

Mas ele não sabe sozinho:

- que aquilo representa `student.create`
- qual recurso de negócio está envolvido
- quais logs operacionais fazem sentido para a sua aplicação

É por isso que projetos maduros combinam instrumentação automática com instrumentação manual.

## Como este projeto usa OpenTelemetry

```txt
Aplicação Node.js
   ->
NodeSDK
   ->
OTel Collector
   ->
Tempo / Loki / Prometheus / Mimir
   ->
Grafana
```

Leituras complementares:

- [Visão Geral da Arquitetura](/arquitetura/visao-geral)
- [OpenTelemetry na arquitetura](/arquitetura/opentelemetry)
- [OpenTelemetry na prática](/arquitetura/opentelemetry-na-pratica)
