# 🚗 AutoVault — Car Dealership Platform

A full-stack vehicle inventory and dealership management system built with **React + TypeScript** on the frontend and **Node.js + Express + PostgreSQL (Prisma)** on the backend. Supports role-based access control, Google OAuth, and a full admin dashboard for inventory management.

---
<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/322d1e3a-c801-40a8-8851-ccdc7752d264" />

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | [dhruvcardealership.netlify.app](https://dhruvcardealership.netlify.app) |
| Backend API | Deployed on Railway |

### 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `realdhruvozarkar@gmail.com` | `Pass@123` |

> Admin accounts have full access to create, update, restock, and delete vehicles. Regular users can browse and purchase.

---

## ✨ Features

### 👤 User-Facing
- Browse and search the full vehicle inventory
- Filter vehicles by make, model, category, and price
- Purchase vehicles (authenticated users)
- Register / Login with email & password
- **Google OAuth** sign-in support

<img width="auto" height="500" alt="image" src="https://github.com/user-attachments/assets/8d5c356f-a968-4ba8-8a2e-fee71d0aefde" />
<img width="auto" height="500" alt="image" src="https://github.com/user-attachments/assets/cc8e27c9-4fe5-4c00-b0a5-8f4b9654eb65" />


### 🛠️ Admin Dashboard
- Add new vehicles to inventory
- Edit existing vehicle details
- Restock vehicles with additional quantity
- Delete vehicles from inventory
- View live stats (total listings, stock counts)

### 🔐 Auth & Security
- JWT-based authentication
- Role-based access control (`USER` / `ADMIN`)
- Route guards on both frontend and backend
- Zod schema validation on all API inputs

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | PostgreSQL via Prisma ORM (Prisma v7) |
| **Auth** | JWT, bcrypt, Google OAuth (`@react-oauth/google`) |
| **Validation** | Zod |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Deployment** | Netlify (frontend), Railway (backend), Neon (Postgres) |

---

## 📁 Project Structure

```
Car-Dealership/
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/        # Navbar, VehicleCard, SearchFilters, StatsBar
│   │   ├── context/           # Auth context (JWT state management)
│   │   ├── hooks/             # useVehicles (data fetching & mutations)
│   │   ├── pages/             # Home, Login, Register, AdminDashboard
│   │   ├── utils/             # Axios API instance
│   │   └── types.ts           # Shared TypeScript types
│   └── package.json
│
└── server/                    # Express REST API
    ├── prisma/
    │   ├── schema.prisma      # User + Vehicle models
    │   └── migrations/        # SQL migration history
    ├── src/
    │   ├── config/            # env.ts — typed environment variables
    │   ├── controllers/       # auth.controller.ts, vehicle.controller.ts
    │   ├── middleware/         # auth.middleware.ts, role.middleware.ts
    │   ├── routes/            # auth.routes.ts, vehicle.routes.ts
    │   ├── services/          # auth.service.ts, vehicle.service.ts
    │   ├── utils/             # jwt.ts
    │   ├── validators/        # Zod schemas for all inputs
    │   └── app.ts             # Express entry point
    └── package.json
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)   // USER | ADMIN
  vehicles  Vehicle[]
}

model Vehicle {
  id        String   @id @default(uuid())
  make      String
  model     String
  category  String
  price     Decimal
  quantity  Int
  addedBy   User?
}
```
<img width="500" height="auto" alt="image" src="https://github.com/user-attachments/assets/6dcd03c0-f2e7-436f-add4-b67bc1ef5cbe" />
<img width="500" height="auto" alt="image" src="https://github.com/user-attachments/assets/86b3d28b-5341-4103-b6f0-d866b425bea1" />


---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | — | Register a new user |
| `POST` | `/login` | — | Login with email & password |
| `POST` | `/google` | — | Login / register via Google OAuth |

### Vehicles — `/api/vehicles`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | — | — | List all vehicles |
| `GET` | `/search` | — | — | Search vehicles by query params |
| `GET` | `/:id` | — | — | Get single vehicle by ID |
| `POST` | `/` | ✅ | ADMIN | Add a new vehicle |
| `PUT` | `/:id` | ✅ | ADMIN | Update vehicle details |
| `DELETE` | `/:id` | ✅ | ADMIN | Delete a vehicle |
| `POST` | `/:id/purchase` | ✅ | USER | Purchase a vehicle (decrements stock) |
| `POST` | `/:id/restock` | ✅ | ADMIN | Restock vehicle quantity |

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A PostgreSQL database (local or [Neon](https://neon.tech) free tier)

---

### 1. Clone the repo

```bash
git clone https://github.com/DhruvOz11/Car-Dealership.git
cd Car-Dealership
```

---

### 2. Backend Setup

```bash
cd server
pnpm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/autovault
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id
```

Run migrations and start the dev server:

```bash
pnpm prisma migrate dev
pnpm dev
```

Backend runs at `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

### 4. Create an Admin User

Register normally via the UI, then promote yourself in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

You can run this in your Neon SQL editor, psql, or any Postgres client.

---

## ☁️ Deployment

See [`frontend/DEPLOYMENT.md`](./frontend/DEPLOYMENT.md) for a full step-by-step guide covering:

- **Database** — Neon (free-tier Postgres)
- **Backend** — Railway (auto-deploys from GitHub)
- **Frontend** — Netlify (with React Router redirect fix)
- **Google OAuth** — setup and authorized origins

**Quick deploy order:**  
Neon → Railway (backend) → Netlify (frontend) → update CORS + OAuth origins → redeploy backend

---

## 👨‍💻 Author

**Dhruv Ozarkar**  
Full Stack Engineer • MCA @ LDCE Ahmedabad

https://linkedin.com/in/dhruv-ozarker
https://github.com/DhruvOz11

---
