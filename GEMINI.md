# Project Overview

This is a Next.js SaaS starter template for building a job board application. It includes features like user authentication, job postings, and a dashboard for recruiters and job seekers. The application uses a PostgreSQL database with Drizzle ORM for database management.

**Key Technologies:**

*   **Framework:** Next.js
*   **Database:** PostgreSQL
*   **ORM:** Drizzle
*   **Payments:** Stripe
*   **UI Library:** shadcn/ui
*   **Language:** TypeScript

**Architecture:**

The application is a full-stack Next.js application. The frontend is built with React and shadcn/ui components. The backend is built with Next.js API routes and server actions. The database is managed with Drizzle ORM, and the schema is defined in `lib/db/schema.ts`.

# Building and Running

**Installation:**

```bash
pnpm install
```

**Database Setup:**

1.  Create a `.env` file:
    ```bash
    pnpm db:setup
    ```
2.  Run database migrations:
    ```bash
    pnpm db:migrate
    ```
3.  Seed the database:
    ```bash
    pnpm db:seed
    ```

**Running the Application:**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

**Testing:**

This project uses Jest and React Testing Library for testing. You can run the tests with the following command:

```bash
pnpm test
```

# Development Conventions

*   **Coding Style:** The project uses TypeScript and follows standard Next.js and React conventions.
*   **Database:** Drizzle ORM is used for all database interactions. The database schema is defined in `lib/db/schema.ts`.
*   **Authentication:** Authentication is handled with JWTs stored in cookies.
*   **API:** The backend API is built with Next.js API routes and server actions.
