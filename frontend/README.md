# Connecta CI Frontend

Frontend for Connecta CI, a gamified team-management system.

## Prerequisites

-   **Node.js**: Ensure you have Node.js installed.

## Installation & Setup

1.  **Install dependencies:**

    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Environment Variables:**

    Check `.env` (or create `.env.local` if needed) to configure the API URL:
    -   `VITE_BASE_URL`: URL of the backend API (default: `http://localhost:3000/api/v1`).

## Running the Application

### Development Mode

To run the frontend in development mode:

```bash
npm run dev
```

The app will typically be available at `http://localhost:5173`.

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Technologies

-   React
-   Vite
-   TypeScript
-   TailwindCSS (check `tailwind.config.js` if available)
