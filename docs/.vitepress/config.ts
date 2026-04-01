import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Design Soft DDD',
  description: 'Documentação do projeto com Domain-Driven Design',

  themeConfig: {
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Domínio', link: '/dominio/entidades' },
      { text: 'Arquitetura', link: '/arquitetura/organizacao' },
      { text: 'Testes', link: '/testes/testes-unitarios' }
    ],

    sidebar: [
      {
        text: 'Domínio',
        items: [
          { text: 'Entidades', link: '/dominio/entidades' },
          { text: 'Value Objects', link: '/dominio/value-objects' },
          { text: 'Casos de Uso', link: '/dominio/casos-de-uso' }
        ]
      },
      {
        text: 'Arquitetura',
        items: [
          { text: 'Organização', link: '/arquitetura/organizacao' }
        ]
      },
      {
        text: 'Testes',
        items: [
          { text: 'Testes Unitários', link: '/testes/testes-unitarios' }
        ]
      }
    ]
  }
})