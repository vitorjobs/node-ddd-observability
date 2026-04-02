---
outline: deep
---

# Value Objects

O projeto possui hoje um value object explícito: `Slug`.

## `Slug`

Arquivo:

- `src/domain/entities/value-objects/slug.ts`

Responsabilidade:

- normalizar texto para um formato estável de URL
- encapsular a transformação em um tipo próprio

## Comportamento atual

O método `Slug.createFromText()`:

- normaliza caracteres Unicode
- converte o texto para minúsculas
- remove espaços excedentes
- troca espaços por hífen
- remove caracteres inválidos
- evita repetições e hífens sobrando ao final

## Quando criar novos value objects

Crie um value object quando um valor:

- tiver regra de formatação própria
- precisar de validação recorrente
- merecer semântica explícita no domínio
- não fizer sentido existir apenas como `string` ou `number`

## O que não colocar aqui

- dependência de banco
- logs
- OpenTelemetry
- comportamento específico de rota ou controller
