# System Documentation
## Product Expiry Alert Management System — Complete Reference

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Technology Decisions](#technology-decisions)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Complete Feature List](#complete-feature-list)
7. [Data Architecture](#data-architecture)
   - [Entity Relationship](#entity-relationship)
   - [Collection Schemas](#collection-schemas)
   - [Data Relationships](#data-relationships)
8. [Request Lifecycle](#request-lifecycle)
   - [Authentication Request](#authentication-request)
   - [Protected API Request](#protected-api-request)
   - [Admin-Only Request](#admin-only-request)
9. [Expiry Logic — Core Algorithm](#expiry-logic--core-algorithm)
10. [Alert System — End to End](#alert-system--end-to-end)
11. [Email Notification System](#email-notification-system)
12. [Export System](#export-system)
13. [Frontend Architecture](#frontend-architecture)
14. [Backend Architecture](#backend-architecture)
15. [Security Architecture](#security-architecture)
16. [API Complete Reference](#api-complete-reference)
17. [Environment Setup](#environment-setup)
18. [Running the System](#running-the-system)
19. [Database Seeding](#database-seeding)
20. [File Structure — Complete Tree](#file-structure--complete-tree)
21. [How Each Feature Works](#how-each-feature-works)
22. [Glossary](#glossary)

---

## System Overview

The **Product Expiry Alert Management System** is a full-stack web application that helps a single organisation track, monitor, and manage product expiry dates across their entire inventory. It automates the detection of expired and near-expiry products and delivers timely alerts to all members of the organisation.

The system replaces manual spreadsheet-based tracking with a centralised, real-time, role-aware digital platform accessible from any device — desktop, tablet, or mobile.

**Core value proposition:**
- Eliminates selling or using expired products
- Reduces financial losses from unnoticed stock expiry
- Removes manual daily checking from staff workflows
- Provides management with instant inventory health overview
- Creates an audit trail of who added each product and when

---

## Problem Statement

Without this system, a typical organisation faces:

| Problem | Impact |
|---|---|
| Products expire unnoticed | Financial loss, safety risk, legal liability |
| Manual spreadsheet tracking | Time-consuming, error-prone, not real-time |
| No role separation | Any staff can change any data |
| No central dashboard | Management has no instant overview |
| No history | Cannot tell who added what product |
| No alerts | Issues only discovered during physical stock checks |

---

## System Architecture

The system is built on a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Tier 1)                  │
│         React 18 + TypeScript + Vite                 │
│   Browser at http://localhost:5173                   │
│                                                      │
│  LoginPage → DashboardPage → ProductsPage           │
│  AlertsPage → StaffPage → CategoriesPage            │
│  ProfilePage                                         │
└────────────────────┬────────────────────────────────┘
                     │  HTTP/REST (JSON)
                     │  Vite proxy /api → :5000
                     ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND (Tier 2)                   │
│              Node.js + Express                       │
│         Server at http://localhost:5000              │
│                                                      │
│  Routes → Middleware → Controllers → Models          │
│                                                      │
│  Background: node-cron (daily expiry check)          │
│  Notifications: Nodemailer (SMTP email)              │
└────────────────────┬────────────────────────────────┘
                     │  Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE (Tier 3)                   │
│                    MongoDB                           │
│         expiry-alert-db (local or Atlas)             │
│                                                      │
│  Collections: users, products, categories, alerts    │
└─────────────────────────────────────────────────────┘
```

### Communication Flow

1. User interacts with React UI in browser
2. React calls API function (e.g. `createProductApi(data)`)
3. Axios sends HTTP request to `/api/products` with JWT in Authorization header
4. Vite dev proxy forwards to `http://localhost:5000/api/products`
5. Express receives request, runs middleware chain
6. Controller executes business logic, queries MongoDB via Mongoose
7. MongoDB returns data, controller sends JSON response
8. Axios receives response, returns data to the hook
9. Hook updates React state
10. React re-renders the component with new data

---

## Technology Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend framework | React 18 | Component model maps well to a dashboard with repeated UI patterns (tables, cards, modals) |
| Language | TypeScript | Catches type errors at compile time — especially important for API response shapes |
| Build tool | Vite | Significantly faster than Create React App. Built-in dev proxy eliminates CORS issues |
| Backend framework | Express | Minimal, flexible, well-documented. Sufficient for a REST API of this scale |
| Database | MongoDB | Schema flexibility suits a product inventory where fields may vary. Mongoose provides structure where needed |
| Authentication | JWT | Stateless — no server-side session storage needed. Token carries user identity and role |
| Password hashing | bcryptjs | Industry standard for password storage. Adaptive work factor makes brute force impractical |
| Scheduling | node-cron | Lightweight cron implementation for Node.js. No external message queue needed |
| Email | Nodemailer | Mature library, works with any SMTP provider, no external service dependency |
| HTTP client | Axios | Interceptors allow JWT injection and 401 handling in one place for all requests |
| Routing | React Router v6 | Nested routes allow shared layout without re-mounting the sidebar on every navigation |

---

## User Roles & Permissions

The system has exactly two roles: **admin** and **staff**.

### Admin

There is one admin account per organisation. Created via the seed script (`npm run seed`). The admin cannot be created through the application UI.

| Permission | Admin |
|---|---|
| Login | ✓ |
| View dashboard | ✓ |
| View all products | ✓ |
| Add products | ✓ |
| Edit own products | ✓ |
| Edit any product | ✓ |
| Delete own products | ✓ |
| Delete any product | ✓ |
| View all alerts | ✓ |
| Mark alerts as read | ✓ |
| Export CSV/PDF | ✓ |
| View profile | ✓ |
| Change own password | ✓ |
| Create staff accounts | ✓ |
| Deactivate staff | ✓ |
| Delete staff | ✓ |
| Create categories | ✓ |
| Edit categories | ✓ |
| Delete categories | ✓ |

### Staff

Staff members are created by the admin. Multiple staff can exist simultaneously.

| Permission | Staff |
|---|---|
| Login | ✓ |
| View dashboard | ✓ |
| View all products | ✓ |
| Add products | ✓ |
| Edit own products | ✓ |
| Edit other's products | ✗ |
| Delete own products | ✓ |
| Delete other's products | ✗ |
| View all alerts | ✓ |
| Mark alerts as read | ✓ |
| Export CSV/PDF | ✓ |
| View profile | ✓ |
| Change own password | ✓ |
| Create staff accounts | ✗ |
| Manage staff | ✗ |
| Create/edit/delete categories | ✗ |

### Permission Enforcement — Three Layers

Permissions are enforced at three layers:

**Layer 1 — Frontend UI (convenience):**
Admin-only nav links are hidden. Edit/delete buttons only show for products the user can act on. Admin-only pages redirect to dashboard.

**Layer 2 — Route middleware (server enforcement):**
`isAdmin` middleware blocks non-admin requests at the route level with `403 Forbidden`.

**Layer 3 — Controller logic (fine-grained enforcement):**
`canEditProduct` middleware checks ownership for product edit/delete with `403 Forbidden`.

Layer 1 is UX. Layers 2 and 3 are security.

---

## Complete Feature List

### Authentication
- Email and password login with JWT token
- 7-day token expiry with automatic logout on expiry
- Password change (requires current password verification)
- Inactive users immediately lose access (token rejected at middleware)

### Dashboard
- Live counts: Total, Valid, Expiring Soon, Expired products
- Unread alert count
- Quick table of up to 5 products expiring within 7 days
- Time-based greeting (morning/afternoon/evening)

### Product Management
- Add products with: name, quantity, category, expiry date, supplier, description
- View all products (every user sees every product)
- Search by product name or supplier
- Filter by category and/or status
- Edit products (admin: any, staff: own only)
- Delete products (admin: any, staff: own only)
- Status auto-recalculates when expiry date is edited
- `addedBy` field tracks which user added each product

### Category Management (Admin only)
- Create categories with name and optional description
- Edit existing categories
- Delete categories
- All authenticated users can view categories (needed for product form)

### Staff Management (Admin only)
- Create staff accounts with name, email, and password
- View all staff with their status (active/inactive)
- Deactivate staff (blocks login, preserves data)
- Permanently delete staff accounts

### Alert System
- Automatic daily expiry check at midnight
- Immediate check on server startup
- Alerts created for: expired products and products expiring within 7 days
- Duplicate prevention (one alert per product per type per day)
- Unread/read state per alert
- "Mark all as read" batch action
- Alert count badge on sidebar navigation link

### Email Notifications
- Triggered automatically by the expiry checker when new alerts are created
- Separate email for expired products and expiring-soon products
- HTML email template with product table and status badges
- Sent to all active users (admin + all staff) in a single send
- Gracefully skipped if email environment variables are not configured

### Export
- Products export to CSV (respects current filters)
- Products export to styled HTML report (printable as PDF)
- Alerts export to CSV
- Instant browser download, no server-side file storage

### Profile
- View own account details (name, email, role, status)
- Change own password with current password verification

---

## Data Architecture

### Entity Relationship

```
User (1) ─────────────── creates ──────────────── Category (many)
  │                                                     │
  │                                                     │ belongs to
  │                                                     ▼
  └──── adds ──────────────────────────────────── Product (many)
                                                        │
                                                        │ references
                                                        ▼
                                                   Alert (many)
```

- One **User** (admin) creates many **Categories**
- One **User** (any) adds many **Products**
- Each **Product** belongs to one **Category**
- Each **Alert** references one **Product**
- **Alerts** are created by the system (cron job), not by users

### Collection Schemas

#### users
```
{
  _id:        ObjectId (auto-generated)
  name:       String
  email:      String (unique, lowercase)
  password:   String (bcrypt hash, never returned in API responses)
  role:       "admin" | "staff"
  isActive:   Boolean (default: true)
  createdAt:  Date
  updatedAt:  Date
}
```

#### categories
```
{
  _id:         ObjectId
  name:        String (unique)
  description: String
  createdBy:   ObjectId → users._id
  createdAt:   Date
  updatedAt:   Date
}
```

#### products
```
{
  _id:         ObjectId
  name:        String
  quantity:    Number (min: 0)
  category:    ObjectId → categories._id
  expiryDate:  Date
  status:      "valid" | "expiring_soon" | "expired"
  addedBy:     ObjectId → users._id
  supplier:    String
  description: String
  createdAt:   Date
  updatedAt:   Date
}
```

#### alerts
```
{
  _id:       ObjectId
  product:   ObjectId → products._id
  type:      "expiring_soon" | "expired"
  message:   String
  isRead:    Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

### Data Relationships

MongoDB does not enforce foreign key constraints the way relational databases do. Mongoose `ref` fields store ObjectIds and use `.populate()` to join data at query time.

**Product → Category:** `Product.category` stores the Category's `_id`. When the frontend requests products, the backend calls `.populate('category', 'name')` which replaces the raw ObjectId with `{ _id: '...', name: 'Dairy & Eggs' }`.

**Product → User:** `Product.addedBy` stores the User's `_id`. Populated with `.populate('addedBy', 'name')` which returns `{ _id: '...', name: 'Jane Doe' }`. Note: only the `name` is returned — never the email or password.

**Alert → Product:** `Alert.product` stores the Product's `_id`. When fetching alerts, this is deeply populated:
```js
.populate({
  path: 'product',
  select: 'name expiryDate category',
  populate: { path: 'category', select: 'name' }
})
```
This returns the product name, expiry date, and the category name — everything needed to display a rich alert card.

---

## Request Lifecycle

### Authentication Request

```
POST /api/auth/login
{ email: "admin@expiryalert.com", password: "admin123456" }

1. Express receives request
2. CORS middleware allows the request origin
3. express.json() parses the JSON body
4. Route: auth.routes.js matches POST /api/auth/login
5. No auth middleware (login is public)
6. Controller: auth.controller.js login()
   a. Validates email and password present
   b. User.findOne({ email }) → queries MongoDB
   c. Checks user exists and isActive === true
   d. user.matchPassword(password) → bcrypt.compare()
   e. jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
   f. Returns { _id, name, email, role, token }
7. Response: 200 OK with user object and token
8. Frontend: stores full object in localStorage as 'authUser'
```

---

### Protected API Request

```
GET /api/products
Authorization: Bearer eyJhbGci...

1. Express receives request
2. Route: product.routes.js → router.use(protect)
3. Middleware: auth.js protect()
   a. Reads Authorization header
   b. Splits 'Bearer TOKEN' → extracts token
   c. jwt.verify(token, JWT_SECRET) → decodes { id, iat, exp }
   d. User.findById(id).select('-password')
   e. Checks user.isActive === true
   f. Sets req.user = user
   g. next()
4. Controller: product.controller.js getAllProducts()
   a. Builds filter from query params (?status, ?category)
   b. Product.find(filter).populate(...).sort({ expiryDate: 1 })
   c. Returns products array
5. Response: 200 OK with products array
```

---

### Admin-Only Request

```
POST /api/staff
Authorization: Bearer eyJhbGci... (staff token)

1. Route: staff.routes.js → router.use(protect, isAdmin)
2. Middleware: auth.js protect() → sets req.user (staff user)
3. Middleware: isAdmin.js
   a. Checks req.user.role === 'admin'
   b. role is 'staff' → NOT admin
   c. Returns 403 { message: 'Access denied, admin only' }
4. Controller NEVER runs
5. Response: 403 Forbidden
```

---

## Expiry Logic — Core Algorithm

The expiry logic runs in two places:

### 1. Daily cron job (midnight)

```javascript
const now = new Date()
const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

if (daysLeft < 0)       → status = 'expired'       // past expiry date
else if (daysLeft <= 7) → status = 'expiring_soon'  // within 7 days
else                    → status = 'valid'           // more than 7 days
```

`Math.ceil` is used so that a product expiring later today (0.4 days left) rounds up to 1, avoiding it being marked as expired before midnight.

### 2. Immediate recalculation on product edit

When a staff member or admin updates a product's `expiryDate`, the `updateProduct` controller recalculates and sets `status` immediately. The cron job does not need to run for the status to reflect the new date.

### Status meanings for supervisors

| Status | Meaning | Badge colour |
|---|---|---|
| `valid` | Product is safe — expiry date is more than 7 days away | Green |
| `expiring_soon` | Product expires within the next 7 days — action recommended | Amber |
| `expired` | Product has passed its expiry date — should be removed from sale | Red |

---

## Alert System — End to End

### How alerts are generated

```
Server starts (or midnight arrives)
         ↓
runExpiryCheck() executes
         ↓
Fetch ALL products from MongoDB (with category populated)
         ↓
For each product:
  Calculate daysLeft
  Determine newStatus (valid / expiring_soon / expired)
  
  IF product.status ≠ newStatus:
    Update product.status in database
  
  IF newStatus is 'expired' or 'expiring_soon':
    Check: does an alert already exist for this product 
           with this type created today?
    
    IF no existing alert today:
      Create Alert document:
        { product: product._id, type: alertType, message: '...' }
      
      Add to newlyExpired or newlyExpiringSoon array
         ↓
After all products processed:
  IF any new alerts were created:
    Fetch all active users' emails
    Send email (if EMAIL_USER configured)
```

### Why alerts might be empty

Alerts are only created when the expiry checker runs AND new status changes are detected. If you:
1. Seed products before starting the server → restart the server → alerts appear
2. Run the seed script while the server is running → the next midnight check will create alerts (or restart server to trigger immediate check)

### Duplicate prevention detail

```javascript
const todayStart = new Date()
todayStart.setHours(0, 0, 0, 0)  // midnight of today

const existingAlert = await Alert.findOne({
  product: product._id,
  type: alertType,
  createdAt: { $gte: todayStart },
})
```

If an alert already exists for this product with this type since midnight today, no new alert is created. This means if the server restarts 3 times in one day, you still only get one alert per product per day.

### Alert lifecycle

```
Created (isRead: false)
       ↓
Appears in Alerts page with left-border accent
       ↓
Sidebar badge count increases
       ↓
User clicks "Mark all as read"
       ↓
All alerts: isRead: true
       ↓
Left-border accent disappears
Sidebar badge count returns to 0
```

---

## Email Notification System

### Configuration

Email requires these `.env` variables:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=ExpiryAlert <your_gmail@gmail.com>
```

For Gmail, `EMAIL_PASS` must be a **Google App Password**, not your regular Gmail password. Generate at: Google Account → Security → 2-Step Verification → App Passwords.

### Email content

**Subject line:**
- Expired: `⚠ ExpiryAlert: 3 product(s) have expired`
- Expiring soon: `⏰ ExpiryAlert: 5 product(s) expiring soon`

**Email body:**
- ExpiryAlert branding header (dark background)
- Coloured alert banner (red or amber)
- Product table: name, category, quantity, expiry date, status badge
- "View All Alerts →" button linking to the frontend
- Footer

**Recipients:** All active users (admin + all staff) receive the email. The `to` field is a comma-separated string of all email addresses — one send call, all recipients.

### Graceful degradation

If `EMAIL_USER` is not set in `.env`, the email step is completely skipped:
```javascript
if (process.env.EMAIL_USER && emails) {
  await sendExpiryAlertEmail(...)
}
```

Email send failures use `.catch()` and only log to the console — they never crash the cron job. Product status updates and alert document creation happen regardless of email success.

---

## Export System

### Products CSV

**Endpoint:** `GET /api/export/products/csv?status=&category=`

**Columns:** Name, Category, Quantity, Expiry Date, Status, Supplier, Added By, Created At

The export respects filters — exporting with `?status=expired` gives only expired products. Exporting with no filters gives everything.

**Use case for supervisors:** "I want a spreadsheet of everything expiring this week" → filter by `status=expiring_soon` → click CSV.

### Products HTML Report (PDF)

**Endpoint:** `GET /api/export/products/pdf`

Generates a fully styled HTML document with:
- ExpiryAlert header branding
- Summary statistics boxes (total, valid, expiring, expired)
- Full product table with coloured status badges
- Clean print-ready layout

**To get a true PDF:** Open the downloaded `.html` file in any browser → Ctrl+P → "Save as PDF" → Print.

### Alerts CSV

**Endpoint:** `GET /api/export/alerts/csv`

**Columns:** Product, Category, Alert Type, Message, Status (Read/Unread), Expiry Date, Alert Date

**Use case:** Audit trail for supervisors — "Show me all alerts we've had this month".

---

## Frontend Architecture

```
main.tsx
└── BrowserRouter
    └── AuthProvider (React Context)
        └── App.tsx (Route definitions)
            ├── /login → LoginPage (public)
            └── / → ProtectedRoute → Layout
                     └── Outlet (page content)
                         ├── /dashboard     → DashboardPage
                         ├── /products      → ProductsPage
                         ├── /alerts        → AlertsPage
                         ├── /profile       → ProfilePage
                         ├── /staff         → AdminRoute → StaffPage
                         └── /categories    → AdminRoute → CategoriesPage
```

**Key design principles:**
- Pages are thin — they compose hooks and components, contain minimal logic
- Hooks own data fetching and mutation — pages just call hook functions
- Components are purely presentational — they receive props and render
- API functions are pure — they make one request and return typed data
- All global styles in one CSS file — no CSS-in-JS, no modules, no utility framework

---

## Backend Architecture

```
server.js
├── connectDB() → MongoDB connection
├── Express middleware (cors, json)
├── Route mounting (/api/auth, /api/staff, etc.)
├── app.listen(PORT)
└── expiryChecker() → starts cron job + immediate run

Request flow:
  Express → Route → Middleware chain → Controller → Model → MongoDB
                                                          ↓
                                               Response ←──
```

**Separation of concerns:**
- `routes/` — URL to handler mapping only, no logic
- `middleware/` — cross-cutting concerns (auth, permissions)
- `controllers/` — business logic
- `models/` — data schema and instance methods
- `jobs/` — scheduled background processes
- `utils/` — shared utilities (mailer, seed scripts)

---

## Security Architecture

### Authentication

JWT (JSON Web Token) is used for stateless authentication.

**Token generation:**
```javascript
jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
```

**Token verification (every protected request):**
```javascript
const decoded = jwt.verify(token, JWT_SECRET)
// decoded = { id: '64abc...', iat: 1234567890, exp: 1235172690 }
```

If the token is expired, tampered with, or signed with a different secret, `jwt.verify` throws an error which the middleware catches and converts to a `401` response.

### Password Security

```
User enters password → bcrypt.hash(password, 10) → stored in MongoDB
                                                     ↑
                                                   Never the raw password

Login verification:
User enters password → bcrypt.compare(entered, stored_hash) → true/false
```

bcrypt with 10 salt rounds means:
- Each hash takes ~100ms to compute
- An attacker trying 1 billion passwords per second would take ~31 years to crack a single hash
- Every stored hash is unique even if two users have the same password (salt is random)

### Active Status Check

The `auth` middleware checks `user.isActive` after finding the user from the database. This means:
- A deactivated user's existing token still passes signature verification
- But the middleware rejects it because `isActive === false`
- Deactivation takes effect on the very next API request — instant access revocation

### Input Validation

All controllers validate required inputs before database operations:
```javascript
if (!name || !quantity || !category || !expiryDate) {
  return res.status(400).json({ message: '...' })
}
```

### CORS

The `cors` middleware is applied without restrictions during development. In production, this should be configured to allow only the frontend's domain:
```javascript
app.use(cors({ origin: 'https://your-frontend-domain.com' }))
```

---

## API Complete Reference

```
Public endpoints (no authentication):
  POST  /api/auth/login

Protected endpoints (JWT required):
  GET   /api/auth/me
  PUT   /api/auth/change-password

  GET   /api/categories
  GET   /api/products
  POST  /api/products
  GET   /api/products/:id
  PUT   /api/products/:id           (admin or owner)
  DELETE /api/products/:id          (admin or owner)

  GET   /api/alerts
  PATCH /api/alerts/mark-read

  GET   /api/dashboard

  GET   /api/export/products/csv
  GET   /api/export/products/pdf
  GET   /api/export/alerts/csv

Admin-only endpoints (admin JWT required):
  GET   /api/staff
  POST  /api/staff
  PATCH /api/staff/:id/deactivate
  DELETE /api/staff/:id

  POST  /api/categories
  PUT   /api/categories/:id
  DELETE /api/categories/:id
```

### Standard Response Formats

**Success (single object):**
```json
{
  "_id": "64abc123...",
  "name": "Full Cream Milk",
  ...
}
```

**Success (array):**
```json
[
  { "_id": "...", "name": "..." },
  { "_id": "...", "name": "..." }
]
```

**Success (message):**
```json
{ "message": "Staff deleted successfully" }
```

**Error:**
```json
{ "message": "Descriptive error message" }
```

### HTTP Status Codes Used

| Code | Meaning | When used |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Missing required fields, validation failure |
| 401 | Unauthorised | Missing/invalid/expired token, wrong password |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Requested resource doesn't exist |
| 500 | Internal Server Error | Unexpected server-side error |

---

## Environment Setup

### Prerequisites

| Software | Version | Required for |
|---|---|---|
| Node.js | v18+ | Running backend and frontend |
| npm | v9+ | Package management |
| MongoDB | v6+ | Database (local) |

**OR** use MongoDB Atlas for a cloud-hosted database (no local MongoDB needed).

### Installation Steps

```bash
# 1. Clone or set up the project
mkdir product-expiry-system
cd product-expiry-system

# 2. Set up backend
cd backend
npm install

# 3. Create .env file with your values
# (copy the .env template and fill in values)

# 4. Set up frontend
cd ../frontend
npm install
```

---

## Running the System

### Development (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run seed          # first time only — creates admin account
npm run dev           # starts server with nodemon on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev           # starts Vite dev server on port 5173
```

Open `http://localhost:5173` in your browser.

**Default admin credentials:**
- Email: `admin@expiryalert.com`
- Password: `admin123456`

### npm Scripts

**Backend:**
| Script | Command | Purpose |
|---|---|---|
| `npm run start` | `node server.js` | Production start |
| `npm run dev` | `nodemon server.js` | Development with auto-restart |
| `npm run seed` | `node utils/seedAdmin.js` | Create admin account (once) |
| `npm run seed:products` | `node utils/seedProducts.js` | Load demo data |

**Frontend:**
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Development server |
| `npm run build` | `tsc && vite build` | Production build |
| `npm run preview` | `vite preview` | Preview production build |

---

## Database Seeding

### seedAdmin.js

Creates the first and only admin account. Safe to run multiple times — does nothing if admin already exists.

```
Email:    admin@expiryalert.com
Password: admin123456
```

**Change the password** after first login via Profile → Change Password.

### seedProducts.js

Loads realistic supermarket demo data. **Clears all existing products and categories** before inserting fresh data.

**10 categories created:**
- Dairy & Eggs
- Bakery
- Meat & Poultry
- Seafood
- Fruits & Vegetables
- Beverages
- Snacks & Confectionery
- Frozen Foods
- Pharmaceuticals
- Condiments & Sauces

**~62 products created with spread across all three statuses:**
- ~31 valid (safe expiry dates far in future)
- ~19 expiring soon (within 7 days of today)
- ~12 expired (past dates)

All products have `addedBy` set to the admin user. Status is calculated and set at seed time based on each product's `expiryDate` relative to today.

---

## File Structure — Complete Tree

```
product-expiry-system/
│
├── backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   └── Alert.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── isAdmin.js
│   │   └── canEditProduct.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── staff.routes.js
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   ├── alert.routes.js
│   │   ├── dashboard.routes.js
│   │   └── export.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── staff.controller.js
│   │   ├── category.controller.js
│   │   ├── product.controller.js
│   │   ├── alert.controller.js
│   │   ├── dashboard.controller.js
│   │   └── export.controller.js
│   │
│   ├── jobs/
│   │   └── expiryChecker.js
│   │
│   └── utils/
│       ├── seedAdmin.js
│       ├── seedProducts.js
│       └── mailer.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    │
    └── src/
        ├── main.tsx
        ├── App.tsx
        │
        ├── types/
        │   └── index.ts
        │
        ├── context/
        │   └── AuthContext.tsx
        │
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useProducts.ts
        │   ├── useCategories.ts
        │   └── useAlerts.ts
        │
        ├── api/
        │   ├── axios.ts
        │   ├── auth.api.ts
        │   ├── staff.api.ts
        │   ├── category.api.ts
        │   ├── product.api.ts
        │   ├── alert.api.ts
        │   ├── dashboard.api.ts
        │   └── export.api.ts
        │
        ├── components/
        │   ├── Layout.tsx
        │   ├── Sidebar.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── AdminRoute.tsx
        │   ├── StatCard.tsx
        │   ├── AlertBadge.tsx
        │   ├── ProductTable.tsx
        │   ├── ProductForm.tsx
        │   ├── StaffForm.tsx
        │   └── CategoryForm.tsx
        │
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── ProductsPage.tsx
        │   ├── AlertsPage.tsx
        │   ├── StaffPage.tsx
        │   ├── CategoriesPage.tsx
        │   └── ProfilePage.tsx
        │
        └── styles/
            └── index.css
```

---

## How Each Feature Works

### How login works

1. User enters email and password on LoginPage
2. Frontend calls `loginApi(email, password)` → `POST /api/auth/login`
3. Backend finds user by email, verifies password with bcrypt
4. If valid: generates JWT signed with `JWT_SECRET`, returns user object + token
5. Frontend stores the full `AuthUser` object in `localStorage` as `'authUser'`
6. `AuthContext` state is updated with the user
7. React Router redirects to `/dashboard`
8. On every subsequent API request, Axios interceptor reads the stored token and adds it to the `Authorization` header automatically

### How products are displayed

1. `ProductsPage` mounts, calls `useProducts({ category, status })` hook
2. Hook calls `getAllProductsApi(filters)` → `GET /api/products?status=...&category=...`
3. Backend queries MongoDB, populates category name and addedBy name, sorts by expiry date
4. Response returns to hook, stored in `products` state
5. Hook also exposes `loading` state for the spinner
6. `ProductTable` component receives `products` array as prop and renders rows
7. Each row shows: name, category, quantity, expiry date, days left, status badge, added by, and action buttons

### How adding a product works

1. Staff clicks "+ Add Product"
2. `ProductForm` modal opens with empty fields
3. Category dropdown is populated from `useCategories()` already loaded
4. Staff fills in name, quantity, category, expiry date, optional supplier and description
5. On submit: `createProductApi(data)` → `POST /api/products` with JWT
6. Backend sets `addedBy: req.user._id` automatically, saves to MongoDB
7. Returns populated product object
8. `useProducts.createProduct()` prepends to local state → product appears at top of list without page refresh

### How the expiry checker works

1. `server.js` calls `expiryChecker()` after database connects
2. `runExpiryCheck()` fires immediately
3. Fetches all products from MongoDB
4. For each product: calculates days until expiry, determines correct status
5. If status changed: saves updated product to MongoDB
6. If product is expired or expiring soon: checks for existing alert today
7. If no alert today: creates new Alert document, adds product to notification array
8. After all products: if any new alerts, sends email to all active users
9. `node-cron` then schedules this same function to run at midnight every night

### How edit permissions work

1. Admin clicks Edit on any product → `canEditProduct` middleware passes (`isAdmin = true`)
2. Staff clicks Edit on own product → `canEditProduct` checks `product.addedBy.toString() === req.user._id.toString()` → true → passes
3. Staff tries to edit another staff's product (direct API call) → `canEditProduct` checks ownership → false, not admin → `403 Forbidden`
4. On the frontend: `ProductTable` only renders Edit/Delete buttons if `canEdit(product)` returns true — staff never see the buttons for others' products

### How exports work

1. User clicks "↓ CSV" on Products page
2. `exportProductsCSV({ status, category })` called
3. Axios GET request to `/api/export/products/csv?status=...` with `responseType: 'text'`
4. Backend queries products with filters, builds CSV string, sends with `Content-Disposition: attachment` header
5. Frontend receives CSV as text, creates a Blob, generates Object URL
6. Creates invisible `<a>` element with `download` attribute, clicks it programmatically
7. Browser triggers file download dialog
8. `<a>` element removed, Object URL revoked

---

## Glossary

| Term | Definition |
|---|---|
| JWT | JSON Web Token — a signed, encoded string that proves a user's identity without server-side session storage |
| bcrypt | A password hashing algorithm that uses a random salt and configurable work factor to make brute-force attacks impractical |
| ODM | Object Document Mapper — Mongoose is an ODM that maps JavaScript objects to MongoDB documents |
| Middleware | A function that sits between an HTTP request and its handler, used for auth checks, logging, parsing, etc. |
| Populate | Mongoose operation that replaces an ObjectId reference with the actual referenced document |
| Cron | A time-based scheduler. `'0 0 * * *'` means "at minute 0 of hour 0 every day" (midnight) |
| CORS | Cross-Origin Resource Sharing — browser security mechanism that controls which domains can make API requests |
| SMTP | Simple Mail Transfer Protocol — the standard for sending email. Nodemailer uses SMTP to send via Gmail or other providers |
| REST | Representational State Transfer — an API design style using HTTP methods (GET, POST, PUT, DELETE) and resource URLs |
| SPA | Single Page Application — a web app that loads once and navigates client-side without full page reloads |
| Vite Proxy | A development feature that forwards `/api` requests from the frontend dev server to the backend, avoiding CORS issues |
| ObjectId | MongoDB's built-in unique identifier type — a 24-character hex string like `64abc123def456789012cdef` |
| Token expiry | JWT tokens include an `exp` claim. After 7 days the token is no longer valid and the user must log in again |
| Salt | A random value added to a password before hashing — ensures two identical passwords produce different hashes |
| App Password | A Google-generated secondary password for applications that access Gmail via SMTP, required when 2FA is enabled |
| Optimistic update | Updating local UI state immediately after an API call without waiting for a server refetch — makes the UI feel instant |
| Route guard | A React component that checks a condition (logged in, is admin) and redirects if the condition is not met |