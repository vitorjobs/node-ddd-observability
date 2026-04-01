# 🚀 node-ddd-observability

Backend project built with **Node.js** and **TypeScript**, applying **Domain-Driven Design (DDD)** principles and enhanced with **observability** using OpenTelemetry, Prometheus and Grafana.

---

## 📌 📖 Sobre o Projeto

O **node-ddd-observability** é um projeto com foco em:

- Construção de aplicações backend com **DDD**
- Aplicação de boas práticas de **Clean Architecture**
- Implementação de **observabilidade desde a concepção**
- Integração entre **desenvolvimento e infraestrutura**

Este projeto foi concebido para servir como:

- Base sólida para aplicações escaláveis
- Laboratório de boas práticas modernas
- Projeto de portfólio profissional

---

## 🧱 🏗️ Arquitetura

O projeto segue os princípios de **Domain-Driven Design (DDD)**:

### 🔹 Camadas principais

- **Domain**
  - Entidades
  - Value Objects
  - Regras de negócio
- **Use Cases**
  - Orquestração das regras de negócio
- **Application (futuro)**
  - Controllers / APIs
- **Infrastructure (futuro)**
  - Banco de dados
  - Integrações externas

---

## 📁 📂 Estrutura do Projeto

```bash
node-ddd-observability/
├── src/
│   └── domain/
│       ├── entities/
│       │   ├── value-objects/
│       │   ├── student.ts
│       │   ├── question.ts
│       │   ├── answer.ts
│       │   └── instructor.ts
│       └── use-cases/
│           ├── student-question.ts
│           └── answer-question.ts
│
├── docs/                 # Documentação (VitePress)
├── docker/               # Stack de observabilidade (futuro)
├── scripts/              # Automação e deploy
├── .github/              # CI/CD (futuro)
│
├── README.md
├── package.json
└── tsconfig.json
```

---

## 🧠 💡 Conceitos Aplicados

- Domain-Driven Design (DDD)
- Clean Architecture
- SOLID
- Value Objects
- Testes unitários com Vitest
- Observabilidade por design

---

## 🔭 📊 Observabilidade

O projeto será instrumentado com:

- **OpenTelemetry**
- **Prometheus**
- **Grafana**

### 🎯 Objetivo

Permitir:

- Monitoramento de métricas de negócio
- Rastreamento de requisições (tracing)
- Diagnóstico de falhas em tempo real

---

## 🧪 🧬 Testes

O projeto utiliza:

- **Vitest** para testes unitários

### 📌 Cobertura esperada:

- Entidades
- Value Objects
- Use Cases

---

## ⚙️ 🚀 Como executar o projeto

### 📦 Instalar dependências

```bash
npm install
```

### ▶️ Executar em modo desenvolvimento

```bash
npm run dev
```

### 🧪 Rodar testes

```bash
npm run test
```

---

## 📚 📘 Documentação

A documentação do projeto é mantida com **VitePress**.

### ▶️ Rodar documentação

```bash
npm run docs:dev
```

Acesse:

```
http://localhost:5173
```

---

## 🐳 🧰 Roadmap (Próximos Passos)

- [ ] Implementar camada de API (Fastify)
- [ ] Adicionar OpenTelemetry
- [ ] Exportar métricas para Prometheus
- [ ] Criar dashboards no Grafana
- [ ] Dockerizar aplicação
- [ ] Pipeline CI/CD
- [ ] Publicar documentação

---

## 🧑‍💻 👨‍💼 Autor

**Vítor Guedes**

- Backend Developer | Node.js | TypeScript
- Infraestrutura & Observabilidade
- VMware | Veeam | Prometheus | Grafana

---

## 📄 📜 Licença

Este projeto está sob a licença MIT.

---

## ⭐ 💬 Considerações finais

Este projeto representa a convergência entre:

- Desenvolvimento backend moderno
- Arquitetura orientada ao domínio
- Observabilidade em ambientes reais

Se você busca construir sistemas **resilientes, escaláveis e monitoráveis**, este projeto é uma base sólida.

---