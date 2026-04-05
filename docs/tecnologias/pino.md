---
outline: deep
---

# Pino

`Pino` e a biblioteca de logging adotada neste projeto para logs de aplicacao.

O objetivo nao e apenas "imprimir mensagens", mas produzir logs:

- estruturados
- correlacionaveis com traces
- seguros para producao
- baratos do ponto de vista de CPU e serializacao

## Por que o projeto usa Pino

### 1. Performance

No ecossistema Node.js, `Pino` e conhecido por manter baixo overhead mesmo com alto volume de logs.

Na pratica, isso acontece porque:

- o logger foi desenhado para JSON desde a origem
- a serializacao e enxuta
- child loggers reaproveitam bindings pre-serializados
- a formatacao bonita de desenvolvimento fica fora do caminho critico da producao

### 2. Compatibilidade natural com Fastify

O `Fastify` ja possui integracao nativa com `Pino`.

Isso reduz friccao para:

- request id
- logger por request
- hooks de request/response
- logs estruturados sem middleware extra

### 3. Compatibilidade com observabilidade moderna

`Pino` funciona bem com:

- OpenTelemetry
- Grafana Loki
- ELK / Elasticsearch
- pipelines OTLP

Como os logs saem em JSON, fica simples rotealos para um Collector, Loki, Logstash ou qualquer backend que entenda eventos estruturados.

## Decisao sobre bibliotecas relacionadas

### `pino`

Usado como logger principal.

Responsabilidades no projeto:

- criar a instancia singleton
- definir `LOG_LEVEL`
- aplicar redaction
- padronizar campos base
- fornecer `getLogger()` para qualquer camada

### `pino-pretty`

Usado apenas em `development`.

Motivo:

- melhorar legibilidade local
- manter producao em JSON puro
- evitar trocar a forma de log da aplicacao inteira so para o ambiente de desenvolvimento

### `pino-http`

Avaliado, mas nao adotado.

Motivo:

- o `Fastify` ja entrega logger por request usando `Pino`
- adicionar `pino-http` em cima do Fastify duplicaria responsabilidade
- hooks do Fastify ja resolvem o ciclo `request received -> response completed` com mais controle

Em frameworks sem integracao nativa com `Pino`, `pino-http` continua sendo uma boa opcao.

### `pino` transport API

Usada neste projeto apenas para `development`, com `pino-pretty`.

Motivo:

- manter o logger base igual em todos os ambientes
- delegar a formatacao bonita para o transport
- preservar a saida JSON em producao

Nao foi necessario criar um transport customizado para producao porque:

- a aplicacao ja esta integrada ao OpenTelemetry
- o Collector ja recebe logs pela stack atual
- Loki e Grafana ja estao provisionados no ambiente local

## Estrategia por ambiente

| Ambiente | Formato | Nivel padrao | Objetivo |
| --- | --- | --- | --- |
| `development` | pretty | `debug` | leitura humana e feedback rapido |
| `test` | JSON | `warn` | reduzir ruido em execucao automatizada |
| `production` | JSON | `info` | estabilidade operacional e ingestao por ferramentas |

## Boas praticas aplicadas

### JSON como contrato

Em producao, o contrato do log e JSON estruturado.

Isso permite:

- filtros por campo
- agregacoes por status e rota
- correlacao por `request_id`, `correlation_id`, `trace_id`
- reutilizacao do mesmo evento em Loki, Elasticsearch ou SIEM

### Niveis corretos

O projeto segue a escala:

- `trace`: detalhes finos e temporarios
- `debug`: investigacao de fluxo
- `info`: eventos normais de negocio ou operacao
- `warn`: anomalias recuperaveis
- `error`: falhas de request, use case ou integracao
- `fatal`: falhas que comprometem o processo

### Child loggers

Child loggers sao importantes porque evitam repetir bindings em cada chamada.

Exemplo de contexto reaproveitado:

- `request_id`
- `correlation_id`
- `http_method`
- `http_route`
- `user_id`

### Redaction

O logger mascara campos sensiveis antes da emissao.

Campos tratados hoje:

- `authorization`
- `cookie`
- `password`
- `token`
- `access_token`
- `refresh_token`

### Nao logar payload por padrao

O projeto evita logar corpo completo de request ou resposta.

Motivos:

- risco de exposicao de dados sensiveis
- aumento de cardinalidade
- custo de serializacao
- piora de throughput

## Pino e tracing

No projeto, `Pino` nao substitui tracing.

Papel de cada um:

- log: explica "o que aconteceu" com contexto textual
- trace: mostra "como a execucao se encadeou"
- metricas: mostram "com que frequencia e com qual duracao"

Com a instrumentacao `@opentelemetry/instrumentation-pino`, cada log emitido durante um span ativo pode carregar:

- `trace_id`
- `span_id`
- `trace_flags`

Isso permite navegar do log para o trace e do trace para o log.

## Compatibilidade com Grafana Loki e ELK

### Loki

Loki se beneficia de logs JSON com labels estaveis e campos ricos no corpo do evento.

No projeto:

- o aplicativo produz logs estruturados
- o OpenTelemetry Collector recebe os eventos
- o pipeline `logs` exporta para o Loki
- o Grafana consulta o Loki

### ELK

Se no futuro a stack migrar para ELK, a base atual continua valida.

Como os logs ja sao JSON estruturados, a troca fica mais perto de infraestrutura do que de codigo.

## Escalando logs em ambiente distribuido

Quando um sistema cresce, o problema nao e apenas "ter logs", e conseguir usalos sem se perder.

As regras mais importantes sao:

- manter `request_id` e `correlation_id` em todos os fluxos HTTP
- manter `trace_id` e `span_id` quando houver span ativo
- usar mensagens padronizadas como `http.request.completed`
- usar campos estaveis para filtro
- evitar alta cardinalidade em labels de backend
- reservar detalhes variaveis para o corpo do log, nao para identificadores de agregacao

## Comparacao pratica com outras libs

### `Pino` vs `Winston`

`Winston` continua forte quando o foco e multiplos transports e pipelines legados, mas costuma ter maior custo operacional e overhead para o caminho quente do request.

Para uma API Fastify focada em throughput e observabilidade, `Pino` tende a encaixar melhor.

### `Pino` vs `Bunyan`

`Bunyan` ajudou a consolidar logging estruturado em Node, mas hoje `Pino` costuma ser a escolha mais moderna no ecossistema Fastify.

## Leitura complementar

- [Logging na arquitetura do projeto](/arquitetura/logging)
- [OpenTelemetry na arquitetura](/arquitetura/opentelemetry)
- [Stack Docker](/infraestrutura/stack-docker)
