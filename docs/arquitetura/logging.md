---
outline: deep
---

# Logging na arquitetura

Esta pagina documenta a implementacao real de logging estruturado com `Pino` no projeto.

## Objetivo da implementacao

A solucao atual foi desenhada para atender quatro necessidades ao mesmo tempo:

- logs estruturados e prontos para producao
- contexto por request sem espalhar dependencia de framework
- integracao com OpenTelemetry e stack local
- baixo acoplamento entre Fastify e o restante da aplicacao

## Estrutura criada

```txt
src/
  application/
    services/
      question-query-service.ts
  infra/
    logger/
      fastify-logging.ts
      index.ts
      logger.ts
      process-error-handlers.ts
      request-context.ts
```

## Arquivos envolvidos

| Arquivo | Papel |
| --- | --- |
| `src/infra/logger/logger.ts` | instancia singleton do `Pino`, redaction, `LOG_LEVEL`, transport de desenvolvimento e helpers |
| `src/infra/logger/request-context.ts` | contexto por request via `AsyncLocalStorage` |
| `src/infra/logger/fastify-logging.ts` | hooks de request/response, correlation id, response time e error handler HTTP |
| `src/infra/logger/process-error-handlers.ts` | captura centralizada de `uncaughtException` e `unhandledRejection` |
| `src/app.ts` | conecta o `loggerInstance` ao Fastify |
| `src/server.ts` | registra handlers globais e loga bootstrap |
| `src/telemetry/instrumentation.ts` | enriquece logs com metadados de servico e integra com OpenTelemetry |
| `src/telemetry/application-telemetry.ts` | usa o logger central para logs de operacao observada |

## Fluxo fim a fim

```txt
src/server.ts
   ->
instancia Fastify com logger singleton
   ->
registerFastifyLogging()
   ->
onRequest cria contexto com request_id e correlation_id
   ->
handler / service usa getLogger()
   ->
OpenTelemetry injeta trace_id e span_id quando houver span ativo
   ->
NodeSDK exporta logs para o Collector
   ->
Collector envia logs para Loki
   ->
Grafana consulta Loki
```

## Logger base

### Singleton

O logger fica em um unico modulo e e criado uma unica vez.

Vantagens:

- evita multiplas instancias concorrentes
- padroniza redaction e formatters
- garante uso consistente entre HTTP, aplicacao e processo

### Campos base

Todo log herda metadados fixos:

- `service_name`
- `service_namespace`
- `service_version`
- `deployment_environment`

Isso ajuda em:

- filtros no Grafana
- compatibilidade com pipelines futuros
- identificacao de servico em ambiente distribuido

## Estrategia por ambiente

### `development`

- usa `pino-pretty`
- formato legivel
- nivel padrao `debug`

### `test`

- mantem JSON
- nivel padrao `warn`
- reduz ruido em execucao automatizada

### `production`

- mantem JSON puro
- nivel padrao `info`
- pronto para Loki, ELK ou qualquer pipeline OTLP

### Variavel de ambiente

O nivel pode ser sobrescrito por:

```bash
LOG_LEVEL=trace
```

Compatibilidade mantida:

- `LOG_LEVEL` e a variavel principal
- `APP_LOG_LEVEL` continua como fallback para nao quebrar o ambiente atual

## Fastify e request logging

### Como a integracao foi feita

Em vez de acoplar a aplicacao diretamente a `request.log`, a implementacao faz duas coisas:

1. registra o logger singleton como `loggerInstance` do Fastify
2. cria um contexto por request em `AsyncLocalStorage`

Com isso, qualquer camada pode chamar `getLogger()` e receber:

- o logger do request atual, quando houver request ativo
- ou o logger base, fora do contexto HTTP

### Campos automaticamente incluidos

No ciclo HTTP, o logger por request carrega:

- `request_id`
- `correlation_id`
- `http_method`
- `http_path`
- `http_route`
- `response_time_ms`

### Headers retornados ao cliente

O plugin responde com:

- `x-request-id`
- `x-correlation-id`

Assim o cliente consegue correlacionar o erro com o backend.

## Correlation id distribuido

Regra usada hoje:

- se chegar `x-correlation-id`, ele e reaproveitado
- se nao chegar, a aplicacao reaproveita o `request_id`

Isso permite:

- correlacionar logs de uma mesma jornada
- propagar identificador entre servicos
- navegar com mais facilidade entre logs e traces

## Padrao de mensagens

As mensagens foram padronizadas com nomes estaveis:

