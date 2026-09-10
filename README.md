# Car Marketplace API — NestJS + Prisma + PostgreSQL

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your local Postgres credentials
cp .env.example .env

# 3. Create the database (if you haven't already)
createdb car_marketplace

# 4. Run the initial migration — this creates all 7 tables from prisma/schema.prisma
npx prisma migrate dev --name init

# 5. Start the dev server (watches for changes)
npm run start:dev
```

API will be live at `http://localhost:3000/api`.
Health check: `GET /api/health`.

## Project structure

```
prisma/schema.prisma   → all 7 tables: users, cars, listings, car_images,
                          inquiries, favorites, transactions
src/prisma/             → PrismaService + global PrismaModule
src/users/              → full example CRUD module (controller, service, DTOs)
src/app.module.ts       → wires everything together
```

## Adding the remaining modules

The `users` module is the template. For each remaining table, scaffold with:

```bash
nest g resource cars --no-spec
nest g resource listings --no-spec
nest g resource car-images --no-spec
nest g resource inquiries --no-spec
nest g resource favorites --no-spec
nest g resource transactions --no-spec
```

Then, in each generated service, inject `PrismaService` (see
`src/users/users.service.ts`) and swap the generated in-memory logic for
`this.prisma.<model>.findMany() / .create() / .update() / .delete()` calls.
Register each new module in `src/app.module.ts`'s `imports` array.

## Useful Prisma commands

| Command                          | What it does                                  |
|-----------------------------------|------------------------------------------------|
| `npm run prisma:migrate`          | Create/apply a migration in dev                |
| `npm run prisma:deploy`           | Apply migrations in production                 |
| `npm run prisma:studio`           | Open a GUI to browse/edit your data            |
| `npm run prisma:generate`         | Regenerate the Prisma Client after schema edits|




Search API


The 3 search parameters:

make — partial, case-insensitive match on the car's make (e.g. Toyota)
city — exact, case-insensitive match on the listing's city
minPrice / maxPrice — a price range (both optional, either or both can be set)


   curl "http://localhost:3000/api/listings/search?make=Toyota"
