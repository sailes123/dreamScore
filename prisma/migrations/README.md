# Prisma migrations

The committed `20261011000000_initial_schema` migration is the initial PostgreSQL schema generated from `../schema.prisma`.

Apply all committed migrations locally or in deployment with:

```powershell
npm run db:deploy
```

For every schema change, generate and commit a new timestamped migration with:

```powershell
npm run db:migrate -- --name descriptive_change
```

Production uses `db:deploy` only. Do not use `prisma db push` or `migrate dev` in production.
