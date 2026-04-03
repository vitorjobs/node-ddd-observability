import { defineConfig } from 'vitepress'

function normalizeBasePath(value?: string) {
  if (!value) {
    return '/'
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const docsBasePath = normalizeBasePath(process.env.DOCS_BASE_PATH)

export default defineConfig({
  base: docsBasePath,
  lang: 'pt-BR',
  title: 'Design Soft DDD',
  description: 'Documentação técnica do projeto com DDD, OpenTelemetry e stack local de observabilidade',

  themeConfig: {
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: 'Nesta página',
    },
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Projeto', link: '/projeto/visao-geral' },
      { text: 'OpenTelemetry', link: '/tecnologias/opentelemetry' },
      { text: 'Arquitetura', link: '/arquitetura/visao-geral' },
      { text: 'Infraestrutura', link: '/infraestrutura/stack-docker' },
      { text: 'Troubleshooting', link: '/troubleshooting/observabilidade-e-docker' },
    ],

    sidebar: [
      {
        text: 'Projeto',
        items: [
          { text: 'Visão Geral', link: '/projeto/visao-geral' },
          { text: 'Dependências e Scripts', link: '/projeto/dependencias-e-scripts' },
          { text: 'Controle de Versão e Branches', link: '/projeto/controle-de-versao-e-branches' },
        ],
      },
      {
        text: 'OpenTelemetry',
        items: [
          { text: 'O que é OpenTelemetry', link: '/tecnologias/opentelemetry' },
          { text: 'OpenTelemetry na Arquitetura', link: '/arquitetura/opentelemetry' },
          { text: 'OpenTelemetry na Prática', link: '/arquitetura/opentelemetry-na-pratica' },
        ],
      },
      {
        text: 'Arquitetura',
        items: [
          { text: 'Visão Geral', link: '/arquitetura/visao-geral' },
        ],
      },
      {
        text: 'Infraestrutura',
        items: [
          { text: 'Stack Docker', link: '/infraestrutura/stack-docker' },
          { text: 'Configurações da Stack', link: '/infraestrutura/configuracoes-da-stack' },
        ],
      },
      {
        text: 'Domínio',
        items: [
          { text: 'Entidades', link: '/dominio/entidades' },
          { text: 'Value Objects', link: '/dominio/value-objects' },
          { text: 'Use Cases', link: '/dominio/use-cases' },
        ],
      },
      {
        text: 'Troubleshooting',
        items: [
          { text: 'Observabilidade e Docker', link: '/troubleshooting/observabilidade-e-docker' },
        ],
      },
    ],
    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página',
    },
    footer: {
      message: 'Documentação técnica do estado atual do projeto e da stack de observabilidade.',
      copyright: 'Design Soft DDD',
    },
  },
})
