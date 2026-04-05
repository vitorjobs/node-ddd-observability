---
outline: deep
---

# Visão geral do projeto

Este projeto combina três objetivos:

- estudo de Domain-Driven Design em Node.js e TypeScript
- criação gradual de uma API com Fastify
- observabilidade desde cedo com OpenTelemetry e stack local em Docker

## Estado atual de maturidade

| Área | Estado atual | Leitura prática |
| --- | --- | --- |
| Domínio | Inicial e funcional | Entidades, value object e dois use cases já existem. |
| HTTP | Inicial | A aplicação já sobe com Fastify, logging estruturado e rotas de exemplo. |
| Controllers | Ainda não implementados | Hoje o handler da rota faz o papel de borda da aplicação. |
| Observabilidade | Bem estruturada | Já existe instrumentação automática e manual, logger central, Collector e dashboards. |
| Persistência | Não implementada | Ainda não há banco, repositórios ou ORMs conectados. |
| Infra local | Implementada | A stack Docker está pronta para testes locais da observabilidade. |
| Documentação | Organizada | A documentação agora acompanha o código e a infraestrutura real. |

## Estrutura principal

```txt
src/
  app.ts
  server.ts
  application/
  domain/
  infra/logger/
  http/routes/
  telemetry/

infra/
  docker-compose.yml
  ops/
  images/
  scripts/

docs/
  projeto/
  dominio/
  arquitetura/
  infraestrutura/
  tecnologias/
  troubleshooting/
```

## Fluxo geral de execução

```txt
src/server.ts
   ->
carrega OpenTelemetry
   ->
buildApp()
   ->
registra hooks HTTP e rotas
   ->
recebe request
   ->
executa operacao observada
   ->
envia traces, metrics e logs ao Collector
```

## Pontos fortes do projeto

:::tip O que já está bem resolvido
- A telemetria sobe antes da aplicação, que é a ordem correta.
- A stack local está desacoplada da aplicação e pronta para evolução.
- Existe separação entre instrumentação automática e instrumentação semântica.
- Os dashboards já estão provisionados, o que reduz trabalho manual.
:::

## Limites atuais

:::warning O que ainda é esperado nesta fase
- A camada HTTP ainda está em estágio inicial.
- O domínio ainda é pequeno e didático.
- Não há persistência, fila, autenticação ou integrações externas.
- Parte das métricas ainda preserva nomenclatura de compatibilidade com dashboards existentes.
:::

## Recomendação para continuar o curso

1. Criar novas rotas dentro de `src/http/routes/`.
2. Introduzir controllers sem mover observabilidade para o domínio.
3. Usar `runObservedOperation()` na borda da aplicação.
4. Acrescentar repositórios e banco mantendo a mesma convenção de operação.
5. Validar a telemetria com a stack Docker sempre que uma nova camada entrar.
