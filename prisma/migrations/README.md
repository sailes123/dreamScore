# Initial migration generation

The initial PostgreSQL migration is generated from `../schema.prisma` once Docker Desktop is running:

```powershell
docker compose up -d
npm run db:migrate -- --name initial_schema
```

The command creates a timestamped directory here containing `migration.sql`. Commit that generated directory. It cannot be applied in this checkout because the local Docker daemon was not running during setup.
