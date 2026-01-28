# FAMENE Backend

Backend for FAMENE, a gamified study system.

## Prerequisites

-   Use **Node.js** (version compatible with dependencies, e.g., v20).
-   Use **PostgreSQL** for the database.

## Installation & Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Variables:**

    Copy the example environment file and configure it:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your database credentials and other settings:
    -   `DATABASE_URL`: Connection string for PostgreSQL.
    -   `JWT_SECRET`: Secret key for JWT.
    -   `PORT`: Port to run the server (default 3000).
    -   `CORS_ORIGIN`: URL of the frontend (e.g., http://localhost:5173).

3.  **Start Database (Docker Option):**

    If you don't have a local PostgreSQL instance, you can run the database using Docker Compose:

    ```bash
    docker-compose up -d
    ```

    Ensure your `.env` settings match the `docker-compose.yml` credentials (default: user/password).

4.  **Database Setup:**

    Run migrations to set up the database schema:

    ```bash
    npm run prisma:migrate
    ```

    Seed the database with initial data:

    ```bash
    npm run prisma:seed
    ```

## Running the Application

### Development Mode

To run the server in development mode with hot-reload:

```bash
npm run dev
```

### Production

To build and start the application for production:

1.  Build the project:
    ```bash
    npm run build
    ```

2.  Start the server:
    ```bash
    npm start
    ```

## Testing

Run unit/integration tests using Vitest:

```bash
npm test
```
