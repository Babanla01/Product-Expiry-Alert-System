# Product-Expiry-Alert-System
# Frontend Documentation
## Product Expiry Alert Management System

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup & Configuration](#setup--configuration)
   - [package.json](#packagejson)
   - [tsconfig.json](#tsconfigjson)
   - [vite.config.ts](#viteconfigts)
   - [index.html](#indexhtml)
5. [Entry Point](#entry-point)
6. [TypeScript Types](#typescript-types)
7. [Authentication Context](#authentication-context)
8. [Custom Hooks](#custom-hooks)
   - [useAuth](#useauth)
   - [useProducts](#useproducts)
   - [useCategories](#usecategories)
   - [useAlerts](#usealerts)
9. [API Layer](#api-layer)
   - [axios.ts — Base Instance](#axists--base-instance)
   - [auth.api.ts](#authapit)
   - [staff.api.ts](#staffapit)
   - [category.api.ts](#categoryapit)
   - [product.api.ts](#productapit)
   - [alert.api.ts](#alertapit)
   - [dashboard.api.ts](#dashboardapit)
   - [export.api.ts](#exportapit)
10. [Routing](#routing)
11. [Route Guards](#route-guards)
    - [ProtectedRoute](#protectedroute)
    - [AdminRoute](#adminroute)
12. [Layout & Navigation](#layout--navigation)
    - [Layout Component](#layout-component)
    - [Sidebar Component](#sidebar-component)
13. [Pages](#pages)
    - [LoginPage](#loginpage)
    - [DashboardPage](#dashboardpage)
    - [ProductsPage](#productspage)
    - [AlertsPage](#alertspage)
    - [StaffPage](#staffpage)
    - [CategoriesPage](#categoriespage)
    - [ProfilePage](#profilepage)
14. [Reusable Components](#reusable-components)
    - [StatCard](#statcard)
    - [AlertBadge](#alertbadge)
    - [ProductTable](#producttable)
    - [ProductForm](#productform)
    - [StaffForm](#staffform)
    - [CategoryForm](#categoryform)
15. [Global Styles](#global-styles)
    - [Design Tokens](#design-tokens)
    - [Layout Classes](#layout-classes)
    - [Component Classes](#component-classes)
    - [Responsive Breakpoints](#responsive-breakpoints)
16. [State Management Pattern](#state-management-pattern)
17. [Data Flow](#data-flow)
18. [Permission Enforcement on the Frontend](#permission-enforcement-on-the-frontend)
19. [Export Feature](#export-feature)

---

## Overview

The frontend is a **React 18** single-page application written in **TypeScript**, bundled with **Vite**. It communicates with the backend exclusively through a typed API layer built on **Axios**. Authentication state is managed using React Context. All business logic related to data fetching and mutation lives in custom hooks, keeping page components focused purely on rendering.

The design follows a **dark industrial utility** aesthetic — deep charcoal backgrounds, amber/orange accents for interactive elements and alerts, red for expired status, green for valid status. The font pairing is Syne (geometric display for headings) + DM Sans (clean body text) + DM Mono (dates, IDs, code values, badges).

---

## Technology Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.2.0 | UI component library |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^6.20.1 | Client-side routing with nested routes |
| `axios` | ^1.6.2 | HTTP client with interceptors |
| `typescript` | ^5.2.2 | Static typing |
| `vite` | ^5.0.8 | Dev server and build tool |
| `@vitejs/plugin-react` | ^4.2.1 | Vite plugin for React JSX transform |
| `@types/react` | ^18.2.43 | TypeScript types for React |
| `@types/react-dom` | ^18.2.17 | TypeScript types for ReactDOM |

**Google Fonts (loaded via CDN in index.html):**
- `Syne` — weights 400, 500, 600, 700, 800
- `DM Mono` — weights 400, 500
- `DM Sans` — weights 300, 400, 500

---

## Project Structure

```
frontend/
├── index.html                   # HTML shell, loads fonts, mounts #root
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript compiler config
├── tsconfig.node.json           # TypeScript config for vite.config.ts
├── vite.config.ts               # Vite config with dev proxy to backend
│
└── src/
    ├── main.tsx                 # ReactDOM.createRoot, wraps app in providers
    ├── App.tsx                  # Route definitions, nested layout
    │
    ├── types/
    │   └── index.ts             # All TypeScript interfaces — User, Product, Alert, etc.
    │
    ├── context/
    │   └── AuthContext.tsx      # Auth state, login/logout functions, isAdmin flag
    │
    ├── hooks/
    │   ├── useAuth.ts           # Shorthand for useContext(AuthContext)
    │   ├── useProducts.ts       # Fetch + CRUD state management for products
    │   ├── useCategories.ts     # Fetch + CRUD state management for categories
    │   └── useAlerts.ts         # Fetch + markAllRead state for alerts
    │
    ├── api/
    │   ├── axios.ts             # Axios instance, JWT interceptor, 401 redirect
    │   ├── auth.api.ts          # login, getMe, changePassword
    │   ├── staff.api.ts         # getAllStaff, createStaff, deactivate, delete
    │   ├── category.api.ts      # getAll, create, update, delete categories
    │   ├── product.api.ts       # getAll, getById, create, update, delete products
    │   ├── alert.api.ts         # getAlerts, markAlertsRead
    │   ├── dashboard.api.ts     # getDashboardStats
    │   └── export.api.ts        # exportProductsCSV, exportProductsPDF, exportAlertsCSV
    │
    ├── components/
    │   ├── Layout.tsx           # App shell — sidebar + outlet
    │   ├── Sidebar.tsx          # Navigation sidebar with user info and logout
    │   ├── ProtectedRoute.tsx   # Redirects to /login if no token
    │   ├── AdminRoute.tsx       # Redirects to /dashboard if not admin
    │   ├── StatCard.tsx         # Dashboard summary card
    │   ├── AlertBadge.tsx       # Coloured status badge (valid/expiring_soon/expired)
    │   ├── ProductTable.tsx     # Full product table with conditional edit/delete
    │   ├── ProductForm.tsx      # Add/edit product modal form
    │   ├── StaffForm.tsx        # Add staff modal form
    │   └── CategoryForm.tsx     # Add/edit category modal form
    │
    ├── pages/
    │   ├── LoginPage.tsx        # Login form — only page accessible without auth
    │   ├── DashboardPage.tsx    # Stats overview + expiring soon table
    │   ├── ProductsPage.tsx     # Full inventory with filters + add/edit/delete
    │   ├── AlertsPage.tsx       # Alert list with read/unread state
    │   ├── StaffPage.tsx        # Admin: staff management table
    │   ├── CategoriesPage.tsx   # Admin: category management table
    │   └── ProfilePage.tsx      # Account info + change password form
    │
    └── styles/
        └── index.css            # All global CSS — tokens, layout, components
```

---

## Setup & Configuration

### package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

- `npm run dev` — starts the Vite dev server on `http://localhost:5173` with hot module replacement
- `npm run build` — runs TypeScript compiler check then Vite production build
- `npm run preview` — serves the production build locally for testing

---

### tsconfig.json

Key compiler options:

| Option | Value | Purpose |
|---|---|---|
| `target` | `ES2020` | Compiled JavaScript target |
| `jsx` | `react-jsx` | Use the new React JSX transform (no need to import React in every file) |
| `strict` | `true` | Enables all strict type checks |
| `noUnusedLocals` | `true` | Error on unused variables |
| `noUnusedParameters` | `true` | Error on unused function parameters |
| `moduleResolution` | `bundler` | Modern module resolution for Vite |
| `allowImportingTsExtensions` | `true` | Allows importing `.ts` and `.tsx` files with extensions |

---

### vite.config.ts

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

**The proxy is critical.** Any request made to `/api/*` from the frontend is automatically forwarded to `http://localhost:5000/api/*` by Vite's dev server. This means:

- The frontend uses relative URLs like `/api/auth/login`
- No CORS issues during development because the request appears to come from the same origin
- The backend address only needs to change in one place (this config) to switch environments

---

### index.html

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800
            &family=DM+Mono:wght@400;500
            &family=DM+Sans:wght@300;400;500&display=swap"
      rel="stylesheet" />
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

The HTML file is minimal — it loads the Google Fonts stylesheet, provides the `#root` mount point, and loads `main.tsx` as an ES module. Vite handles everything else during the build.

---

## Entry Point

**File:** `src/main.tsx`

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

**Provider order (inside out):**
1. `React.StrictMode` — development-only double renders to catch side effects
2. `BrowserRouter` — provides routing context to all child components
3. `AuthProvider` — provides authentication state to all child components
4. `App` — the actual application

`AuthProvider` must be inside `BrowserRouter` because if a user is not authenticated, `AuthProvider` redirects to `/login` — which requires the router context to be available.

---

## TypeScript Types

**File:** `src/types/index.ts`

All data shapes used across the application are defined here. Every API response is typed against these interfaces.

```ts
interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  isActive: boolean
  createdAt: string
}

interface Category {
  _id: string
  name: string
  description: string
  createdBy: { _id: string; name: string }
  createdAt: string
}

interface Product {
  _id: string
  name: string
  quantity: number
  category: Category | string   // string when ID, Category when populated
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  addedBy: { _id: string; name: string } | string  // string when ID, object when populated
  supplier: string
  description: string
  createdAt: string
}

interface Alert {
  _id: string
  product: {
    _id: string
    name: string
    expiryDate: string
    category: { _id: string; name: string }
  }
  type: 'expiring_soon' | 'expired'
  message: string
  isRead: boolean
  createdAt: string
}

interface DashboardStats {
  total: number
  valid: number
  expiringSoon: number
  expired: number
  unreadAlerts: number
}

interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  token: string
}
```

**Key design note:** `Product.category` and `Product.addedBy` are union types (`Category | string` and `object | string`). This is because MongoDB can return these fields either as raw ObjectId strings (when not populated) or as full objects (when populated with `.populate()`). Components always check `typeof product.category === 'object'` before accessing `product.category.name`.

---

## Authentication Context

**File:** `src/context/AuthContext.tsx`

The auth context stores the current user's information and provides login/logout functions to any component in the tree.

```ts
interface AuthContextType {
  user: AuthUser | null    // null when not logged in
  login: (userData: AuthUser) => void
  logout: () => void
  isAdmin: boolean         // derived from user.role === 'admin'
}
```

**Persistence:** On `login()`, the `AuthUser` object (including the JWT token) is serialised to `localStorage` under the key `'authUser'`. On page refresh, the initial state reads from `localStorage` so the user stays logged in across browser sessions.

**logout():** Removes `'authUser'` from `localStorage` and sets `user` to `null`. React Router then redirects to `/login` because `ProtectedRoute` detects no user.

**isAdmin:** Computed directly from `user?.role === 'admin'`. Used throughout the app to conditionally show admin-only UI elements.

**useEffect on mount:** Reads from `localStorage` once when the provider mounts to handle cases where the state initialiser might have run before localStorage was ready.

---

## Custom Hooks

### useAuth

**File:** `src/hooks/useAuth.ts`

```ts
export const useAuth = () => useContext(AuthContext)
```

A thin wrapper around `useContext(AuthContext)`. Components import and call `useAuth()` rather than `useContext(AuthContext)` directly — cleaner syntax and easier to refactor later.

**Usage:**
```tsx
const { user, isAdmin, logout } = useAuth()
```

---

### useProducts

**File:** `src/hooks/useProducts.ts`

Manages the full product list state including loading, error, and all CRUD operations.

```ts
const { products, loading, error, refetch, createProduct, updateProduct, deleteProduct }
  = useProducts({ category?: string, status?: string })
```

**How it works:**

- Accepts optional filter params `{ category, status }` 
- On mount and whenever filters change (`useCallback` with filters as deps), calls `getAllProductsApi(filters)`
- `createProduct(data)` — calls the API, then prepends the new product to state with `setProducts(prev => [newProduct, ...prev])`
- `updateProduct(id, data)` — calls the API, then replaces the matching product in state with `setProducts(prev => prev.map(p => p._id === id ? updated : p))`
- `deleteProduct(id)` — calls the API, then removes from state with `setProducts(prev => prev.filter(p => p._id !== id))`

This **optimistic-style local state update** pattern means the UI updates instantly without needing to refetch the entire list from the server after every action.

---

### useCategories

**File:** `src/hooks/useCategories.ts`

Same pattern as `useProducts` but for categories.

```ts
const { categories, loading, error, refetch, createCategory, updateCategory, deleteCategory }
  = useCategories()
```

No filter params — categories are always fetched in full (there are never many categories). The hook is used in both `CategoriesPage` (for the management table) and `ProductForm` (to populate the category dropdown).

---

### useAlerts

**File:** `src/hooks/useAlerts.ts`

```ts
const { alerts, loading, error, refetch, markAllRead } = useAlerts(params?)
```

`markAllRead()` — calls `markAlertsReadApi()`, then updates local state with `setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))` so the UI reflects the change immediately without a refetch.

---

## API Layer

### axios.ts — Base Instance

**File:** `src/api/axios.ts`

```ts
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})
```

**Request interceptor:**
- Before every outgoing request, reads `localStorage.getItem('authUser')`
- If a user is stored, parses the JSON and attaches `config.headers.Authorization = 'Bearer ' + user.token`
- This runs automatically on every single API call — no component ever needs to manually add the auth header

**Response interceptor:**
- If any response comes back with status `401`:
  - Removes `'authUser'` from localStorage
  - Redirects to `/login` using `window.location.href = '/login'`
- This handles token expiry automatically — a user whose 7-day token has expired will be silently logged out and redirected to login on their next API call

All other API files import this single `api` instance and use it for all requests.

---

### auth.api.ts

```ts
loginApi(email, password)        → POST /auth/login → AuthUser
getMeApi()                       → GET /auth/me → User
changePasswordApi(current, new)  → PUT /auth/change-password → { message }
```

---

### staff.api.ts

```ts
getAllStaffApi()                              → GET /staff → User[]
createStaffApi({ name, email, password })    → POST /staff → User
deactivateStaffApi(id)                       → PATCH /staff/:id/deactivate → { message }
deleteStaffApi(id)                           → DELETE /staff/:id → { message }
```

---

### category.api.ts

```ts
getAllCategoriesApi()                        → GET /categories → Category[]
createCategoryApi({ name, description })    → POST /categories → Category
updateCategoryApi(id, { name, description })→ PUT /categories/:id → Category
deleteCategoryApi(id)                       → DELETE /categories/:id → { message }
```

---

### product.api.ts

```ts
getAllProductsApi({ category?, status? })   → GET /products → Product[]
getProductByIdApi(id)                       → GET /products/:id → Product
createProductApi(data)                      → POST /products → Product
updateProductApi(id, data)                  → PUT /products/:id → Product
deleteProductApi(id)                        → DELETE /products/:id → { message }
```

---

### alert.api.ts

```ts
getAlertsApi({ type?, isRead? })            → GET /alerts → Alert[]
markAlertsReadApi()                         → PATCH /alerts/mark-read → { message }
```

---

### dashboard.api.ts

```ts
getDashboardStatsApi()                      → GET /dashboard → DashboardStats
```

---

### export.api.ts

**File:** `src/api/export.api.ts`

The export API functions do not return data — they trigger file downloads directly in the browser.

```ts
exportProductsCSV(params?)    → GET /export/products/csv → downloads products.csv
exportProductsPDF(params?)    → GET /export/products/pdf → downloads products-report.html
exportAlertsCSV()             → GET /export/alerts/csv  → downloads alerts.csv
```

**Download mechanism:**
```ts
const downloadFile = (data, filename, mimeType) => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

This creates an invisible `<a>` element, sets the `download` attribute, programmatically clicks it to trigger the browser's download dialog, then immediately removes the element and revokes the object URL to free memory.

The Axios request uses `{ responseType: 'text' }` to receive the CSV/HTML content as a plain string rather than parsed JSON.

---

## Routing

**File:** `src/App.tsx`

The application uses React Router v6's nested route pattern.

```
/login                    → LoginPage (public)
/                         → Layout (protected shell)
  /dashboard              → DashboardPage
  /products               → ProductsPage
  /alerts                 → AlertsPage
  /profile                → ProfilePage
  /staff                  → StaffPage (admin only)
  /categories             → CategoriesPage (admin only)
/* (catch-all)            → redirect to /dashboard
```

**Nested routes:** The `/` route renders `<Layout />` which contains an `<Outlet />`. All child routes render inside that outlet. This means the Sidebar and topbar are rendered once at the layout level and persist across all page navigations without re-mounting.

**Redirect logic:**
- `/login` with an active session → redirect to `/dashboard`
- `/` (root) → redirect to `/dashboard`
- Any unmatched path → redirect to `/dashboard`

---

## Route Guards

### ProtectedRoute

**File:** `src/components/ProtectedRoute.tsx`

```tsx
const { user } = useAuth()
return user ? <>{children}</> : <Navigate to="/login" replace />
```

Wraps the entire `<Layout />` route. If `user` is null (not logged in), redirects to `/login`. The `replace` prop means the `/login` redirect replaces the current history entry rather than pushing a new one — pressing the back button won't send the user back to the protected page.

---

### AdminRoute

**File:** `src/components/AdminRoute.tsx`

```tsx
const { user, isAdmin } = useAuth()
if (!user) return <Navigate to="/login" replace />
if (!isAdmin) return <Navigate to="/dashboard" replace />
return <>{children}</>
```

Wraps `/staff` and `/categories` routes. Has two checks:
1. No user at all → redirect to login
2. User exists but is not admin → redirect to dashboard (staff who somehow navigate to `/staff` directly see the dashboard instead)

---

## Layout & Navigation

### Layout Component

**File:** `src/components/Layout.tsx`

The Layout component is the shell that wraps all authenticated pages. It manages the mobile sidebar open/close state.

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)

return (
  <div className="app-shell">
    <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
         onClick={() => setSidebarOpen(false)} />
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="main-content">
      <div className="topbar">   {/* mobile only */}
        <div className="topbar-logo">Expiry<span>Alert</span></div>
        <button onClick={() => setSidebarOpen(true)}>☰</button>
      </div>
      <div className="page-container">
        <Outlet />              {/* child page renders here */}
      </div>
    </div>
  </div>
)
```

- `app-shell` uses `display: flex` to place sidebar and content side by side
- `main-content` has `margin-left: 240px` on desktop to account for the fixed sidebar
- On mobile (`max-width: 768px`), `margin-left: 0` and the sidebar becomes a drawer

---

### Sidebar Component

**File:** `src/components/Sidebar.tsx`

The sidebar is a fixed-position panel that contains the logo, navigation links, and user info footer.

**Unread alert count:** On mount, the sidebar calls `getAlertsApi({ isRead: false })` to fetch the count of unread alerts. If `unreadCount > 0`, a red badge appears next to the Alerts nav link. This gives users immediate visibility of pending alerts from any page.

**NavLink active state:** React Router's `<NavLink>` component provides a callback `({ isActive })` that returns `true` when the current URL matches the link's `to` path. The component applies `class="nav-link active"` when active, which applies amber text and background via CSS.

**Admin-only nav items:** The Categories and Staff links are wrapped in `{isAdmin && (...)}`. Staff users never see these links in the sidebar.

**User footer:**
- Shows avatar with initials (first letter of each name word, max 2 characters)
- Shows full name and role
- Logout button calls `logout()` from `useAuth()` then navigates to `/login`

**Mobile behaviour:** The sidebar receives `isOpen` prop. CSS applies `transform: translateX(-100%)` when closed and `transform: translateX(0)` when open. A dark overlay (`sidebar-overlay`) covers the content area when the sidebar is open on mobile, clicking it closes the sidebar.

---

## Pages

### LoginPage

**File:** `src/pages/LoginPage.tsx`

The only page accessible without authentication.

**Features:**
- Email and password inputs with validation
- Error message display for wrong credentials or network errors
- Loading state on the submit button while the API call is in flight
- On success: calls `login(userData)` from `useAuth()` then navigates to `/dashboard`
- Note at the bottom: "Contact your admin to get access" — no self-registration

**Visual design:**
- Centered card on a dark background
- Subtle radial gradient glow behind the card (amber, very low opacity)
- Logo icon in amber box above the title
- "ExpiryAlert" title with the "Alert" portion in amber

---

### DashboardPage

**File:** `src/pages/DashboardPage.tsx`

The landing page after login. Gives an instant overview of the inventory state.

**Data fetching:**
Uses `Promise.all` to fetch dashboard stats and expiring-soon products simultaneously:
```ts
Promise.all([getDashboardStatsApi(), getAllProductsApi({ status: 'expiring_soon' })])
```
Both requests fire at the same time — faster than sequential awaits.

**Components:**
- Personalised greeting: "Good morning/afternoon/evening, [Name]" based on current hour
- 5 `<StatCard>` components: Total Products, Valid, Expiring Soon, Expired, Unread Alerts
- "Expiring Soon" card with a table of up to 5 products, with Days Left column in amber

**Empty state:** If no products are expiring soon, shows a "All clear!" message with a green checkmark icon.

---

### ProductsPage

**File:** `src/pages/ProductsPage.tsx`

The main inventory management page.

**State:**
```ts
statusFilter    — selected status dropdown value
categoryFilter  — selected category dropdown value
search          — text input value for name/supplier search
showForm        — boolean to show/hide ProductForm modal
editProduct     — Product | null (null = adding new, object = editing)
deleteTarget    — Product | null (product pending delete confirmation)
actionError     — error message string from delete operations
exporting       — boolean loading state for export buttons
```

**Filtering logic:**
- `statusFilter` and `categoryFilter` are passed to `useProducts()` which passes them to the API as query parameters — server-side filtering
- `search` is applied client-side using `.filter()` on the returned array — matches against `name` and `supplier` fields
- "Clear filters" button appears when any filter is active

**Export buttons:**
- `↓ CSV` button calls `exportProductsCSV` passing current `statusFilter` and `categoryFilter` — the export respects whatever the user is currently filtering
- `↓ PDF` button calls `exportProductsPDF` with same params

**Add/Edit flow:**
1. User clicks "+ Add Product" → sets `editProduct = null`, `showForm = true`
2. User clicks "Edit" on a row → sets `editProduct = product`, `showForm = true`
3. `ProductForm` modal renders with the product pre-filled if editing
4. On form submit → calls `createProduct` or `updateProduct` from `useProducts`
5. Modal closes, product list updates in place

**Delete flow:**
1. User clicks "Delete" → sets `deleteTarget = product`
2. Confirm modal renders
3. User confirms → calls `deleteProduct`, product removed from list
4. User cancels → `deleteTarget = null`, modal closes

---

### AlertsPage

**File:** `src/pages/AlertsPage.tsx`

Displays all system-generated expiry alerts.

**Features:**
- Shows unread count in the subtitle: "3 unread alerts"
- "Mark all as read" button appears only when there are unread alerts
- "↓ Export CSV" button downloads all alerts as a CSV file
- Each alert item shows: icon, message, category, expiry date, created timestamp, type badge
- Unread alerts have a coloured left border (red for expired, amber for expiring soon)

**Alert item visual states:**
```
Unread expired:       red left border + red icon background
Unread expiring soon: amber left border + amber icon background
Read:                 standard border, no left accent
```

---

### StaffPage

**File:** `src/pages/StaffPage.tsx`  
**Access:** Admin only (wrapped in `AdminRoute`)

Allows the admin to manage staff accounts.

**Features:**
- Table showing name (with avatar initials), email, role badge, active/inactive badge, join date
- "+ Add Staff" button opens `StaffForm` modal
- "Deactivate" button — sets `isActive: false`, button disappears after deactivation, status badge changes to red "Inactive"
- "Delete" button — opens confirm modal, permanently removes the staff member

**Note:** Deactivate vs Delete distinction is important:
- Deactivate: Staff member can no longer log in but their product history is preserved
- Delete: Permanent removal. Products they added still exist but "Added By" shows "—"

---

### CategoriesPage

**File:** `src/pages/CategoriesPage.tsx`  
**Access:** Admin only (wrapped in `AdminRoute`)

Allows the admin to manage product categories.

**Features:**
- Table showing category name, description, creator name, creation date
- "+ Add Category" opens `CategoryForm` modal
- "Edit" button opens `CategoryForm` pre-filled with existing data
- "Delete" button opens confirm modal
- Error handling for deletion — if a category is in use by products, the backend returns an error which is displayed as an error message

---

### ProfilePage

**File:** `src/pages/ProfilePage.tsx`

Available to all authenticated users.

**Two-column layout (collapses to single column on mobile):**

**Left card — Account Info:**
- Large avatar with initials
- Name and email display
- Role badge
- Status badge (always Active for logged-in users)

**Right card — Change Password:**
- Current password input
- New password input
- Confirm new password input
- Client-side validation:
  - All fields required
  - New password minimum 6 characters
  - New and confirm must match
  - New must differ from current
- Success message on completion
- Error message if current password is wrong

---

## Reusable Components

### StatCard

**File:** `src/components/StatCard.tsx`

```tsx
<StatCard label="Expired" value={12} icon="✕" variant="expired" />
```

Props: `label`, `value`, `icon`, `variant` (total | valid | expiring | expired | alerts)

Each variant applies a different coloured top border line and value colour via CSS class `.stat-card.${variant}`. The value number uses the Syne display font at 36px weight 800 for maximum visual impact.

---

### AlertBadge

**File:** `src/components/AlertBadge.tsx`

```tsx
<AlertBadge status="expiring_soon" />
```

Maps status strings to CSS classes and display labels:
```ts
valid        → 'badge badge-valid'    → "Valid"         (green)
expiring_soon→ 'badge badge-expiring' → "Expiring Soon" (amber)
expired      → 'badge badge-expired'  → "Expired"       (red)
```

Each badge has a coloured dot before the text (via CSS `::before` pseudo-element), background tint, and a coloured border in the same hue — all achieved through CSS classes, no inline styles.

---

### ProductTable

**File:** `src/components/ProductTable.tsx`

Renders the product inventory table.

**Columns:** Product (name + supplier), Category, Qty, Expiry Date, Days Left, Status, Added By, Actions

**Days left calculation:**
```ts
diff = ceil((expiryDate - now) / 86400000)
diff < 0  → "3d ago"    (red text)
diff === 0 → "Today"    (red text)
diff > 0  → "12d left"  (secondary text)
```

**Edit/Delete visibility:**
```ts
const canEdit = (product) => {
  if (isAdmin) return true
  return product.addedBy._id === user._id
}
```
If `canEdit` returns false, the Actions cell shows `—` instead of buttons. Staff members see Edit/Delete only for their own products. Admins see buttons for all products.

**Empty state:** When `products.length === 0`, renders a centered empty state with icon, title, and description inside the table container.

---

### ProductForm

**File:** `src/components/ProductForm.tsx`

A modal form for adding or editing products.

**Fields:**
- Product Name (text, required)
- Quantity (number, min 0, required)
- Category (select dropdown from categories array, required)
- Expiry Date (date picker, required)
- Supplier (text, optional)
- Description (textarea, optional)

**Edit mode detection:** If the `product` prop is provided, the form pre-fills all fields using `useEffect`. The category ID is extracted from `product.category` — if it's an object (populated), uses `product.category._id`; if it's a string, uses it directly.

**Submit flow:**
1. Client-side validation — checks required fields
2. Calls `onSubmit(formData)` — the parent page handles whether this is create or update
3. On success: `onClose()` is called
4. On error: error message is displayed inside the modal

**Modal close on backdrop click:** The outer `modal-overlay` div has `onClick={(e) => e.target === e.currentTarget && onClose()}`. Because the modal card is a child element, clicks on the card do not match `e.currentTarget` (the overlay) and don't trigger the close.

---

### StaffForm

**File:** `src/components/StaffForm.tsx`

Modal form for creating a new staff member.

**Fields:** Full Name, Email Address, Password

**Validation:**
- All fields required
- Password minimum 6 characters

No edit mode — staff details cannot be edited after creation (only deactivate or delete).

---

### CategoryForm

**File:** `src/components/CategoryForm.tsx`

Modal form for creating or editing a category.

**Fields:** Category Name (required), Description (optional textarea)

**Edit mode:** Accepts optional `category` prop. If provided, pre-fills the form with `useEffect`.

---

## Global Styles

**File:** `src/styles/index.css`

All styles are in a single global CSS file using CSS custom properties (variables) for theming. There are no CSS modules, no styled-components, no Tailwind — pure vanilla CSS.

### Design Tokens

```css
:root {
  /* Backgrounds — layered from darkest to lightest */
  --bg-base:       #0f0f11;   /* page background */
  --bg-surface:    #17171b;   /* sidebar, cards, tables */
  --bg-elevated:   #1e1e24;   /* table headers, input backgrounds */
  --bg-hover:      #26262e;   /* hover states */

  /* Borders */
  --border:        #2a2a34;   /* default border */
  --border-light:  #33333f;   /* hover/focus border */

  /* Text */
  --text-primary:   #f0ede8;  /* main content text */
  --text-secondary: #9896a0;  /* labels, secondary info */
  --text-muted:     #55535e;  /* timestamps, hints, disabled */

  /* Accent */
  --accent:         #f5a623;  /* primary interactive colour — buttons, active states */
  --accent-subtle:  rgba(245,166,35,0.08);  /* very faint amber tint */

  /* Status colours */
  --status-valid:        #2dbe6c;
  --status-valid-bg:     rgba(45,190,108,0.1);
  --status-expiring:     #f5a623;
  --status-expiring-bg:  rgba(245,166,35,0.1);
  --status-expired:      #e8453c;
  --status-expired-bg:   rgba(232,69,60,0.1);

  /* Typography */
  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;

  /* Layout */
  --sidebar-w: 240px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

### Layout Classes

| Class | Description |
|---|---|
| `.app-shell` | Flex container for sidebar + content |
| `.main-content` | Right side, `margin-left: 240px` on desktop |
| `.page-container` | Content padding (`32px`) with `max-width: 1200px` |
| `.sidebar` | Fixed left panel, `240px` wide, full height |
| `.topbar` | Mobile-only sticky header, `display: none` on desktop |
| `.sidebar-overlay` | Mobile dark backdrop, `display: none` by default |

### Component Classes

| Class | Description |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost` | Button variants |
| `.btn-sm` | Smaller padding/font button |
| `.stat-card`, `.stat-card.valid`, `.stat-card.expiring`, etc. | Dashboard stat cards |
| `.table-wrap` | Card container for tables |
| `.table-scroll` | Horizontal scroll wrapper |
| `.badge`, `.badge-valid`, `.badge-expiring`, `.badge-expired` | Status badges |
| `.modal-overlay`, `.modal` | Modal backdrop and card |
| `.modal-header`, `.modal-body`, `.modal-footer` | Modal sections |
| `.input-group` | Label + input vertical stack |
| `.input-row` | Two-column input grid |
| `.search-wrap`, `.search-input`, `.search-icon` | Search input with icon |
| `.filter-select` | Styled dropdown select |
| `.toolbar`, `.toolbar-left`, `.toolbar-right` | Filter/action bar layout |
| `.alert-item`, `.alert-item.unread`, `.alert-icon` | Alert list items |
| `.empty-state` | Centered empty placeholder |
| `.loader-wrap`, `.spinner` | Loading state |
| `.error-msg`, `.success-msg` | Inline feedback messages |
| `.login-page`, `.login-card` | Login page layout |
| `.card`, `.card-header`, `.card-body` | Generic content card |
| `.td-mono`, `.td-actions` | Table cell variants |
| `.nav-link`, `.nav-link.active`, `.nav-icon`, `.nav-badge` | Sidebar navigation |

### Responsive Breakpoints

**`@media (max-width: 768px)` — Tablet/Mobile:**
- `margin-left: 0` on `.main-content` (sidebar no longer pushed content)
- `transform: translateX(-100%)` on `.sidebar` (hidden off-screen by default)
- `.sidebar.open` → `transform: translateX(0)` (slides in when menu opened)
- `.sidebar-overlay.visible` → `display: block` (dark backdrop shows)
- `.topbar` → `display: flex` (hamburger menu bar appears)
- `.page-container` padding reduces to `20px 16px`
- `.input-row` → `grid-template-columns: 1fr` (stacks vertically)
- `.stats-grid` → `repeat(2, 1fr)` (2 columns instead of 5)

**`@media (max-width: 480px)` — Small Mobile:**
- `.stats-grid` → `1fr 1fr` with reduced gap
- `.login-card` padding reduces
- `.page-container` padding reduces further
- Modal inner sections reduce padding

---

## State Management Pattern

The application uses a **three-layer state pattern**:

```
Global State   → React Context (AuthContext)
               → Stores: current user, token, role
               → Shared: all components

Server State   → Custom Hooks (useProducts, useCategories, useAlerts)
               → Stores: fetched data, loading/error flags
               → Shared: within a page and its children

Local State    → useState inside components
               → Stores: modal open/close, form values, filter selections
               → Shared: not shared (component-local only)
```

There is no Redux, Zustand, or other state management library. React's built-in `useState`, `useEffect`, `useContext`, and `useCallback` cover everything the application needs.

---

## Data Flow

### Example: Staff member adds a product

```
1. Staff clicks "+ Add Product"
   → setShowForm(true), setEditProduct(null) in ProductsPage

2. ProductForm modal renders with empty fields
   → categories loaded from useCategories() already in memory

3. Staff fills form, clicks "Add Product"
   → handleSubmit() fires
   → calls onSubmit(formData) → createProduct(data) from useProducts()
   → createProductApi(data) → POST /api/products
   → Backend: validates, sets addedBy = req.user._id, saves to MongoDB
   → Backend: populates category and addedBy, returns full product object

4. useProducts.createProduct receives response
   → setProducts(prev => [newProduct, ...prev])
   → ProductsPage re-renders with new product at top of list

5. ProductForm calls onClose()
   → setShowForm(false) in ProductsPage
   → Modal unmounts
```

### Example: Expiry checker creates an alert

```
1. Midnight cron fires → runExpiryCheck()
2. Fetches all products
3. For each product with status change:
   → Updates product.status in MongoDB
4. For products that are expired/expiring_soon:
   → Creates Alert document in MongoDB
5. Sends email to all active users (if email configured)

6. Next time user visits /alerts:
   → useAlerts() calls getAlertsApi()
   → New alerts appear in the list
   → Sidebar unread badge updates on next Sidebar mount
```

---

## Permission Enforcement on the Frontend

**Two types of permission enforcement exist:**

**1. Route-level (AdminRoute component):**
- `/staff` and `/categories` are completely inaccessible to staff users
- Attempting to navigate to these URLs redirects to `/dashboard`

**2. UI-level (conditional rendering):**
- Sidebar admin links (`<Categories>`, `<Staff>`) only render `{isAdmin && (...)}` 
- Edit/Delete buttons in `ProductTable` only render if `canEdit(product)` returns true
- "Deactivate" button in `StaffPage` only shows for active staff

**3. API-level (the real enforcement — backend):**
The frontend permission checks are UX conveniences, not security. The real enforcement is in the backend middleware. Even if someone bypasses the frontend, the API will return 403 for any unauthorised operation. The frontend just avoids showing options the user cannot use.

---

## Export Feature

**How the export pipeline works end to end:**

```
User clicks "↓ CSV" on Products page
     ↓
exportProductsCSV({ status: 'expired' }) called
     ↓
api.get('/export/products/csv', { params, responseType: 'text' })
     ↓
Vite proxy forwards to http://localhost:5000/api/export/products/csv?status=expired
     ↓
Backend: queries MongoDB, builds CSV string, sets Content-Disposition header
     ↓
Axios receives response as text string
     ↓
downloadFile(data, 'products.csv', 'text/csv')
     ↓
Creates Blob → Object URL → invisible <a> element → .click()
     ↓
Browser shows download dialog / auto-downloads file
     ↓
<a> element removed, Object URL revoked
```

The PDF export works identically but the downloaded file is an `.html` file with embedded styles. The user opens it in a browser and uses the browser's print function (Ctrl+P → Save as PDF) to get a true PDF if needed.