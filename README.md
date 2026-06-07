# ⚡ LeadFlow CRM — Lead Management System

A full-stack CRM application for managing sales leads with a React frontend and Node.js + Express + MongoDB backend.

---

## 🗂 Project Structure

```
crm-lead-manager/
├── backend/              # Node.js + Express + MongoDB API
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── Lead.js       # Mongoose schema
│   ├── routes/
│   │   └── leads.js      # All lead CRUD + stats endpoints
│   ├── .env.example
│   ├── package.json
│   └── server.js         # Express app entry point
│
└── frontend/             # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── LeadForm.jsx       # Add/Edit modal form
    │   │   ├── StatsDashboard.jsx # Analytics/stats panel
    │   │   └── StatusBadge.jsx    # Colored status pill
    │   ├── pages/
    │   │   └── Dashboard.jsx      # Main leads table + filters
    │   ├── utils/
    │   │   ├── api.js             # Axios instance + API calls
    │   │   └── constants.js       # Status configs, options
    │   ├── App.jsx
    │   ├── index.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| Git | Any | https://git-scm.com |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/crm-lead-manager.git
cd crm-lead-manager
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_leads
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> **MongoDB Atlas (Cloud):** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/crm_leads`

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

✅ Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

✅ Frontend runs at: `http://localhost:3000`

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Leads Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/leads` | Get all leads (paginated, filterable) |
| `GET` | `/leads/stats` | Get lead statistics |
| `GET` | `/leads/:id` | Get single lead |
| `POST` | `/leads` | Create new lead |
| `PUT` | `/leads/:id` | Update lead (all fields) |
| `PATCH` | `/leads/:id/status` | Update status only |
| `DELETE` | `/leads/:id` | Delete lead |

### Query Parameters for `GET /leads`

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | string | `?search=john` | Search name, email, company |
| `status` | string | `?status=New` | Filter by status |
| `sortBy` | string | `?sortBy=createdAt` | Sort field |
| `sortOrder` | string | `?sortOrder=desc` | `asc` or `desc` |
| `page` | number | `?page=2` | Page number |
| `limit` | number | `?limit=10` | Results per page |

### Lead Status Values
`New` · `Contacted` · `Qualified` · `Converted` · `Lost`

### Lead Source Values
`Website` · `Referral` · `Social Media` · `Cold Call` · `Email Campaign` · `Other`

---

## ✨ Features

- **Dashboard** with live lead statistics (total, monthly, conversion rate, pipeline)
- **Add / Edit Leads** via a clean modal form with validation
- **Delete** with confirmation dialog
- **Inline Status Update** — change status directly from the table row
- **Search** by name, email, or company (debounced)
- **Filter** by status
- **Sort** by any column (name, company, status, date)
- **Pagination** with page navigation
- **Responsive design** works on mobile, tablet, and desktop
- **Toast notifications** for all actions
- **Input validation** on frontend and backend

---

## 🧪 API Testing (curl examples)

```bash
# Health check
curl http://localhost:5000/api/health

# Create a lead
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@techcorp.in","phone":"+91 98765 43210","company":"TechCorp India","status":"New","source":"Website"}'

# Get all leads
curl "http://localhost:5000/api/leads?page=1&limit=10"

# Search leads
curl "http://localhost:5000/api/leads?search=priya"

# Get stats
curl http://localhost:5000/api/leads/stats

# Update status
curl -X PATCH http://localhost:5000/api/leads/LEAD_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Contacted"}'

# Delete a lead
curl -X DELETE http://localhost:5000/api/leads/LEAD_ID
```

---

## 🚢 Deployment

### Backend → Railway / Render / Fly.io

1. Push code to GitHub
2. Connect repo to Railway or Render
3. Set environment variables:
   - `MONGODB_URI` = Atlas connection string
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your frontend URL
4. Deploy — it auto-detects `npm start`

### Frontend → Vercel / Netlify

1. Push frontend folder to GitHub (or use root repo)
2. Connect to Vercel/Netlify
3. Set environment variable: `REACT_APP_API_URL=https://your-backend.railway.app/api`
4. Build command: `npm run build`
5. Output directory: `build`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios, react-hot-toast |
| Backend | Node.js, Express.js, Morgan |
| Database | MongoDB with Mongoose ODM |
| Validation | express-validator (backend), custom (frontend) |
| Styling | Inline CSS / CSS-in-JS (no external CSS framework) |

---

## 📄 License

MIT — free to use and modify.
