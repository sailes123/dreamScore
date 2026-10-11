# ArenaOps architecture guide

## Purpose

ArenaOps manages multi-sport tournaments: organizer workspaces, teams and players, fixture generation, live scoring, standings, payments, exports, and retention. The original Vite interface remains in `src/components` as a visual/domain reference while the new App Router application is built in `src/app`.

## Technology and boundaries

Next.js owns both the web UI and backend. PostgreSQL is the only persistent store. Prisma is the database boundary; browser components must never access Prisma directly. Mutations belong in server actions or route handlers, validate input with Zod, authorize the current user, execute within a transaction where multiple records change, and write an audit log.

```
Browser -> App Router page/client component -> server action or route handler -> domain service -> Prisma -> PostgreSQL
```

Use `src/lib/prisma.ts` for the singleton client. Put reusable business rules in `src/features/<feature>/server`, never inside a page component.

## Identity and access

Authentication is email/password only for the first release. Auth.js credentials validation is in `src/lib/auth.ts`; passwords are bcrypt hashes and must never be returned from an API. Roles are `PLATFORM_ADMIN`, `ORGANIZER`, and `PUBLIC`. Tournament membership further grants `OWNER` or `MANAGER`. Every write must check both authentication and membership/ownership.

## Data model

`Tournament` owns venues, members, teams, matches, exports, and audit logs. A `Team` owns players. `MatchEvent` belongs to a match and may reference primary/secondary players. Packages, versioned package prices, and purchases preserve immutable price snapshots. `ArchivedTournament` preserves the lightweight history after retention purge.

The Prisma schema is the canonical model: `prisma/schema.prisma`. Avoid duplicating database types by hand; derive types from Prisma and map them to UI DTOs at feature boundaries.

## Business invariants

- Tournament structure cannot change after its first live/completed match.
- Match-event writes and score changes occur in one transaction.
- Standings and player statistics are derived from matches/events; do not persist a second mutable copy.
- Detailed tournament records can be purged only after a successful export record exists.
- Price versions are append-only; purchases keep snapshots of the selected price/package.
- Use UTC `DateTime` values and retain the tournament timezone for presentation.

## Database migrations

Copy `.env.example` to `.env`, start PostgreSQL with `docker compose up -d`, then run `npm run db:migrate`, `npm run db:seed`, and `npm run dev`.

Development creates a timestamped migration with `npm run db:migrate`. Commit the generated directory under `prisma/migrations`. Production only runs `npm run db:deploy`; it must never use `prisma db push` or `migrate dev`. For risky schema changes use expand -> backfill -> switch reads/writes -> contract in separate deploys.

## Folder conventions

- `src/app`: routes, layouts, and route handlers
- `src/features`: vertical feature modules (UI, schemas, services, tests)
- `src/lib`: shared infrastructure only
- `prisma`: schema, migrations, and repeatable seed
- `docs`: decisions and operational documentation

## Initial local account

The seed creates `admin@arenaops.local` with password `ChangeMe123!`. It is development-only and must be changed or removed in deployed environments.
