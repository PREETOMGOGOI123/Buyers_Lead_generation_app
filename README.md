# 🏠 Buyer Lead Management System

A full-stack Next.js application for managing real estate buyer leads with advanced filtering, CSV import/export, and ownership-based access control.

## 🚀 Features

### Core Functionality
- **🔐 Simple Authentication**: Email-based login with auto-registration
- **📝Operations**: Create, view, edit(Not working)
- **🔍 Advanced Search & Filtering**: Real-time search with  filters
- **📊 Server-Side Pagination**: Data handling with 10 items per page
- **📁 CSV Import/Export**: Bulk operations with validation and error reporting
- **👤 Ownership Control**: Users can only modify their own leads
- **✅ Comprehensive Validation**: Client and server-side validation with Zod

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS + DaisyUI
- **Validation**: Zod
- **Authentication**: Cookie-based sessions
- **CSV Processing**: Papaparse

## 📁 Complete Project Structure

```
buyer-lead-app/
│
├── 📂 app/                          # Next.js App Router directory
│   ├── 📂 api/                      # API routes
│   │   ├── 📂 auth/                 # Authentication endpoints
│   │   │   ├── 📂 login/
│   │   │   │   └── route.ts         # POST: Login/auto-register endpoint
│   │   │   └── 📂 logout/
│   │   │       └── route.ts         # POST: Logout endpoint
│   │   └── 📂 buyers/               # Buyer CRUD endpoints
│   │       ├── route.ts             # GET: List buyers, POST: Create buyer
│   │       ├── 📂 [id]/             # Dynamic route for specific buyer
│   │       │   └── route.ts         # GET/PATCH/DELETE single buyer
│   │       ├── 📂 import/
│   │       │   └── route.ts         # POST: Bulk import buyers from CSV
│   │       └── 📂 export/
│   │           └── route.ts         # GET: Export buyers to CSV
│   │
│   ├── 📂 buyers/                   # Buyer management pages
│   │   ├── layout.tsx               # Buyers section layout with navbar
│   │   ├── page.tsx                 # Buyer list page (SSR)
│   │   ├── 📂 new/
│   │   │   └── page.tsx             # Create new buyer form
│   │   ├── 📂 [id]/                 # Dynamic route for buyer details
│   │   │   ├── page.tsx             # View buyer details
│   │   │   └── 📂 edit/
│   │   │       └── page.tsx         # Edit buyer page
│   │   ├── 📂 import/
│   │   │   └── page.tsx             # CSV import interface
│   │   └── 📂 export/
│   │       └── page.tsx             # CSV export page
│   │
│   ├── 📂 login/
│   │   └── page.tsx                 # Login page
│   ├── layout.tsx                   # Root layout with HTML structure
│   ├── page.tsx                     # Home page (redirects to /buyers or /login)
│   └── globals.css                  # Global styles
│
├── 📂 components/                   # Reusable React components
│   ├── navbar.tsx                   # Navigation bar with user menu
│   ├── buyer-filters.tsx            # Search and filter controls
│   ├── buyer-table.tsx              # Data table with quick actions
│   ├── edit-buyer-form.tsx          # Reusable edit form component
│   └── pagination.tsx               # Pagination controls
│
├── 📂 lib/                          # Utility functions and configurations
│   ├── auth.ts                      # Authentication utilities
│   ├── prisma.ts                    # Prisma client singleton
│   └── 📂 validations/
│       └── buyer.ts                 # Zod schemas and validation rules
│
├── 📂 prisma/                       # Database configuration
│   ├── schema.prisma                # Database schema definition
│   ├── 📂 migrations/               # Database migrations (auto-generated)
│   └── dev.db                       # SQLite database file
│
├── 📂 __tests__/                    # Test files
│   └── buyer-validation.test.ts     # Unit tests for validation
│
├── 📂 public/                       # Static files
│   └── (static assets)
│
├── middleware.ts                    # Next.js middleware for route protection
├── .env                            # Environment variables
├── .gitignore                      # Git ignore file
├── next.config.js                  # Next.js configuration
├── package.json                    # Project dependencies
├── tailwind.config.ts              # Tailwind + DaisyUI configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 📝 File Descriptions

### 🔐 Authentication System

| File | Purpose |
|------|---------|
| `middleware.ts` | Runs before every request, checks session cookies, redirects unauthorized users |
| `lib/auth.ts` | Core auth utilities: `setSession()`, `getSession()`, `getCurrentUser()`, `logout()` |
| `app/api/auth/login/route.ts` | Login endpoint that auto-creates users if they don't exist |
| `app/api/auth/logout/route.ts` | Clears session cookie and logs user out |
| `app/login/page.tsx` | Login UI with email-only authentication |

### 📊 Database & Validation

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Defines database tables: User, Buyer, BuyerHistory |
| `lib/prisma.ts` | Prisma client singleton to prevent connection exhaustion |
| `lib/validations/buyer.ts` | Zod schemas, validation rules, enums (cities, property types, etc.) |
| `prisma/dev.db` | SQLite database file containing all data |

### 🏠 Buyer Management Pages

| File | Purpose |
|------|---------|
| `app/buyers/layout.tsx` | Wrapper with navbar, authentication check |
| `app/buyers/page.tsx` | **Server Component** - Lists buyers with filters, search, pagination |
| `app/buyers/new/page.tsx` | **Client Component** - Form to create new buyer |
| `app/buyers/[id]/page.tsx` | **Server Component** - View buyer details and history |
| `app/buyers/[id]/edit/page.tsx` | **Server Component** - Fetches buyer, renders edit form |
| `app/buyers/import/page.tsx` | **Client Component** - CSV upload and validation |
| `app/buyers/export/page.tsx` | **Client Component** - Triggers CSV download |

### 🔌 API Routes

| File | HTTP Methods | Purpose |
|------|--------------|---------|
| `app/api/buyers/route.ts` | GET, POST | List all buyers (with filters), Create new buyer |
| `app/api/buyers/[id]/route.ts` | GET, PATCH, DELETE | Single buyer operations |
| `app/api/buyers/import/route.ts` | POST | Bulk import with transaction |
| `app/api/buyers/export/route.ts` | GET | Generate and download CSV |

### 🧩 Reusable Components

| Component | Purpose |
|-----------|---------|
| `navbar.tsx` | Navigation bar with menu, logout functionality |
| `buyer-filters.tsx` | Search box with debouncing, dropdown filters, URL state management |
| `buyer-table.tsx` | Data table with quick status updates, formatting, action buttons |
| `edit-buyer-form.tsx` | Reusable form for editing buyers with validation |
| `pagination.tsx` | Page navigation with first/last shortcuts |

### 🛡️ Security & Utils

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, session validation, redirects |
| `lib/auth.ts` | Session management, cookie handling, user fetching |

## 🔄 Data Flow Examples

### 1. **Creating a New Lead**
```
User fills form → Client validation (Zod) → POST /api/buyers 
→ Create history entry → Return response → Redirect to list
```

### 2. **Searching/Filtering**
```
User types in search → Debounce 500ms → Update URL params 
→ Server component re-renders → Prisma query with filters 
→ Return filtered results → Display in table
```

### 3. **Quick Status Update**
```
User selects new status → PATCH /api/buyers/[id] 
→ Check ownership → Update DB → Create history 
→ Refresh page → Show updated status
```

### 4. **CSV Import Flow**
```
Upload CSV → Parse with Papaparse → Client validation 
→ Show errors → POST valid rows → Transaction insert 
→ Create history for each → Success message
```

## 🎯 Key Design Patterns

| Pattern | Implementation |
|---------|----------------|
| **Server Components by Default** | Pages fetch data on server for better SEO and performance |
| **Client Components for Interactivity** | Forms and filters use 'use client' for state management |
| **URL as State** | Filters stored in URL for shareable/bookmarkable searches |
| **Optimistic Updates** | Status changes show immediately while API processes |
| **Transaction Pattern** | Buyer + history created atomically for data consistency |
| **Singleton Pattern** | Single Prisma instance prevents connection issues |
| **Middleware Pattern** | Centralized auth checks before route handling |

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone and install:**
```bash
git clone <your-repo-url>
cd buyer-lead-app
npm install
```

2. **Set up environment:**
```bash
echo "DATABASE_URL=\"file:./dev.db\"" > .env
```

3. **Initialize database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db push
```
**View the Database**
```bash
npx prisma studio
```

