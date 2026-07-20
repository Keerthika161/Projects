# Temple Management System

A modern, professional, and responsive full-stack platform designed to facilitate queue-free pilgrimages. It includes dedicated portals for devotees (to schedule darshans and stays) and admins (to manage crowd counts, accommodations, and report analytics).

Features a premium temple-inspired design using a soft saffron, divine cream, and gold palette with glassmorphism overlays and real-time chart visuals.

---

## Technical Stack
- **Frontend:** React.js, Vite, Tailwind CSS v3, Recharts, Axios, Lucide React
- **Backend:** Node.js, Express.js, JWT, Bcryptjs
- **Database:** Supabase (PostgreSQL) / local SQLite / MySQL (configurable)

---

## Quick Setup Instructions

### 1. Install Dependencies

You will need to install npm packages in both the `backend` and `frontend` folders. Open your terminal in the root workspace and run:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd ../frontend
npm install
```

---

### 2. Database Configuration

The backend features a **dual-mode database manager** which is configured via `backend/.env`.

#### Option A: Local SQLite (Recommended for Immediate Run)
By default, the server is pre-configured with `DB_MODE=local`.
- No setup is required. 
- On first start, the system will automatically create `backend/db/temple.sqlite` and seed it with hotels, rooms, poojas, visitors, and login credentials.

#### Option B: Supabase (PostgreSQL)
To run the database on your Supabase remote instance:
1. Open the [Supabase SQL Editor](https://database.new/) on your project page.
2. Copy the contents of the `supabase_setup.sql` file located in your root workspace, paste it into the editor, and click **Run**. This initializes the schemas and data.
3. Open `backend/.env` and update the database mode and settings:
   ```env
   DB_MODE=supabase
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=sb_publishable_NtPtNMLfukSZO3gB4y30Cg_PONufs3M
   ```

---

### 3. Start the Servers

Start the servers concurrently to let the React client communicate with the Express API.

**Start the Backend Server (Port 5000):**
```bash
cd backend
npm run start
```
*(Or `npm run dev` if you want to run it with hot-reload node-mon)*

**Start the Frontend Server (Port 3000):**
Open a new terminal window or tab and run:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Pre-Seeded Auth Credentials

You can log in to the portals immediately using the pre-seeded users:

| Portal | Email | Password |
| :--- | :--- | :--- |
| **Devotee Portal** | `user@temple.com` | `user123` |
| **Admin Portal** | `admin@temple.com` | `admin123` |

---

## Folder Layout Structure
```
/workspace
├── backend/
│   ├── config/          # Database adapters (db.js)
│   ├── controllers/     # API Controllers (auth, bookings, hotels, prasadam, poojas, reports, visitors)
│   ├── middleware/      # Auth JWT guards
│   ├── routes/          # API route bindings
│   ├── db/              # SQLite local DB container
│   ├── server.js        # Express app main file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout and Shared widgets
│   │   ├── context/     # Global state (Auth, Notifications)
│   │   ├── pages/       # Portal dashboards and booking wizard
│   │   ├── utils/       # Axios API client setup
│   │   ├── App.jsx      # Navigation router config
│   │   └── index.css    # Tailwind bases & glassmorphism custom classes
│   ├── package.json
│   ├── vite.config.js   # Vite config & port 5000 API proxying
│   └── tailwind.config.js
│
├── supabase_setup.sql   # Postgres schema initialization script
└── README.md            # Setup manual
```
