# ArenaOps production-readiness plan

Last updated: 2026-10-12 (Asia/Kathmandu)

This document is the durable implementation checklist for turning the existing UI prototype into a production-ready Next.js application. Check an item only when the code and its verification evidence are present in the repository.

## Architecture

```text
Next.js App Router UI
  -> authenticated server pages / client forms
  -> route handlers (API) and server-domain services
  -> Prisma transactions + audit logging
  -> PostgreSQL (Docker locally, managed Postgres in production)
```

The browser never calls Prisma. Every write validates a Zod DTO, obtains the Auth.js session, authorizes a system role and tournament membership, performs related writes atomically, and creates an audit record. Prisma migrations are the only schema-change mechanism.

## Delivery checklist

- [x] Database container configured with an environment-supplied password.
- [x] Prisma domain schema exists for identity, tournaments, registrations, fixtures, results, payments, exports, retention, and audit logs.
- [x] Create and commit the initial Prisma migration; verified with `npm run db:deploy` against the configured Supabase PostgreSQL database on 2026-10-11. Baseline seed data was applied successfully.
- [ ] Rotate the remotely seeded development administrator credential by setting a strong local `SEED_ADMIN_PASSWORD` and running `npm run db:seed` once more.
- [x] Add reusable API primitives: typed errors, JSON response helpers, request validation, session/role guards, tournament membership guards, and audit-log writer.
- [x] Implement registration endpoint and production-safe sign-in flow, including uniqueness checks, bcrypt hashing, generic credential errors, redirects, authenticated password changes, sign-out, and a complete UI for single-use, one-hour Resend password-reset tokens. Email verification, MFA, and rate limits remain pending.
- [x] Implement authenticated tournament CRUD and membership management endpoints. Tournament owners can list, add/reactivate, and remove manager memberships; tournament status updates follow an enforced lifecycle and private visibility always has an invitation code.
- [x] Implement team and player CRUD endpoints with ownership, registration-state, jersey-number, structural-lock, and audit rules.
- [x] Implement venue/court and fixture endpoints; enforce structural locking once live play starts. Venue/court CRUD and fixture list/create/edit/delete are implemented; fixture edits are limited to pre-live fixtures.
- [x] Implement live match state and event endpoints in transactions; derive scores consistently. State updates, event creation, deletion, and completed-match corrections are atomic; every change recomputes scores from the event log. Completed-match corrections require a reason and create an audit record.
- [x] Implement public tournament read endpoints and pages with private/invitation protection. Public listing, detail, and derived standings are implemented; private API/page reads require a generated invitation code.
- [x] Implement package purchase/admin approval endpoints and database-backed organizer/admin purchase screens; immutable package/price snapshots, owner purchase scope, and platform-admin approval are enforced. eSewa signed-form/callback verification and organizer checkout UI redirects are implemented. The Khalti adapter remains inactive for a future release. Provider credentials and sandbox verification remain pending.
- [x] Replace mock-state runtime organizer routes with server-backed UI. Legacy route aliases now redirect only to the database-backed organizer pages; unimplemented legacy views return 404.
- [ ] Add client forms, loading/error/empty states, and route protection for login, registration, organizer, admin, and public flows. Registration, login, tournament, team, player, venue/court, fixture, package-purchase, match-control, and admin review forms are implemented; broader organizer form coverage remains pending.
- [ ] Add API/domain tests plus auth and authorization coverage. Standings derivation has unit coverage; API/auth/authorization integration coverage remains pending.
- [ ] Add rate limiting, security headers, request logging, error monitoring, email delivery, object storage, backups, and deployment-secret configuration. Baseline browser security headers, a database-readiness health endpoint, authenticated local-folder uploads, structured local error logs, and per-instance throttling for registration, password reset, checkout, and uploads are configured; shared/distributed rate limiting, backups, and provider credentials remain pending.
- [ ] Run typecheck, tests, build, migration deployment smoke test, and documented production release checklist. Typecheck, build, current test suite, migration deployment, seed execution, and the Supabase-backed `/api/health` runtime smoke test have passed; end-to-end authenticated API smoke tests and release-provider configuration remain pending.

## Migration flow

1. Change `prisma/schema.prisma` in a backwards-compatible way when possible.
2. On a local disposable database run `npm run db:migrate -- --name <descriptive_name>`.
3. Review and commit the generated `prisma/migrations/<timestamp>_<name>/migration.sql` with the schema change.
4. Run `npm run db:generate`, tests, and `npm run db:deploy` against a clean database.
5. In CI/CD, run only `npm run db:deploy` before starting the application. Never use `prisma db push` or `migrate dev` in production.
6. For breaking changes: expand schema, deploy compatible code, backfill, switch reads/writes, then contract schema in a later release.

## Production release checklist

Before deploying a production release:

1. Set production-only `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` in the hosting provider. Never commit `.env`.
2. Set a strong `SEED_ADMIN_PASSWORD` before any non-local seed execution; rotate the initial administrator account if it was seeded with the fallback password.
3. Run `npm run db:generate`, `npm run typecheck`, `npm test`, and `npm run build` from the release commit.
4. Run `npm run db:deploy` exactly once against the target database before starting new application instances.
5. Verify `GET /api/health` returns HTTP 200 from the deployed service.
6. Smoke-test registration, sign-in/out, account password change, organizer fixture creation, live scoring, public results, a purchase submission, and admin purchase approval using test data.
7. Configure monitoring, error reporting, backups, email delivery, storage, and payment-provider webhooks before accepting real users or payments.

## Sandbox payment setup

eSewa is the active online checkout provider. Its sandbox settings are in `.env.payment-sandbox.example`; copy them into the untracked `.env` file to run test checkouts. The Khalti adapter is retained but deliberately hidden from the organizer UI until it is enabled in a later release. Do not use sandbox values in production.

## Current implementation milestone

Milestone 1 has a verified Supabase database baseline: `npm run db:deploy` applied the committed password-reset token migration successfully on 2026-10-11. The existing `TournamentContext` is a browser-local demo and is not treated as the source of truth for production writes. The organizer dashboard links every database-backed workflow: teams, players, venues, fixtures, match control, standings, package purchase, and account security. The current API surface includes registration, Resend-backed password reset, public/private tournament reads, authenticated tournament/membership management, full team/player and venue/court CRUD, fixture list/create/delete, live-match state/event writes and completed-match corrections, purchase submission, and admin purchase approval.