4. **Run development server:**
```bash
npm run dev
```

5. **Access the app:**
Open [http://localhost:3000](http://localhost:3000)


## 📊 Database Schema

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `name`: Optional display name
- `createdAt`: Timestamp

### Buyers Table
- `id`: UUID primary key
- `fullName`, `email`, `phone`: Contact info
- `city`, `propertyType`, `bhk`: Property preferences
- `purpose`: Buy/Rent
- `budgetMin`, `budgetMax`: Budget range
- `timeline`, `source`, `status`: Lead metadata
- `notes`, `tags`: Additional info
- `ownerId`: Foreign key to Users
- `createdAt`, `updatedAt`: Timestamps

### BuyerHistory Table
- `id`: UUID primary key
- `buyerId`: Foreign key to Buy

## Missing Features and Known Issues

### **Edit Functionality**
There are some irregularities in the **edit entry feature**. The issue is likely within the `edit-buyer-form.tsx` component, but the *specific problem is yet to be identified*.

### **Import and Export**
This feature is **not properly implemented**. As I am new to this functionality, it requires more time to fully understand and implement correctly.

### **Delete Functionality**
The delete feature is currently **missing**. I am still working on the proper *authentication and authorization logic* required for this functionality.

---

## Project Reflection

This project has been a **valuable learning experience**. Although I've used *AI to assist in development* and have limited prior experience with **TypeScript** and **Next.js**, my background with *SvelteKit* has helped me understand the data flow. 

I have learned a great deal and am confident that with a **couple more weeks**, I can complete the remaining work with a *moderate understanding* of the technologies used in this project.

### Key Learnings
- **Data flow patterns** 
- **TypeScript** and **Next.js** fundamentals
- *AI-assisted development* workflows
- Authentication and authorization concepts
