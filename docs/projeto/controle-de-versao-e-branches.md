---
outline: deep
---

# Controle de versão e branches

Esta página documenta o fluxo oficial de branches adotado neste repositório.

## Fonte da verdade

:::tip Regra principal
Neste projeto, a branch `develop` é a fonte da verdade tanto localmente quanto no remoto.
:::

Consequências práticas:

- toda nova branch deve nascer a partir de `develop`
- todo pull request deve apontar para `develop`
- depois de um merge no GitHub, a `develop` local precisa ser atualizada manualmente

## Nomes que valem neste projeto

O padrão real deste repositório é:

- `develop` para integração
- `origin/develop` para a referência remota principal

Evite misturar com nomes como:

- `developer`
- `development`

Esses nomes não são a branch de integração configurada hoje.

## Fluxo padrão de trabalho

### 1. Atualizar a base local

```bash
git switch develop
git pull --ff-only origin develop
```

Leitura:

- `git switch develop`: move o seu diretório de trabalho para a branch `develop`
- `git pull --ff-only origin develop`: baixa o estado mais recente do remoto e só atualiza a branch local se isso puder ser feito sem merge local manual

Por que usar `--ff-only`:

- evita merges locais acidentais
- preserva uma linha de histórico mais previsível
- força você a perceber quando há divergência real

### 2. Criar uma branch nova a partir de `develop`

```bash
git switch -c docs/branch-workflow-guide develop
```

Leitura:

- `-c` cria a branch e já troca para ela
- o último argumento informa explicitamente que a nova branch nasce de `develop`

### 3. Trabalhar e validar a alteração

Exemplo comum neste projeto:

```bash
npm test
npm run docs:build
```

Objetivo:

- garantir que o código continua consistente
- garantir que a documentação continua buildando

### 4. Preparar e registrar o commit

```bash
git add -A
git commit -m "docs(project): document branch workflow"
```

Leitura:

- `git add -A`: coloca no staging tudo que foi alterado, criado ou removido
- `git commit -m ...`: registra um snapshot lógico da mudança atual

### 5. Publicar a branch remota

```bash
git push -u origin docs/branch-workflow-guide
```

Leitura:

- `git push`: envia commits locais ao remoto
- `origin`: nome do remoto principal
- `-u`: cria a relação de tracking entre a branch local e a remota

Na prática, depois disso fica mais simples usar apenas:

```bash
git push
git pull
```

### 6. Abrir pull request para `develop`

Regra do projeto:

- base do PR: `develop`
- compare branch: a sua branch de trabalho

### 7. Depois do merge no GitHub

O merge no GitHub atualiza o remoto, mas não atualiza automaticamente sua cópia local.

Então o passo correto é:

```bash
git fetch --all --prune
git switch develop
git pull --ff-only origin develop
```

Leitura:

- `git fetch --all --prune`: atualiza referências remotas e remove ponteiros remotos que não existem mais
- `git switch develop`: volta para a branch fonte da verdade
- `git pull --ff-only origin develop`: traz o merge feito no GitHub para sua máquina

## Fluxo aplicado nesta própria entrega

Esta página foi criada seguindo o mesmo fluxo que ela documenta.

Comandos aplicados nesta entrega:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c docs/branch-workflow-guide develop
```

Depois disso, a alteração foi implementada na branch nova, exatamente como a convenção do projeto exige.

## Como ler os comandos de inspeção

### `git status --short --branch`

Exemplo:

```bash
git status --short --branch
```

Saída possível:

```txt
## develop...origin/develop
```

Interpretação:

- você está na branch `develop`
- não há diferença relevante entre local e remoto

Outro exemplo:

```txt
## develop...origin/develop [behind 2]
```

Interpretação:

- sua `develop` local está duas revisões atrás da `origin/develop`
- isso normalmente acontece depois de um merge remoto ainda não trazido para a máquina local

### `git branch -vv --all`

Exemplo:

```bash
git branch -vv --all
```

Esse comando mostra:

- branches locais
- branches remotas
- commit atual de cada branch
- relação de tracking
- se a branch local está `ahead` ou `behind`

Exemplo de leitura:

```txt
develop 301b04e [origin/develop: behind 2]
```

Significa:

- sua branch local `develop` aponta para `301b04e`
- ela acompanha `origin/develop`
- o remoto já avançou dois commits

### `git log --oneline --decorate --graph --max-count=12 --all`

Exemplo:

```bash
git log --oneline --decorate --graph --max-count=12 --all
```

Esse comando é útil para:

- enxergar o grafo de branches
- identificar merges
- entender de onde uma branch saiu
- confirmar em qual commit local e remoto estão parados

## Exemplo real deste repositório

Este projeto já passou por um caso real que ilustra bem o fluxo.

### O que aconteceu

1. Foi criada a branch `docs/github-pages-deploy` a partir de `develop`.
2. Um commit local foi criado para preparar o deploy do VitePress.
3. Uma branch remota equivalente foi publicada.
4. O pull request foi aprovado e mergeado no GitHub em `develop`.
5. Depois do merge, ainda foi necessário atualizar as referências locais.

### Commits reais envolvidos

| Contexto | Commit |
| --- | --- |
| Base antes da feature | `301b04e` |
| Commit local da branch | `6d0b490` |
| Commit remoto equivalente da branch | `f5a0783` |
| Merge commit em `origin/develop` | `0a7a259` |

### O que isso ensina

- merge no GitHub não move sua branch local automaticamente
- merge no GitHub não troca sua branch atual para `develop`
- depois do merge, ainda existe um passo local obrigatório para voltar a alinhar a fonte da verdade

### Comando correto depois do merge

```bash
git switch develop
git pull --ff-only origin develop
```

Esse foi exatamente o passo necessário para deixar:

- `develop` local alinhada com `origin/develop`
- o desenvolvedor novamente posicionado na branch fonte da verdade

## Sobre divergência de SHA entre local e remoto

No caso real acima, a branch local e a remota ficaram com SHAs diferentes:

- local: `6d0b490`
- remoto: `f5a0783`

Isso não significa necessariamente conteúdo diferente.

Pode acontecer quando a branch remota é publicada por um caminho diferente de um `git push` tradicional.

No fluxo normal recomendado para este projeto, o esperado é:

```bash
git push -u origin nome-da-branch
```

Assim, a branch local e a remota tendem a apontar para exatamente o mesmo commit.

## Fluxo resumido recomendado

```bash
git switch develop
git pull --ff-only origin develop
git switch -c nome-da-branch

# trabalhar

git add -A
git commit -m "tipo(escopo): mensagem"
git push -u origin nome-da-branch
```

Depois do merge do PR:

```bash
git fetch --all --prune
git switch develop
git pull --ff-only origin develop
```

## Checklist de disciplina operacional

:::info Regra de ouro
Se terminou uma feature e o PR foi mergeado, o trabalho ainda não acabou enquanto sua `develop` local não estiver novamente alinhada com `origin/develop`.
:::

- Comece em `develop`.
- Atualize `develop` antes de abrir uma nova branch.
- Crie a branch nova explicitamente a partir de `develop`.
- Faça commit apenas na branch de trabalho.
- Abra PR sempre para `develop`.
- Depois do merge, volte para `develop` e atualize a branch local.
