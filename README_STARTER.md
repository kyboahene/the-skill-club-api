# NestJS Starter Kit

A robust NestJS starter kit with authentication, Prisma/Postgres, Docker, Swagger documentation, and a reusable serializer interceptor.

## Features
- JWT authentication (Passport.js)
- Prisma ORM with Postgres
- Docker & docker-compose for local development
- Swagger API documentation
- Global validation and versioning
- Reusable response serialization interceptor

## Getting Started

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```

### 3. Database Setup
- Start Postgres with Docker:
  ```bash
  docker-compose up -d
  ```
- Run Prisma migrations:
  ```bash
  npx prisma migrate dev --name init
  npx prisma db seed
  ```

### 4. Start the App
```bash
npm run start:dev
```

- API docs: [http://localhost:3000/docs](http://localhost:3000/docs)

## Useful Scripts
- `npm run start:dev` – Start in watch mode
- `npx prisma migrate dev` – Run migrations
- `npx prisma studio` – Open Prisma Studio

## Serializer Interceptor
Use the `Serialize` decorator to transform responses:
```typescript
@Serialize(UserDto)
@Get('me')
getProfile() { ... }
```

---

This kit is ready for production hardening and feature extension.
