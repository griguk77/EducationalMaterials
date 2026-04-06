# Backend (Spring Boot, Kotlin)

## Run (dev, H2)

```powershell
cd backend
gradlew.bat bootRun
```

Default profile is `dev` and uses in-memory H2.

## Run (prod, PostgreSQL)

Set env vars and start app:

```powershell
$env:SPRING_PROFILES_ACTIVE="prod"
$env:DB_URL="jdbc:postgresql://localhost:5432/edumaterials"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="set-a-long-random-secret"
gradlew.bat bootRun
```

## Migrations

Flyway migrations are stored in `src/main/resources/db/migration`.
Schema bootstrap migration: `V1__init_schema.sql`.
