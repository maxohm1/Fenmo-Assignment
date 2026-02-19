# 💰 Fenmo Expense Tracker

A minimal full-stack personal expense tracker to record, review, and understand where your money is going.

**Live Demo**: [https://fenmo-assignment-opal.vercel.app](https://fenmo-assignment-opal.vercel.app)

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
git clone https://github.com/maxohm1/Fenmo-Assignment.git
cd Fenmo-Assignment
npm run install:all
```

### Running Locally

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173) concurrently.

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

### Running Tests

```bash
npm test
```

Runs the backend integration tests with Jest and Supertest.

---

## Architecture

```
fenmo/
├── api/                 # Vercel serverless functions
│   ├── expenses.js            # POST & GET /expenses
│   ├── health.js              # Health check
│   └── _store.js              # In-memory data store
├── server/              # Express.js backend (local dev)
│   ├── src/
│   │   ├── index.js           # App entry point
│   │   ├── db.js              # SQLite setup & schema
│   │   ├── routes/
│   │   │   └── expenses.js    # POST & GET /expenses
│   │   └── middleware/
│   │       ├── validate.js    # Input validation
│   │       └── errorHandler.js
│   └── __tests__/
│       └── expenses.test.js   # Integration tests
├── client/              # React + Vite frontend
│   └── src/
│       ├── App.jsx            # Main component
│       ├── api.js             # API client utilities
│       └── components/
│           ├── ExpenseForm.jsx
│           ├── ExpenseList.jsx
│           ├── FilterControls.jsx
│           └── CategorySummary.jsx
├── vercel.json          # Vercel deployment config
└── package.json         # Root scripts (concurrently)
```

---

## Key Design Decisions

### Money as Integer Paise

Amounts are stored as **integers in paise** (1 ₹ = 100 paise) in the database. This avoids floating-point rounding errors that are common when storing money as `FLOAT` or `REAL`. The API accepts and returns decimal values (e.g., `49.99`) and converts internally using `Math.round(amount * 100)`.

### Idempotent POST Endpoint

The `POST /expenses` endpoint supports an `Idempotency-Key` header. When the client submits a new expense, it generates a unique key (via `crypto.randomUUID()`). If the same key is sent again (due to a retry or page reload), the server returns the already-created expense instead of creating a duplicate.

This makes the system safe under real-world conditions where:
- Users might click "Submit" multiple times
- The browser refreshes after a slow POST
- Network errors trigger automatic retries

### SQLite with better-sqlite3

SQLite was chosen because:
- **Zero configuration** — no separate database server to manage
- **File-based persistence** — data survives server restarts
- **Real SQL** — supports proper queries, indexes, and constraints
- **Synchronous API** (via better-sqlite3) — simpler code, fewer race conditions

For a small personal finance tool, SQLite provides the right balance of simplicity and correctness. For larger team apps, this could be swapped for PostgreSQL by changing the data layer.

### Client-Side Double-Submit Prevention

The submit button is disabled while a request is in flight, and the idempotency key ensures that even if a request slips through, no duplicates are created. Error and success messages give clear feedback.

---

## Trade-offs Made Because of the Timebox

| Area | What I did | What I'd do with more time |
|------|-----------|---------------------------|
| **Auth** | No authentication | Add JWT-based user accounts |
| **Styling** | Clean but minimal CSS | A design system or TailwindCSS for richer UI |
| **Editing/Deleting** | Not implemented | PUT/DELETE endpoints and inline editing |
| **Deployment** | Vercel (serverless + in-memory store) | Add a hosted database (Vercel Postgres, Turso) for persistent storage |
| **Validation** | Basic checks | Schema validation with Zod or Joi |
| **Testing** | Backend integration tests | Add frontend component tests with React Testing Library |
| **Pagination** | None | Paginate GET /expenses for large datasets |

---

## What I Intentionally Did Not Do

- **No ORM** — For a single table, raw SQL via better-sqlite3 is simpler and more transparent than adding Prisma or Knex.
- **No TypeScript** — While I'd use it in production, plain JavaScript reduces setup friction for a small assignment.
- **No external validation library** — A few manual checks are sufficient for 4 fields; adding Joi/Zod would be overkill here.
- **No edit/delete** — The assignment scope was recording and reviewing expenses, not full CRUD.

---

## API Reference

### `POST /expenses`

Creates a new expense.

**Headers:**
- `Idempotency-Key` (optional): UUID to prevent duplicate creation

**Body:**
```json
{
  "amount": 249.50,
  "category": "Food",
  "description": "Dinner with friends",
  "date": "2025-02-19"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "amount": 249.50,
  "category": "Food",
  "description": "Dinner with friends",
  "date": "2025-02-19",
  "created_at": "2025-02-19T12:00:00.000Z"
}
```

### `GET /expenses`

Returns a list of expenses.

**Query Parameters:**
- `category` — filter by category (case-insensitive)
- `sort=date_desc` — sort by date, newest first

**Response (200):**
```json
[
  {
    "id": "uuid",
    "amount": 249.50,
    "category": "Food",
    "description": "Dinner with friends",
    "date": "2025-02-19",
    "created_at": "2025-02-19T12:00:00.000Z"
  }
]
```

---

## Submission

| Item | Link |
|------|------|
| **Live Application** | [https://fenmo-assignment-opal.vercel.app](https://fenmo-assignment-opal.vercel.app) |
| **GitHub Repository** | [https://github.com/maxohm1/Fenmo-Assignment](https://github.com/maxohm1/Fenmo-Assignment) |
| **Commit History** | [View Commits](https://github.com/maxohm1/Fenmo-Assignment/commits/master) |
| **Commit History Screenshot** | ![Commit History](commits.png) |
