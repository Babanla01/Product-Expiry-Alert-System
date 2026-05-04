# Backend Documentation
## Product Expiry Alert Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Database Connection](#database-connection)
6. [Data Models](#data-models)
   - [User Model](#user-model)
   - [Category Model](#category-model)
   - [Product Model](#product-model)
   - [Alert Model](#alert-model)
7. [Middleware](#middleware)
   - [auth.js — JWT Protection](#authjs--jwt-protection)
   - [isAdmin.js — Admin Guard](#isadminjs--admin-guard)
   - [canEditProduct.js — Ownership Guard](#caneditproductjs--ownership-guard)
8. [Authentication](#authentication)
   - [Login Flow](#login-flow)
   - [Change Password Flow](#change-password-flow)
9. [API Routes & Controllers](#api-routes--controllers)
   - [Auth Routes](#auth-routes)
   - [Staff Routes](#staff-routes)
   - [Category Routes](#category-routes)
   - [Product Routes](#product-routes)
   - [Alert Routes](#alert-routes)
   - [Dashboard Routes](#dashboard-routes)
   - [Export Routes](#export-routes)
10. [Background Job — Expiry Checker](#background-job--expiry-checker)
11. [Email Notifications](#email-notifications)
12. [Export System](#export-system)
13. [Seed Utilities](#seed-utilities)
14. [Server Entry Point](#server-entry-point)
15. [Error Handling Pattern](#error-handling-pattern)
16. [Security Measures](#security-measures)
17. [API Reference](#api-reference)

---

## Overview

The backend is a RESTful API server built with **Node.js** and **Express**. It serves as the single source of truth for the entire application. It handles user authentication, product and category management, automated expiry checking via a scheduled background job, alert generation, email notifications, and CSV/PDF export.

The server connects to a **MongoDB** database using **Mongoose** as the ODM (Object Document Mapper). All business logic lives in controllers. Routes define URL endpoints. Middleware enforces security between the request arriving and the controller executing.

---

## Technology Stack

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | HTTP server and routing framework |
| `mongoose` | ^8.0.3 | MongoDB ODM — schemas, models, queries |
| `bcryptjs` | ^2.4.3 | Password hashing and comparison |
| `jsonwebtoken` | ^9.0.2 | JWT generation and verification |
| `dotenv` | ^16.3.1 | Environment variable loading |
| `cors` | ^2.8.5 | Cross-origin request handling |
| `node-cron` | ^3.0.3 | Cron job scheduling |
| `nodemailer` | ^6.x | Email sending via SMTP |
| `nodemon` | ^3.0.2 | Dev server auto-restart (devDependency) |

---

## Project Structure

```
backend/
├── server.js                    # Entry point — starts Express, DB, cron
├── .env                         # Environment variables (never commit this)
├── package.json                 # Dependencies and npm scripts
│
├── config/
│   └── db.js                    # MongoDB connection logic
│
├── models/
│   ├── User.js                  # User schema (admin + staff)
│   ├── Category.js              # Category schema
│   ├── Product.js               # Product schema with expiry tracking
│   └── Alert.js                 # Alert schema for expiry notifications
│
├── middleware/
│   ├── auth.js                  # JWT verification — protects all private routes
│   ├── isAdmin.js               # Role check — blocks non-admin users
│   └── canEditProduct.js        # Ownership check — admin or product creator only
│
├── routes/
│   ├── auth.routes.js           # /api/auth/*
│   ├── staff.routes.js          # /api/staff/*
│   ├── category.routes.js       # /api/categories/*
│   ├── product.routes.js        # /api/products/*
│   ├── alert.routes.js          # /api/alerts/*
│   ├── dashboard.routes.js      # /api/dashboard
│   └── export.routes.js         # /api/export/*
│
├── controllers/
│   ├── auth.controller.js       # login, getMe, changePassword
│   ├── staff.controller.js      # createStaff, getAllStaff, deactivate, delete
│   ├── category.controller.js   # CRUD for categories
│   ├── product.controller.js    # CRUD for products
│   ├── alert.controller.js      # getAlerts, markAsRead
│   ├── dashboard.controller.js  # summary statistics
│   └── export.controller.js     # CSV and PDF export generation
│
├── jobs/
│   └── expiryChecker.js         # Daily cron — updates statuses, creates alerts, sends emails
│
└── utils/
    ├── seedAdmin.js             # One-time script to create the admin account
    ├── seedProducts.js          # Demo data script — 62 supermarket products
    └── mailer.js                # Nodemailer transporter and email templates
```

---

## Environment Configuration

**File:** `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expiry-alert-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=ExpiryAlert <your_gmail@gmail.com>
```

### Variable breakdown

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the Express server listens on. Defaults to 5000 if not set. |
| `MONGO_URI` | Yes | Full MongoDB connection string. Use `localhost` for local, Atlas URI for cloud. |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT tokens. Must be long and random in production. |
| `JWT_EXPIRES_IN` | Yes | Token expiry duration. `7d` means tokens expire after 7 days. |
| `EMAIL_HOST` | No | SMTP server hostname. `smtp.gmail.com` for Gmail. |
| `EMAIL_PORT` | No | SMTP port. `587` for TLS, `465` for SSL. |
| `EMAIL_USER` | No | Email address used to send alerts. |
| `EMAIL_PASS` | No | App password (not regular Gmail password — generate via Google Account → Security → App Passwords). |
| `EMAIL_FROM` | No | Display name and address shown in received emails. |

> If `EMAIL_USER` is not set, the system runs normally but skips sending emails. Email is entirely optional.

---

## Database Connection

**File:** `backend/config/db.js`

```js
const mongoose = require('mongoose')

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI)
  console.log(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB
```

This function is called once from `server.js` before the server starts listening. It returns a Promise, so `server.js` uses `.then()` to ensure the database is fully connected before the Express server and cron job initialise. If the connection fails, the error propagates and crashes the process — intentionally, because there is no value in running an API without a database.

---

## Data Models

### User Model

**File:** `backend/models/User.js`

The User model stores all accounts — both the admin and every staff member.

```
Users Collection
├── name         String, required, trimmed
├── email        String, required, unique, lowercase
├── password     String, required, min 6 chars (stored as bcrypt hash)
├── role         String, enum: ['admin', 'staff'], default: 'staff'
├── isActive     Boolean, default: true
├── createdAt    Date (auto, timestamps: true)
└── updatedAt    Date (auto, timestamps: true)
```

**Key behaviours:**

- **Pre-save hook:** Before any save, if the `password` field was modified, it is hashed using `bcrypt.hash(password, 10)`. Salt rounds of 10 means each hash takes ~100ms to compute — slow enough to deter brute force, fast enough for normal use. The raw password is never stored.
- **matchPassword method:** An instance method added to every User document. Takes a plain text password, runs `bcrypt.compare` against the stored hash, and returns a boolean. Used during login.
- **isActive flag:** When an admin deactivates a staff member, `isActive` is set to `false`. The auth middleware checks this flag — inactive users cannot log in or use the API even with a valid token.
- **role field:** Drives all permission logic throughout the system. Only two values are possible: `'admin'` and `'staff'`. The admin account is created by the seed script. Staff accounts are created only by the admin through the API.

---

### Category Model

**File:** `backend/models/Category.js`

Categories organise products into logical groups.

```
Categories Collection
├── name         String, required, unique, trimmed
├── description  String, optional, default: ''
├── createdBy    ObjectId, ref: 'User', required
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

**Key behaviours:**

- `name` is unique — you cannot have two categories with the same name.
- `createdBy` references the User who created the category. Only admins can create categories, so this will always point to an admin user document.
- When fetched via `getAllCategories`, the `createdBy` field is populated with the user's `name` field using Mongoose populate.

---

### Product Model

**File:** `backend/models/Product.js`

The central model of the system. Every product in inventory is stored here.

```
Products Collection
├── name         String, required, trimmed
├── quantity     Number, required, min: 0
├── category     ObjectId, ref: 'Category', required
├── expiryDate   Date, required
├── status       String, enum: ['valid', 'expiring_soon', 'expired'], default: 'valid'
├── addedBy      ObjectId, ref: 'User', required
├── supplier     String, optional, default: ''
├── description  String, optional, default: ''
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

**Key behaviours:**

- `status` is the most important field. It is initially set to `'valid'` when a product is created. It is updated in two places:
  1. By the **expiry checker cron job** every day at midnight
  2. By the **updateProduct controller** immediately when a product's `expiryDate` is edited

- `addedBy` records which user created the product. This is used by the `canEditProduct` middleware to enforce ownership-based edit permissions. It is always set automatically from `req.user._id` — the user cannot choose this value.

- `category` and `addedBy` are both populated when products are fetched, so the API returns the category name and the staff member's name alongside the product data.

- Products are sorted by `expiryDate` ascending (soonest expiry first) in all list queries.

---

### Alert Model

**File:** `backend/models/Alert.js`

Alerts are created automatically by the cron job — never manually by users.

```
Alerts Collection
├── product      ObjectId, ref: 'Product', required
├── type         String, enum: ['expiring_soon', 'expired'], required
├── message      String, required
├── isRead       Boolean, default: false
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

**Key behaviours:**

- One alert is created per product per day per type. The cron job checks for an existing alert with the same `product`, `type`, and a `createdAt` date within today before creating a new one — preventing duplicate alerts from building up if the server restarts multiple times in a day.
- `message` is a human-readable string like `"Full Cream Milk has expired"` or `"Greek Yoghurt is expiring in 3 day(s)"`.
- `isRead` is shared — when any user marks alerts as read, all alerts are marked. This is a single-organisation system so there is no per-user read state.
- When fetched, the `product` field is deeply populated: it fetches the product's `name`, `expiryDate`, and `category` (which itself is populated to get the category `name`).

---

## Middleware

Middleware functions sit between the incoming HTTP request and the controller function. They run in sequence. If any middleware calls `res.status(...).json(...)` instead of `next()`, the request stops there and the controller never runs.

### auth.js — JWT Protection

**File:** `backend/middleware/auth.js`

```
Request → auth.js → (next or 401)
```

**What it does:**
1. Reads the `Authorization` header from the incoming request
2. Checks it starts with `'Bearer '`
3. Extracts the token string after `'Bearer '`
4. Calls `jwt.verify(token, process.env.JWT_SECRET)` to decode and validate it
5. Uses the decoded `id` to find the user in the database with `User.findById(decoded.id).select('-password')`
6. Checks the user exists and `isActive` is `true`
7. Attaches the user document to `req.user`
8. Calls `next()` to pass to the next middleware or controller

**What triggers a 401:**
- No `Authorization` header present
- Header doesn't start with `'Bearer '`
- Token is expired, malformed, or signed with a different secret
- User no longer exists in the database
- User's `isActive` is `false` (deactivated by admin)

Every protected route in the application uses this middleware. It is applied at the router level with `router.use(protect)` so every route in that router is automatically protected.

---

### isAdmin.js — Admin Guard

**File:** `backend/middleware/isAdmin.js`

```
Request → auth.js → isAdmin.js → (next or 403)
```

**What it does:**
Checks `req.user.role === 'admin'`. If true, calls `next()`. If false, returns `403 Access denied, admin only`.

This middleware always runs **after** `auth.js` because it depends on `req.user` being set. It is applied to the entire staff routes router and to specific category routes (create, update, delete).

---

### canEditProduct.js — Ownership Guard

**File:** `backend/middleware/canEditProduct.js`

```
Request → auth.js → canEditProduct.js → (next or 403/404)
```

**What it does:**
1. Fetches the product by `req.params.id` from the database
2. If not found, returns `404 Product not found`
3. Checks if `req.user.role === 'admin'` OR `product.addedBy.toString() === req.user._id.toString()`
4. If either condition is true, attaches the product to `req.product` and calls `next()`
5. If neither condition is true, returns `403 Access denied`

The product is attached to `req.product` so the `updateProduct` and `deleteProduct` controllers don't need to fetch it again — avoiding a duplicate database query.

---

## Authentication

### Login Flow

**Endpoint:** `POST /api/auth/login`

```
Client sends { email, password }
     ↓
Validate both fields present
     ↓
User.findOne({ email })
     ↓
Check user exists AND isActive === true
     ↓
user.matchPassword(password) → bcrypt.compare
     ↓
If match: generate JWT with user._id as payload
     ↓
Return { _id, name, email, role, token }
```

The token payload contains only `{ id: user._id }`. The full user object is not embedded in the token — every request re-fetches the user from the database via the `auth` middleware. This means if a user is deactivated, their existing token immediately stops working on the next request.

**Token structure:**
```
Header:  { alg: "HS256", typ: "JWT" }
Payload: { id: "64abc...", iat: 1234567890, exp: 1235172690 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

---

### Change Password Flow

**Endpoint:** `PUT /api/auth/change-password`  
**Protected:** Yes (requires valid JWT)

```
Client sends { currentPassword, newPassword }
     ↓
Validate both fields present
     ↓
Validate newPassword.length >= 6
     ↓
User.findById(req.user._id)
     ↓
user.matchPassword(currentPassword) → verify current is correct
     ↓
Set user.password = newPassword
     ↓
user.save() → pre-save hook hashes the new password
     ↓
Return { message: 'Password changed successfully' }
```

The pre-save hook on the User model handles hashing automatically — the controller just assigns the plain text value and saves.

---

## API Routes & Controllers

### Auth Routes

**File:** `backend/routes/auth.routes.js`

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| POST | `/api/auth/login` | none | `login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | `protect` | `getMe` | Get current logged-in user |
| PUT | `/api/auth/change-password` | `protect` | `changePassword` | Update own password |

---

### Staff Routes

**File:** `backend/routes/staff.routes.js`

All routes in this file use `router.use(protect, isAdmin)` — every request must be from an authenticated admin.

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/staff` | `protect`, `isAdmin` | `getAllStaff` | List all staff members |
| POST | `/api/staff` | `protect`, `isAdmin` | `createStaff` | Create a new staff account |
| PATCH | `/api/staff/:id/deactivate` | `protect`, `isAdmin` | `deactivateStaff` | Set isActive to false |
| DELETE | `/api/staff/:id` | `protect`, `isAdmin` | `deleteStaff` | Permanently delete staff |

**createStaff logic:**
- Validates name, email, password are present
- Checks email is not already in use with `User.findOne({ email })`
- Creates user with `role: 'staff'` hardcoded — staff cannot self-assign admin role
- Returns the created user object without the password field

**deactivateStaff vs deleteStaff:**
- Deactivate sets `isActive: false` — the staff member still exists in the database, their product history is preserved, but they cannot log in
- Delete uses `staff.deleteOne()` — permanently removes the document. Products they added still exist but `addedBy` will no longer populate correctly (shows `—`)

---

### Category Routes

**File:** `backend/routes/category.routes.js`

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/categories` | `protect` | `getAllCategories` | All users can view categories |
| POST | `/api/categories` | `protect`, `isAdmin` | `createCategory` | Admin only — create category |
| PUT | `/api/categories/:id` | `protect`, `isAdmin` | `updateCategory` | Admin only — edit category |
| DELETE | `/api/categories/:id` | `protect`, `isAdmin` | `deleteCategory` | Admin only — delete category |

GET is available to all authenticated users because staff need to load categories when filling in the product form dropdown. All write operations (POST, PUT, DELETE) are admin-only.

**getAllCategories** uses `.populate('createdBy', 'name')` so the response includes the creator's name, and `.sort({ name: 1 })` so categories are always alphabetically ordered.

---

### Product Routes

**File:** `backend/routes/product.routes.js`

All routes use `router.use(protect)` — authentication required for all.

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/products` | `protect` | `getAllProducts` | All products, supports ?category and ?status filters |
| POST | `/api/products` | `protect` | `createProduct` | Any authenticated user can add a product |
| GET | `/api/products/:id` | `protect` | `getProductById` | Single product by ID |
| PUT | `/api/products/:id` | `protect`, `canEditProduct` | `updateProduct` | Admin or product owner only |
| DELETE | `/api/products/:id` | `protect`, `canEditProduct` | `deleteProduct` | Admin or product owner only |

**getAllProducts query parameters:**
- `?category=<ObjectId>` — filters by category ID
- `?status=valid|expiring_soon|expired` — filters by status
- Both can be combined: `?category=64abc&status=expired`

**createProduct:**
- Validates name, quantity, category, expiryDate are present
- Sets `addedBy: req.user._id` automatically
- After creation, populates `category` (returns name) and `addedBy` (returns name) before sending response

**updateProduct:**
- Receives `req.product` from `canEditProduct` middleware (already fetched, no second DB query)
- Only updates fields that are present in the request body — partial updates are supported
- If `expiryDate` is being updated, immediately recalculates the `status` field:
  ```
  daysLeft < 0    → status = 'expired'
  daysLeft <= 7   → status = 'expiring_soon'
  daysLeft > 7    → status = 'valid'
  ```
  This ensures the status is always accurate even before the next cron job run.

---

### Alert Routes

**File:** `backend/routes/alert.routes.js`

All routes use `router.use(protect)`.

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/alerts` | `protect` | `getAlerts` | All alerts, supports ?type and ?isRead filters |
| PATCH | `/api/alerts/mark-read` | `protect` | `markAsRead` | Mark all alerts as read |

**getAlerts query parameters:**
- `?type=expired|expiring_soon` — filter by alert type
- `?isRead=true|false` — filter by read status

**Alert population:** When fetched, the `product` reference is populated with `name`, `expiryDate`, and `category`. The `category` inside the product is also populated to get its `name`. This nested population gives the frontend everything it needs to display rich alert cards without additional requests.

---

### Dashboard Routes

**File:** `backend/routes/dashboard.routes.js`

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/dashboard` | `protect` | `getDashboardStats` | Summary statistics |

**getDashboardStats** runs five `countDocuments` queries in parallel using `Promise.all`:
```js
[total, valid, expiringSoon, expired, unreadAlerts]
```
Using `Promise.all` means all five queries run simultaneously rather than sequentially — much faster than awaiting them one by one.

**Response shape:**
```json
{
  "total": 62,
  "valid": 31,
  "expiringSoon": 19,
  "expired": 12,
  "unreadAlerts": 8
}
```

---

### Export Routes

**File:** `backend/routes/export.routes.js`

All routes use `router.use(protect)`.

| Method | Path | Middleware | Controller | Description |
|---|---|---|---|---|
| GET | `/api/export/products/csv` | `protect` | `exportProductsCSV` | Download products as CSV |
| GET | `/api/export/products/pdf` | `protect` | `exportProductsPDF` | Download products as HTML report |
| GET | `/api/export/alerts/csv` | `protect` | `exportAlertsCSV` | Download alerts as CSV |

**CSV export:**
- Builds a comma-separated string in memory using a helper function `toCSV(headers, rows)`
- Values containing commas, quotes, or newlines are wrapped in double quotes and internal quotes are escaped
- Sets response headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename="products.csv"` to trigger a file download in the browser

**PDF export (HTML report):**
- Generates a complete standalone HTML file with embedded CSS styles
- Includes summary statistics (total, valid, expiring, expired counts) at the top
- Includes a full product table with status badges
- Sets `Content-Disposition: attachment; filename="products-report.html"` so it downloads rather than opens in browser
- The user can open the downloaded HTML file in any browser to view or print it

**Query parameters on export:**
- `/api/export/products/csv?status=expired` — exports only expired products
- `/api/export/products/csv?category=<id>` — exports only a specific category
- Filters match the product list filters so exports always reflect what the user is viewing

---

## Background Job — Expiry Checker

**File:** `backend/jobs/expiryChecker.js`

This is the intelligence layer of the system. It runs automatically every day at midnight without any user interaction.

### How it works

```
Server starts
     ↓
expiryChecker() is called
     ↓
runExpiryCheck() runs immediately (first scan)
     ↓
node-cron schedules runExpiryCheck() at '0 0 * * *' (midnight daily)
     ↓
Every midnight: runExpiryCheck() fires again
```

### runExpiryCheck() step by step

```
1. Fetch all products from database with category populated
     ↓
2. For each product:
   a. Calculate daysLeft = ceil((expiryDate - now) / 86400000)
   b. Determine newStatus:
      - daysLeft < 0   → 'expired'
      - daysLeft <= 7  → 'expiring_soon'
      - else           → 'valid'
   c. If product.status !== newStatus:
      - Update and save the product
     ↓
3. If alertType is set (expired or expiring_soon):
   a. Check for existing alert today (createdAt >= today 00:00)
   b. If no existing alert:
      - Create Alert document with message and type
      - Add product data to newlyExpired or newlyExpiringSoon arrays
     ↓
4. After all products processed:
   a. If there are new alerts:
      - Fetch all active users' email addresses
      - Send email for expired products (if any)
      - Send email for expiring_soon products (if any)
```

### Duplicate prevention

The cron job uses this query to prevent creating duplicate alerts on the same day:
```js
const existingAlert = await Alert.findOne({
  product: product._id,
  type: alertType,
  createdAt: { $gte: todayStart },
})
```
`todayStart` is set to midnight of the current day (`setHours(0,0,0,0)`). If an alert already exists for this product with this type today, no new alert is created.

### Cron schedule

`'0 0 * * *'` means:
```
0    → minute 0
0    → hour 0 (midnight)
*    → every day of month
*    → every month
*    → every day of week
```

---

## Email Notifications

**File:** `backend/utils/mailer.js`

Nodemailer is configured using environment variables. The `transporter` object is created once and reused for all emails.

### sendExpiryAlertEmail({ to, subject, products, type })

Generates a fully styled HTML email with:
- Dark header with the ExpiryAlert logo
- Coloured alert banner (red for expired, amber for expiring soon)
- Product table showing name, category, quantity, expiry date, and status badge
- "View All Alerts" call-to-action button linking to the frontend alerts page
- Footer with year

The `to` field accepts a comma-separated list of email addresses — all active users receive the same email in a single send call.

**Error handling:** Email errors are caught with `.catch()` and logged to the console. An email failure never crashes the cron job — the product status updates and alert document creation happen regardless of whether the email sends successfully.

---

## Export System

**File:** `backend/controllers/export.controller.js`

### CSV Generation

The `toCSV(headers, rows)` helper function:
1. Takes an array of header strings and an array of row arrays
2. Joins headers with commas for the first line
3. For each row, processes each cell:
   - Converts to string
   - If the value contains commas, quotes, or newlines: wraps in double quotes and escapes internal quotes as `""`
4. Joins all rows with newlines
5. Returns the complete CSV string

### PDF Generation (HTML Report)

The PDF export actually generates a styled HTML file rather than a true PDF. This approach:
- Requires no additional dependencies (no puppeteer, no wkhtmltopdf)
- Works on any OS without binary installations
- Produces a report that can be printed to PDF from any browser using Ctrl+P → Save as PDF
- The HTML includes all styles inline so it renders correctly when opened as a standalone file

---

## Seed Utilities

### seedAdmin.js

**File:** `backend/utils/seedAdmin.js`  
**Run with:** `npm run seed`

- Connects to MongoDB
- Checks if any admin user already exists
- If no admin: creates one with email `admin@expiryalert.com` and password `admin123456`
- Exits the process after completion

This script is designed to be safe to run multiple times — running it when an admin already exists just prints a message and exits without creating duplicates.

### seedProducts.js

**File:** `backend/utils/seedProducts.js`  
**Run with:** `npm run seed:products`

- Connects to MongoDB
- Finds the admin user (requires `npm run seed` to have been run first)
- Deletes all existing products and categories (clean slate)
- Creates 10 categories
- Creates 62 products spread across all categories with realistic data
- Calculates and sets the correct `status` for each product based on its `expiryDate`
- Prints a summary showing counts per status

**Product distribution:**
- ~31 valid (expiry dates ranging from 8 days to 900 days in future)
- ~19 expiring soon (expiry dates within 7 days)
- ~12 expired (expiry dates in the past, ranging from -1 to -15 days)

---

## Server Entry Point

**File:** `backend/server.js`

```js
connectDB().then(() => {
  app.listen(PORT, ...)
  expiryChecker()
})
```

The critical design decision here is that `connectDB()` must resolve before the server starts listening or the cron job starts. This is why `.then()` is used — it guarantees:

1. MongoDB connection is established
2. Express server begins accepting requests
3. Expiry checker immediately runs its first scan and schedules future scans

If database connection is established in a `.then()` callback, the server and cron job will never start if the database is unreachable — rather than starting and silently failing on every request.

---

## Error Handling Pattern

Every controller wraps its logic in a `try/catch` block:

```js
const someController = async (req, res) => {
  try {
    // ... logic
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
```

**Response shapes:**

| Scenario | Status | Body |
|---|---|---|
| Success | 200 or 201 | The data object or array |
| Validation fail | 400 | `{ message: 'descriptive error' }` |
| Unauthenticated | 401 | `{ message: 'Not authorised...' }` |
| Forbidden | 403 | `{ message: 'Access denied...' }` |
| Not found | 404 | `{ message: 'Resource not found' }` |
| Server error | 500 | `{ message: 'Server error', error: '...' }` |

---

## Security Measures

| Measure | Implementation | Purpose |
|---|---|---|
| Password hashing | `bcryptjs` with 10 salt rounds | Raw passwords never stored |
| JWT authentication | `jsonwebtoken`, 7 day expiry | Stateless session management |
| Role-based access | `isAdmin` middleware | Prevents staff accessing admin routes |
| Ownership enforcement | `canEditProduct` middleware | Prevents staff editing others' products |
| Active status check | `auth` middleware checks `isActive` | Deactivated users instantly lose access |
| Input validation | Manual checks in controllers | Prevents empty or malformed data reaching DB |
| CORS | `cors` middleware | Controls which origins can call the API |

---

## API Reference

### Complete Endpoint List

```
POST   /api/auth/login
GET    /api/auth/me                          [protected]
PUT    /api/auth/change-password             [protected]

GET    /api/staff                            [admin only]
POST   /api/staff                            [admin only]
PATCH  /api/staff/:id/deactivate             [admin only]
DELETE /api/staff/:id                        [admin only]

GET    /api/categories                       [protected]
POST   /api/categories                       [admin only]
PUT    /api/categories/:id                   [admin only]
DELETE /api/categories/:id                   [admin only]

GET    /api/products                         [protected]
POST   /api/products                         [protected]
GET    /api/products/:id                     [protected]
PUT    /api/products/:id                     [admin or owner]
DELETE /api/products/:id                     [admin or owner]

GET    /api/alerts                           [protected]
PATCH  /api/alerts/mark-read                 [protected]

GET    /api/dashboard                        [protected]

GET    /api/export/products/csv              [protected]
GET    /api/export/products/pdf              [protected]
GET    /api/export/alerts/csv                [protected]
```