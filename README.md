# ArenaOps Tournament Platform

ArenaOps is a Next.js tournament-management platform backed by PostgreSQL and Prisma.

## Local development

1. Copy `.env.example` to `.env` and set a secure `AUTH_SECRET`.
2. Start Docker Desktop, then run `docker compose up -d`.
3. Run `npm run db:deploy` to apply the committed initial migration.
4. Run `npm run db:seed` to create local reference data and the development admin.
5. Run `npm run dev`, then open `http://localhost:3000`.

The seeded development account is `admin@arenaops.local` with password `ChangeMe123!` only when `SEED_ADMIN_PASSWORD` is absent. Set `SEED_ADMIN_PASSWORD` to a strong value and rerun `npm run db:seed` before using any non-local database.

## Commands

- `npm run dev` — local Next.js development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript validation
- `npm run db:migrate` — create/apply a development migration
- `npm run db:deploy` — apply committed migrations in deployment
- `npm run db:seed` — seed local data

Read [the architecture guide](docs/ARCHITECTURE.md) before adding features. The original Vite source remains under `src/components`, `src/context`, `src/services`, and `src/data` as a domain/UI migration reference; it is not part of the Next.js runtime.
