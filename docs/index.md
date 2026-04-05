---
layout: home

hero:
  name: "Design Soft DDD"
  text: "DDD, OpenTelemetry e Stack Docker de Observabilidade"
  tagline: Documentação técnica do estado atual do projeto, da instrumentação automática e manual e da infraestrutura local baseada em Grafana, Tempo, Loki, Mimir e Prometheus.
  actions:
    - theme: brand
      text: Visão Geral do Projeto
      link: /projeto/visao-geral
    - theme: alt
      text: Logging com Pino
      link: /arquitetura/logging
    - theme: alt
      text: Stack Docker
      link: /infraestrutura/stack-docker

features:
  - icon: 🧭
    title: Mapa do Projeto
    details: Estrutura atual do código, responsabilidades por diretório, estado de maturidade das camadas e fluxo de execução da aplicação.
  - icon: 📡
    title: Instrumentação Explicada
    details: Documentação detalhada da instrumentação automática e manual do OpenTelemetry, incluindo métricas, spans, logs e boas práticas.
  - icon: 🐳
    title: Infraestrutura Documentada
    details: Explicação completa dos containers Docker, arquivos do diretório infra, healthchecks, pipelines do Collector e provisionamento do Grafana.
  - icon: 🛠️
    title: Operação e Troubleshooting
    details: Scripts, dependências, comandos úteis, smoke tests e caminhos de diagnóstico para falhas comuns da stack.
---

## Roteiro de leitura recomendado

:::tip Ordem sugerida
1. Leia [Visão Geral do Projeto](/projeto/visao-geral).
2. Siga para [O que é OpenTelemetry](/tecnologias/opentelemetry).
3. Leia [Pino](/tecnologias/pino).
4. Depois leia [Logging na Arquitetura](/arquitetura/logging).
5. Em seguida leia [OpenTelemetry na Arquitetura](/arquitetura/opentelemetry).
6. Continue em [Infraestrutura / Stack Docker](/infraestrutura/stack-docker).
7. Para implementar novas rotas e use-cases, use [OpenTelemetry na Prática](/arquitetura/opentelemetry-na-pratica).
:::

## Atalhos operacionais

```bash
npm run start:local
npm run observability:up
npm run observability:ps
npm run observability:smoke
npm run docs:dev
```

## O que esta documentado

- Estado atual do projeto e avaliação técnica.
- Estrutura das pastas e responsabilidades por camada.
- Dependências principais e scripts operacionais.
- Implementação de logging estruturado com `Pino`.
- Implementação da instrumentação automática e manual do OpenTelemetry.
- Implementação detalhada do diretório `infra/` e dos containers Docker.
- Troubleshooting para falhas comuns da stack de observabilidade.
