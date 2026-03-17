# Qahal — Church Management Platform

A modern, multi-tenant SaaS platform for church management.

## Quick Start

### Prerequisites
- Node.js >= 20
- Docker & Docker Compose (for Postgres + Redis)

### Setup

```bash
# 1. Start databases
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy env file and configure
cp .env.example .env

# 4. Copy Prisma schema
cp schema.prisma packages/database/prisma/schema.prisma

# 5. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 6. Seed the database
npm run db:seed

# 7. Start development
npm run dev
```

### Project Structure

```
qahal/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   │   └── src/
│   │       ├── app/      # App Router pages
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── lib/
│   │       └── styles/
│   └── api/              # NestJS backend (port 4000)
│       └── src/
│           ├── modules/  # Feature modules
│           ├── common/   # Guards, middleware, decorators
│           └── config/
├── packages/
│   ├── database/         # Prisma schema, client, seed
│   ├── shared/           # Types, validators, constants
│   └── ui/               # Shared UI components (future)
├── docker-compose.yml
├── turbo.json
└── package.json
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Lint all packages |
| `npm run test` | Run all tests |
