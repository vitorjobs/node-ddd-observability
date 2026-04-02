---
outline: deep
---

# Entidades do domínio

As entidades representam objetos com identidade própria no domínio atual do projeto.

## Arquivos implementados

| Entidade | Arquivo | Responsabilidade atual |
| --- | --- | --- |
| `Student` | `src/domain/entities/student.ts` | Representa um aluno com `id` e `name`. |
| `Question` | `src/domain/entities/question.ts` | Representa uma pergunta com `title`, `content`, `slug` e `authorId`. |
| `Answer` | `src/domain/entities/answer.ts` | Representa uma resposta com `content`, `authorId` e `questionId`. |
| `Instructor` | `src/domain/entities/instructor.ts` | Representa um instrutor com `id` e `name`. |

## Como as entidades estão modeladas

### `Student`

- Usa `id` e `name`.
- O `id` pode ser recebido externamente.
- Caso não exista, a geração de identificador é delegada ao construtor.

### `Question`

- Concentra atributos de conteúdo e autoria.
- Usa o value object `Slug` para representar a versão normalizada do título.

### `Answer`

- Mantém o vínculo com a pergunta e o autor.
- Hoje está modelada como uma entidade simples, sem regras adicionais.

### `Instructor`

- É a entidade mais enxuta do conjunto.
- Hoje funciona como apoio para os exemplos do domínio.

## Regras gerais para novas entidades

:::tip Diretriz principal
Mantenha as entidades focadas em estado e regras de domínio. Observabilidade, transporte HTTP, DTOs e dependências de infraestrutura devem ficar fora delas.
:::

- Evite acoplar Fastify, OpenTelemetry ou Docker ao domínio.
- Prefira construtores simples e coesos.
- Se uma transformação tiver identidade própria e regra de validade, considere um value object.
- Preserve nomes orientados ao domínio, não à camada técnica.

## Estado atual

:::info Leitura honesta do projeto
As entidades atuais cumprem bem o papel didático do curso, mas ainda formam um domínio inicial. Com a evolução do projeto, é natural surgirem invariantes, políticas de validação e relações mais ricas entre agregados.
:::
