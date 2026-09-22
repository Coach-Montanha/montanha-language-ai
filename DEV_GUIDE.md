# MANUAL TÉCNICO DO DESENVOLVEDOR — MONTANHA LANGUAGE AI
> **Classificação:** Documento Interno e Confidencial de Engenharia de Software  
> **Localização:** Raiz do repositório (`/DEV_GUIDE.md`). **NUNCA** mova este arquivo para a pasta `public/` ou `dist/` para evitar exposição pública via HTTP.  
> **Data de Atualização:** 22/09/2026  
> **Versão do Documento:** 1.0.0

---

## 1. Visão Geral & Escopo do Projeto

### 1.1. O que é o Montanha Language AI?
O **Montanha Language AI** é a plataforma de aprendizado de idiomas com inteligência artificial do **Ecossistema Montanha**. Focado em micro-aprendizado de alta retenção através de treinos diários de 5 minutos, o aplicativo combina imersão contextual, repetição espaçada (SRS), reconhecimento de padrões de conversação e correção inteligente de pronúncia e gramática.

### 1.2. Links e Referências de Produção
- **URL Canônica em Produção:** `https://montanha-language-ai.vercel.app`
- **Repositório GitHub:** `https://github.com/Coach-Montanha/montanha-language-ai`
- **Time Vercel:** `Ecossistema Montanha` (Plano Hobby)
- **Tecnologia Base:** TanStack Start (SSR via Nitro / Vercel Serverless Function) + React 19 + Tailwind CSS v4 + Supabase + IA Tutors

---

## 2. Arquitetura do Sistema & Stack Tecnológica

### 2.1. Frontend & SSR (TanStack Start)
- **Framework:** `@tanstack/react-start` (v1.168.32) e roteamento via `@tanstack/react-router` (v1.170.18).
- **Compilador/Bundler:** Vite 8 com `@tailwindcss/vite` (Tailwind CSS v4).
- **Motor SSR:** Nitro configurado com o preset `vercel` gerando saídas para AWS Lambda.
- **Tipografia & Estilos:** Família tipográfica *Plus Jakarta Sans* injetada no cabeçalho com suporte a temas visuais dinâmicos (`classic`, `midnight`).

### 2.2. Backend & Inteligência Artificial
- **Supabase:** Gerencia perfis de usuários, progresso diário, ofensiva (*streaks*) de aprendizado e histórico de respostas.
- **Micro-Treinos de IA:** Sessões adaptativas baseadas no desempenho anterior do usuário.

---

## 3. Estrutura de Pastas e Componentes Críticos

```
Montanha Language AI/
├── .vercel/                 # Artefatos da compilação serverless da Vercel
├── public/                  # Arquivos públicos
│   ├── icons/               # Ícones de alta resolução PWA (192, 512)
│   ├── manifest.webmanifest # Manifesto PWA
│   ├── sw.js                # Service Worker para suporte a estudos offline
│   ├── robots.txt           # Rastreamento SEO liberado com link para o sitemap
│   └── sitemap.xml          # Rotas públicas indexadas pelo Google
├── src/
│   ├── components/          # Componentes de interface do tutor
│   │   ├── ImpersonationBanner.tsx # Banner de suporte técnico
│   │   └── ui/              # Componentes de interface (Progress, OTP, Dialogs)
│   ├── integrations/
│   │   └── supabase/        # Conexão e esquemas Supabase
│   ├── routes/              # Rotas do aplicativo
│   │   ├── __root.tsx       # Head global, SEO, JSON-LD, temas e fontes
│   │   ├── index.tsx        # Dashboard de treinos diários e progresso
│   │   ├── boost.tsx        # Módulo Booster
│   │   ├── create.tsx       # Módulo Creator com IA
│   │   ├── eco.tsx          # Central do Ecossistema Montanha
│   │   └── master-admin.tsx # Link para o Master Admin
│   ├── styles.css           # Estilos globais
├── DEV_GUIDE.md             # ESTE MANUAL TÉCNICO INTERNO
├── package.json             # Dependências e scripts de execução
├── tsconfig.json            # Configurações TypeScript
└── vite.config.ts           # Configurações do Vite e Nitro
```

---

## 4. Regras Críticas de Build e Deploy

### ⚠️ REGRA 1: Bloqueio de Autor Git na Vercel (Cadeado 🔒 / Deploy Blocked)
- **O Problema:** A conta Vercel do projeto pertence à equipe `Ecossistema Montanha` no **plano Hobby**. Qualquer commit vindo de um autor não correspondente à conta `coach-montanha` no GitHub é bloqueado com cadeado.
- **A Solução Obrigatória:** O Git DEVE estar configurado com:
  ```bash
  git config --global user.name "Coach-Montanha"
  git config --global user.email "Coach-Montanha@users.noreply.github.com"
  ```
  Ao commitar:
  ```bash
  git commit --author="Coach-Montanha <Coach-Montanha@users.noreply.github.com>" -m "feat/fix: mensagem"
  ```

### ⚠️ REGRA 2: Erro 500 no SSR da Vercel (`tslib`)
- **O Problema:** A ausência de `tslib` em produção resulta em falhas de carregamento nos componentes do Radix UI.
- **A Salvaguarda:**
  1. `"tslib": "^2.8.1"` em `"dependencies"` no `package.json`.
  2. `nitro.externals.inline: ["tslib"]` no `vite.config.ts`.

---

## 5. Guia Passo a Passo de Execução Local e Testes

```bash
# 1. Instalação de dependências
bun install

# 2. Iniciar servidor local de desenvolvimento
bun run dev

# 3. Compilação para produção
bun run build

# 4. Executar testes E2E com Playwright
bun run test:e2e
```

---

## 6. Troubleshooting e Resolução Rápida de Falhas

| Sintoma | Causa Mais Provável | Como Resolver |
| :--- | :--- | :--- |
| **Ofensiva (*streak*) não atualiza** | Fuso horário descompassado entre o cliente e o servidor. | As datas de treino devem ser calculadas no fuso horário do usuário via `date-fns` ou UTC normalizado. |
| **Fontes ou layout quebrado ao iniciar** | Falha de leitura do `localStorage` no script inline. | O script inline em `src/routes/__root.tsx` contém bloco `try/catch` para evitar bloqueios em modo de navegação anônima. |
| **Deploy bloqueado na Vercel** | Autor do Git incompatível com o plano Hobby. | Force o autor `Coach-Montanha <Coach-Montanha@users.noreply.github.com>` no commit. |