- `server.started`
- `server.bootstrap.failed`
- `http.request.received`
- `http.request.completed`
- `http.request.failed`
- `application.operation.completed`
- `application.operation.failed`
- `process.uncaught_exception`
- `process.unhandled_rejection`

Esse padrao ajuda tanto humanos quanto buscas estruturadas.

## Exemplo de uso na borda HTTP

Arquivo real:

- `src/http/routes/example-routes.ts`

Fluxo:

1. a rota declara `config.telemetry`
2. a rota opcionalmente enriquece o contexto com `user_id`
3. o fluxo principal e executado com `runObservedOperation()`
4. o service usa `getLogger()` sem conhecer Fastify

Exemplo resumido:

```ts
if (userId) {
  bindRequestLogContext({ user_id: userId })
}

return runObservedOperation(request, operation, async () => {
  return questionQueryService.findById(id)
})
```

## Exemplo de uso em service

Arquivo real:

- `src/application/services/question-query-service.ts`

Exemplo:

```ts
const logger = getLogger({
  module: 'application.question-query-service',
})

logger.debug({
  event_name: 'question.lookup.started',
  question_id: questionId,
}, 'question.lookup.started')
```

Ponto importante:

- o service nao depende de `request`
- o service nao precisa receber `FastifyRequest`
- o contexto do request continua chegando pelos bindings do logger atual

## Seguranca

### Redaction aplicada

Os seguintes campos sao mascarados antes da emissao:

- `authorization`
- `cookie`
- `password`
- `token`
- `access_token`
- `refresh_token`

### O que a aplicacao evita logar

- body completo de request
- credenciais
- cookies
- tokens de sessao
- payloads grandes e de alta cardinalidade

## Integracao com OpenTelemetry

### Como a correlacao com tracing acontece

O projeto continua usando `@opentelemetry/instrumentation-pino`.

Na pratica:

- o logger emite o evento
- a instrumentacao do `Pino` observa o log
- quando existe span ativo, os ids do trace entram no log

Campos esperados:

- `trace_id`
- `span_id`
- `trace_flags`

### Metadados adicionais enviados

O `logHook` do OpenTelemetry enriquece os logs com:

- `service.name`
- `service.namespace`
- `deployment.environment.name`
- `service.version`

## Integracao com a stack do projeto

### Pipeline atual

```txt
app
  ->
OpenTelemetry SDK
  ->
OTLP HTTP
  ->
otel-collector
  ->
loki
  ->
grafana
```

### O que ja fica compativel automaticamente

- Grafana Loki
- dashboards baseados em JSON fields
- buscas por `request_id` e `correlation_id`
- navegacao cruzada com tracing

### Compatibilidade com ELK

Se o backend de logs mudar depois para ELK:

- o formato JSON continua valido
- o mapeamento de campos ja esta estruturado
- a aplicacao nao precisa trocar de biblioteca para isso

## Escolhas arquiteturais importantes

### Por que nao depender de `console.log`

`console.log` nao entrega o conjunto que o projeto precisa:

- nivel de log
- redaction
- child logger
- request context
- integracao nativa com Fastify
- pipeline estruturado para observabilidade

### Por que nao usar `pino-http`

Porque neste projeto o Fastify ja cobre a integracao principal com `Pino`.

Adicionar `pino-http` aqui significaria:

- duplicar a camada HTTP de logging
- perder parte do controle fino dos hooks do Fastify
- aumentar a superficie de configuracao sem ganho claro

### Por que `AsyncLocalStorage`

Porque precisamos que um service consiga logar com o contexto do request sem receber o request inteiro como parametro.

Isso reduz acoplamento entre:

- borda HTTP
- services
- futura camada de aplicacao

## Impacto de performance

### O que foi feito para proteger throughput

- JSON puro em producao
- `pino-pretty` somente em desenvolvimento
- child loggers para reaproveitar bindings
- ausencia de payload completo nos logs
- redaction centralizada

### Tradeoff real

Todo log tem custo.

O objetivo nao e "logar tudo", e sim manter o logging util sem transformar serializacao em gargalo.

## Checklist para novas features

- Use `getLogger()` em services e adaptadores.
- Use `bindRequestLogContext()` quando precisar enriquecer o request com `user_id`, tenant ou outro contexto estavel.
- Evite logar body completo.
- Prefira mensagens padronizadas com `event_name`.
- Continue usando `runObservedOperation()` para borda da aplicacao.

## Leitura complementar

- [Pino](/tecnologias/pino)
- [OpenTelemetry na arquitetura](/arquitetura/opentelemetry)
- [OpenTelemetry na pratica](/arquitetura/opentelemetry-na-pratica)
