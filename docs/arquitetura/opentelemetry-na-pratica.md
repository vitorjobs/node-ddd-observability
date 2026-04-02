---
outline: deep
---

# OpenTelemetry na prática

Este guia foi pensado para o dia a dia do curso: criar novas rotas, introduzir controllers, ligar use cases e continuar vendo a aplicação no Grafana sem retrabalho.

## Ideia central

```txt
Automático
  = o OpenTelemetry enxerga a execução técnica

Manual
  = você informa qual operação de negócio está acontecendo
```

## Receita padrão para uma nova rota

### 1. Criar a rota

As rotas atuais ficam em:

- `src/http/routes/`

### 2. Declarar a operação

```ts
const createStudentOperation = {
  operation: 'student.create',
  resource: 'student',
  action: 'create',
  endpointGroup: 'students',
}
```

### 3. Adicionar `config.telemetry`

```ts
app.post('/students', {
  config: {
    telemetry: createStudentOperation,
  },
}, async (request) => {
  // ...
})
```

### 4. Envolver a execução principal

```ts
return runObservedOperation(request, createStudentOperation, async () => {
  return { ok: true }
})
```

## Exemplo completo de handler

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
  return runObservedOperation(request, {
    ...createStudentOperation,
    spanAttributes: {
      'app.resource.name': 'student',
    },
    logAttributes: {
      resource_name: 'student',
    },
  }, async () => {
    return { ok: true }
  })
})
```

## Quando entrarem controllers

Fluxo recomendado:

```txt
Route
   ->
Controller
   ->
Use Case
```

### Como aplicar a observabilidade

- a rota continua declarando `config.telemetry`
- o controller pode ser chamado dentro de `runObservedOperation()`
- o use case continua sem dependência obrigatória de OpenTelemetry

Exemplo:

```ts
app.post('/students', {
  config: {
    telemetry: createStudentOperation,
  },
}, async (request, reply) => {
  return runObservedOperation(request, createStudentOperation, async () => {
    return studentController.handle(request, reply)
  })
})
```

## Quando entrarem use cases mais complexos

Você não precisa espalhar telemetria em todos os métodos internos.

Use esta lógica:

- borda da aplicação: instrumentar sempre
- regra de negócio interna: instrumentar só quando houver ganho operacional claro
- chamadas técnicas externas: confiar primeiro na auto-instrumentação das bibliotecas suportadas

## Quando entrar banco de dados

Se o projeto passar a usar bibliotecas instrumentáveis, como `pg` ou `mysql2`, o OpenTelemetry tende a criar spans técnicos automaticamente.

Você continua responsável por:

- manter o nome da operação de negócio
- registrar contexto de negócio relevante
- manter logs úteis para investigação

## Quando entrar API externa

Se a chamada for por `fetch`, `undici` ou biblioteca suportada:

- o span da chamada externa tende a aparecer sozinho
- ele ficará ligado ao trace atual

Resultado esperado:

```txt
HTTP request
   ->
operation: student.create
   ->
external HTTP call
```

## Quando usar `spanAttributes`

Use quando você quiser enriquecer o span com contexto de diagnóstico.

Exemplos bons:

- tipo de recurso
- identificador operacional
- nome de integração

Exemplos ruins para métricas:

- payload inteiro
- objetos grandes
- dados altamente variáveis em labels

## Quando usar `logAttributes`

Use para contexto que facilite investigação em logs:

- `resource_id`
- `resource_name`
- `integration_name`
- `request_context`

## Convenção de nomes

### `operation`

Formato recomendado:

```txt
recurso.acao
```

Exemplos:

- `student.create`
- `question.read`
- `answer.create`
- `auth.login`

### `resource`

Nome principal da entidade, agregado ou capacidade de negócio:

- `student`
- `question`
- `answer`

### `action`

Use um vocabulário pequeno e previsível:

- `create`
- `read`
- `update`
- `delete`

### `endpointGroup`

Use o agrupamento HTTP:

- `students`
- `questions`
- `answers`

## O que aparece automaticamente

Quando a base atual está correta, uma nova rota já tende a produzir:

- span HTTP da requisição
- duração HTTP
- status code
- contexto propagado

Quando você adicionar a camada manual, passa a ver também:

- a operação de negócio
- logs estruturados da operação
- métricas de execução da operação

## Checklist antes de subir uma nova funcionalidade

- A rota foi registrada em `src/http/routes/`.
- Existe `config.telemetry`.
- O fluxo principal foi envolvido com `runObservedOperation()`.
- Os nomes `operation`, `resource`, `action` estão consistentes.
- O endpoint `/health` continua fora do ruído operacional.
- A stack local recebeu telemetria após `npm run observability:smoke`.

## Erros comuns

:::warning O que costuma dar errado
- Esquecer `config.telemetry` e deixar a operação com nome genérico demais.
- Chamar o use case fora de `runObservedOperation()`.
- Colocar atributos demais em métricas.
- Tentar instrumentar entidades e value objects sem necessidade.
:::

## Leitura complementar

- [OpenTelemetry na arquitetura](/arquitetura/opentelemetry)
- [Stack Docker](/infraestrutura/stack-docker)
- [Configurações da Stack](/infraestrutura/configuracoes-da-stack)
- [Troubleshooting](/troubleshooting/observabilidade-e-docker)
