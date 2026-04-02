---
outline: deep
---

# OpenTelemetry na arquitetura do projeto

Esta página documenta como a instrumentação foi implementada de fato no projeto.

:::tip Leitura recomendada
Antes desta página, leia [O que é OpenTelemetry](/tecnologias/opentelemetry). Aqui o foco já é a implementação concreta do projeto.
:::

## Objetivo da implementação

A solução atual busca equilibrar duas necessidades:

- ter observabilidade automática para HTTP e bibliotecas suportadas
- ter nomes de operação compreensíveis para o domínio da aplicação

## Arquivos envolvidos

| Arquivo | Papel |
| --- | --- |
| `src/server.ts` | Importa a instrumentação antes de subir a aplicação. |
| `src/telemetry/instrumentation.ts` | Inicializa o `NodeSDK` e ativa auto-instrumentações. |
| `src/telemetry/application-telemetry.ts` | Implementa a camada manual de telemetria da aplicação. |
| `src/telemetry/observability.ts` | Mantém compatibilidade com a API anterior. |
| `src/app.ts` | Conecta Fastify, hooks HTTP e rotas. |
| `src/http/routes/*.ts` | Declaram a operação da rota e acionam a operação observada. |

## Fluxo fim a fim

```txt
src/server.ts
   ->
importa ./telemetry/instrumentation
   ->
NodeSDK inicia e registra instrumentações
   ->
Fastify recebe uma requisição
   ->
@fastify/otel cria o span HTTP
   ->
registerHttpTelemetry() anota o span e mede a requisição
   ->
runObservedOperation() cria a operação da aplicação
   ->
OTLP envia dados para o Collector
   ->
Collector distribui para Tempo, Loki, Prometheus e Mimir
```

## Instrumentação automática

### Onde está configurada

Arquivo:

- `src/telemetry/instrumentation.ts`

### O que ela faz

- inicia o `NodeSDK`
- ativa `getNodeAutoInstrumentations()`
- ativa `@fastify/otel`
- cria um `PeriodicExportingMetricReader` para métricas OTLP/HTTP
- aplica `logHook` do `pino` para enriquecer logs com metadados de serviço

### O que já está automático hoje

- entrada e saída de requisição HTTP
- span base das rotas Fastify
- propagação de contexto
- instrumentação de bibliotecas suportadas pelo pacote `@opentelemetry/auto-instrumentations-node`

Na prática, isso prepara o projeto para observar automaticamente no futuro bibliotecas como:

- `http`
- `fetch` e `undici`
- `pg`
- `mysql` e `mysql2`
- `redis` e `ioredis`

### Decisões importantes da configuração

| Decisão | Motivo |
| --- | --- |
| `instrumentation-fs` desabilitada | evita ruído excessivo de spans de filesystem |
| `ignorePaths('/health')` | remove ruído operacional do endpoint de saúde |
| `logHook` do Pino | mantém metadados de serviço junto dos logs |
| `metricExportInterval` configurável | permite controlar o custo e a frequência de exportação |

## Instrumentação manual

### Por que existe uma camada manual

A instrumentação automática não sabe a semântica do seu domínio. Ela sabe que houve uma requisição, mas não sabe qual operação de negócio estava acontecendo.

Exemplos do que não é automático:

- distinguir `student.create` de `question.read`
- saber qual grupo funcional um endpoint representa
- nomear corretamente uma operação de negócio
- registrar logs estruturados de sucesso e falha com contexto útil

### Onde está implementada

Arquivo:

- `src/telemetry/application-telemetry.ts`

### Estruturas centrais

#### `OperationTelemetryMetadata`

Metadados semânticos da operação:

```ts
{
  operation: 'question.read',
  resource: 'question',
  action: 'read',
  endpointGroup: 'questions',
}
```

#### `registerHttpTelemetry(app)`

Responsável por:

- marcar o início da requisição
- anotar o span HTTP ativo
- medir contagem e duração da requisição
- ignorar `/health`

#### `runObservedOperation(request, options, execute)`

Responsável por:

- criar um span da operação principal
- adicionar atributos de negócio
- emitir log de sucesso e falha
- registrar contagem e duração da operação
- marcar `app.outcome`

## Métricas atuais

| Métrica | Tipo | Finalidade |
| --- | --- | --- |
| `designsoftddd.http.server.requests` | Counter | total de requisições HTTP processadas |
| `designsoftddd.http.server.duration` | Histogram | duração das requisições HTTP |
| `designsoftddd.use_case.executions` | Counter | total das operações observadas |
| `designsoftddd.use_case.duration` | Histogram | duração das operações observadas |

:::info Compatibilidade mantida
Mesmo com a semântica nova baseada em `operation`, o projeto preserva atributos e nomes com `use_case` para não quebrar dashboards já provisionados.
:::

## Atributos e convenções

### Atributos compartilhados

- `http.method`
- `http.route`
- `app.operation`
- `app.use_case`
- `app.resource`
- `app.action`
- `app.endpoint_group`

### Convenções recomendadas

- `operation`: verbo + recurso, por exemplo `student.create`
- `resource`: entidade ou agregado principal, por exemplo `student`
- `action`: `create`, `read`, `update`, `delete`
- `endpointGroup`: agrupamento HTTP, por exemplo `students`

## Exportação de traces, metrics e logs

### Traces

- exportação configurada por variáveis de ambiente do SDK
- destino OTLP: `http://otel-collector:4318`

### Metrics

- configuradas manualmente via `PeriodicExportingMetricReader`
- exportadas por OTLP/HTTP

### Logs

- dependem do logger da aplicação
- usam as variáveis de ambiente do SDK para exportação OTLP
- recebem metadados adicionais via instrumentação do `pino`

## Como a rota participa da telemetria

No handler da rota, a participação é simples:

1. declarar `config.telemetry`
2. chamar `runObservedOperation()`
3. executar a lógica principal

Exemplo:

```ts
const createStudentOperation = {
  operation: 'student.create',
  resource: 'student',
  action: 'create',
  endpointGroup: 'students',
}

app.post('/students', {
  config: {
    telemetry: createStudentOperation,
  },
}, async (request) => {
  return runObservedOperation(request, createStudentOperation, async () => {
    return { ok: true }
  })
})
```

## Boas práticas adotadas

:::tip Diretrizes mais importantes
- Instrumentar a borda da aplicação.
- Manter métricas com atributos estáveis.
- Reservar alta cardinalidade para spans e logs.
- Ignorar endpoints puramente operacionais como `/health`.
- Importar a instrumentação antes de qualquer bootstrap de framework.
:::

## Armadilhas comuns

### 1. Importar o SDK tarde demais

Se `src/server.ts` não carregar `./telemetry/instrumentation` antes do restante da aplicação, parte da auto-instrumentação pode virar `no-op`.

### 2. Tentar usar apenas auto-instrumentação

Isso dá visibilidade técnica, mas não semântica. Os dashboards ficam piores e a leitura de negócio fica opaca.

### 3. Colocar contexto de alta cardinalidade em métricas

IDs e payloads são melhores em spans e logs. Métricas devem permanecer agregáveis.

## Relação com a stack Docker

Toda a instrumentação desta página depende da stack em `infra/` para ficar observável localmente.

Leia também:

- [Stack Docker](/infraestrutura/stack-docker)
- [Configurações da Stack](/infraestrutura/configuracoes-da-stack)
- [OpenTelemetry na Prática](/arquitetura/opentelemetry-na-pratica)
