---
outline: deep
---

# Use Cases

Os use cases representam a camada de aplicação do domínio já iniciada no projeto.

## Arquivos implementados

| Use case | Arquivo | Papel atual |
| --- | --- | --- |
| `StudentQuestionUseCase` | `src/domain/use-cases/student-question.ts` | Cria um `Student` a partir dos dados recebidos e valida o `studentId`. |
| `AnswerQuestionUseCase` | `src/domain/use-cases/answer-question.ts` | Cria uma `Answer` com `questionId`, `instructorId` e `content`. |

## Leitura técnica do estado atual

:::info Maturidade atual
Os use cases existentes ainda são exemplos iniciais do curso. Eles são úteis para modelagem e testes, mas ainda não representam uma camada de aplicação completa com controllers, repositórios, persistência e tratamento padronizado de erros.
:::

## Como essa camada deve evoluir

Com a expansão do projeto, esta camada tende a concentrar:

- orquestração de entidades e value objects
- chamadas a repositórios
- regras transacionais
- integração com serviços externos
- retorno padronizado para controllers

## Relação com observabilidade

:::tip Regra importante
O domínio não precisa conhecer OpenTelemetry para começar bem. A recomendação do projeto é instrumentar a borda da aplicação e usar os use cases como o centro da regra de negócio.
:::

Na prática:

- a rota informa os metadados da operação
- o handler ou controller envolve o fluxo com `runObservedOperation()`
- o use case permanece limpo e focado em negócio

## Convenções recomendadas para novos use cases

- Nomeie a classe pelo verbo de negócio: `CreateStudentUseCase`, `AnswerQuestionUseCase`.
- Exponha um método `execute()` com entrada bem definida.
- Mantenha retorno previsível.
- Isole regras de observabilidade fora do núcleo do domínio, salvo quando houver uma necessidade muito específica.
