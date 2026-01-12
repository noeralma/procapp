# Full Stack TypeScript Template (PERN Stack)

This is a production-ready template for building full-stack applications using TypeScript end-to-end.

## Tech Stack

### Frontend
- **Framework:** React (via Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State/Routing:** (Standard React hooks / React Router ready)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma

## Project Structure

```
├── client/         # Frontend React application
├── server/         # Backend Express application
└── package.json    # Root scripts for concurrent execution
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### Installation

1.  **Clone the repository** (if applicable)

2.  **Install dependencies** (Root, Client, and Server):
    ```bash
    npm run install:all
    ```

3.  **Environment Setup**:
    - Go to `server/.env` and configure your `DATABASE_URL`.
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    ```

4.  **Database Migration** (in `server/` directory):
    ```bash
    cd server
    npx prisma migrate dev --name init
    ```

### Running the App

To run both client and server concurrently in development mode:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## Available Scripts (Root)

- `npm run dev`: Starts both server and client in development mode.
- `npm run install:all`: Installs dependencies for root, server, and client.
- `npm run build`: Builds both server and client.
- `npm run lint`: Lints both server and client.

## Directory Details

### Client (`/client`)
Built with Vite + React + TypeScript + Tailwind CSS.
- `src/App.tsx`: Main application component.
- `src/index.css`: Tailwind directives and global styles.

### Server (`/server`)
Built with Node.js + Express + TypeScript + Prisma.
- `src/app.ts`: Express app setup (middleware, CORS, etc.).
- `src/routes/`: API routes definitions.
- `src/controllers/`: Request handlers.
- `src/utils/prisma.ts`: Prisma client instance.
- `prisma/schema.prisma`: Database schema definition.

## License
ISC
