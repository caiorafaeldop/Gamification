# Connecta CI

Connecta CI is a gamified team-management system designed to boost engagement and productivity.

## Project Structure

This repository is organized into two main parts:

-   **[Backend](backend/README.md)**: REST API built with Node.js, Express, and PostgreSQL (Prisma). Handles logic, database, and authentication.
-   **[Frontend](frontend/README.md)**: Single-page application built with React and Vite. Provides the user interface for the gamification platform.

## Automated Setup (Recommended)

For convenience, you can use the provided Bash scripts to set up and run the project (requires Git Bash, WSL, or Linux/Mac).

1.  **Setup**: Installs dependencies, sets up `.env`, runs migrations and seeds.
    ```bash
    ./setup.sh
    ```

2.  **Run**: Starts both backend and frontend servers in development mode.
    ```bash
    ./dev.sh
    ```

## Manual Quick Start

If you prefer to run commands manually or are on a Windows command prompt without Bash:

### 1. Start the Backend

 Navigate to the `backend` folder and follow the [backend instructions](backend/README.md) to set up the database and start the server.

```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend

Open a new terminal, navigate to the `frontend` folder, and follow the [frontend instructions](frontend/README.md) to launch the UI.

```bash
cd frontend
npm install
npm run dev
```

## Documentation

For detailed installation, configuration, and API usage, please refer to the `README.md` files in each subdirectory.
