# Sistema Eleitoral Local (MVP)

Sistema web 100% local para cadastro de candidaturas, votação e administração da eleição com controle de fase.

## Arquitetura (visão geral)
O projeto é um monorepo com **frontend React + Vite + TypeScript + Tailwind** e **backend Node.js + Express + TypeScript**, persistindo tudo em **SQLite local via Prisma**. O frontend consome a API REST local (`/api`), enquanto o backend concentra regras de negócio (fases, validação, aprovação, votos e exportação CSV). A autenticação de admin usa senha do `.env` (`ADMIN_PASSWORD`) e token JWT simples para sessões locais.

## Estrutura de pastas

```txt
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── middleware/auth.ts
│   │   ├── routes/admin.ts
│   │   ├── routes/public.ts
│   │   ├── utils/csv.ts
│   │   ├── index.ts
│   │   ├── prisma.ts
│   │   └── types.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── src
│   │   ├── api/client.ts
│   │   ├── components/*
│   │   ├── pages/*
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
├── package.json
└── README.md
```

## Setup local (offline)

### 1) Instalar dependências
```bash
npm install
```

### 2) Configurar ambiente do backend
```bash
cp backend/.env.example backend/.env
```

### 3) Rodar migration e gerar client Prisma
```bash
npm run prisma:migrate -w backend
npm run prisma:generate -w backend
```

### 4) (Opcional) Popular dados de exemplo
```bash
npm run prisma:seed -w backend
```

### 5) Subir backend + frontend
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Trocar senha do admin
Edite `backend/.env` e altere:

```env
ADMIN_PASSWORD="sua-nova-senha-forte-local"
```

Depois reinicie o backend.

## Segurança e escopo
- Este MVP é para **uso local** em `localhost`.
- Não é uma solução de segurança robusta para internet pública.
- Há validação no backend e rate limit básico.

## Regras principais implementadas
- Candidatos entram como `PENDENTE`.
- Votação lista apenas `APROVADO`.
- Fase da eleição persistida em `Setting` (`CANDIDATURA`, `VOTACAO`, `ENCERRADA`).
- Admin aprova/rejeita candidatos, vê resultados, exporta CSV e reseta eleição.
- Comentário no backend com feature opcional para “1 voto por código de eleitor”.
