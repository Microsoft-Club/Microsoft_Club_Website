# Microsoft Club GIKI Website

The official full-stack web platform for Microsoft Club GIKI, serving as a centralized portal for event management, member directories, project showcases, podcasts, and blog publishing.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer) & npm
- A PostgreSQL database instance (e.g., Supabase, Neon, or local PostgreSQL)

---

### 1. Backend Setup

1. **Navigate to the backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend/` folder (refer to `.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@host:5432/postgres?sslmode=require"
   DIRECT_URL="postgresql://user:password@host:5432/postgres?sslmode=require"
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="your_admin_password"
   ```

3. **Generate Prisma client and push schema to database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **(Optional) Seed the initial admin user:**
   ```bash
   npm run seed:admin
   ```

5. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   > Backend runs on `http://localhost:5000`.

For a deployment/startup environment, use `npm start`. It synchronizes the
Prisma schema with the configured PostgreSQL database before starting the API,
so additive schema changes such as the inductions waiting list are available
without a separate manual `db push` step.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   In `frontend/.env`, set the backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   > Frontend runs on `http://localhost:5173`.

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Prisma)
