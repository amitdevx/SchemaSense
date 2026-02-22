# 🎯 COMPLETE HACKATHON PROJECT GUIDE
## SchemaSense - AI-Powered Database Intelligence Platform

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Connection & Architecture](#database-connection--architecture)
4. [HTTPS/Security Implementation](#httpssecurity-implementation)
5. [Features & Modules](#features--modules)
6. [API Architecture](#api-architecture)
7. [Authentication Flow](#authentication-flow)
8. [Project Structure](#project-structure)
9. [Data Flow](#data-flow)
10. [Deployment](#deployment)
11. [Key Features & Definitions](#key-features--definitions)

---

## PROJECT OVERVIEW

### **What is SchemaSense?**

SchemaSense is an **AI-powered Database Intelligence Platform** that enables developers and database administrators to:

- **Instantly understand** complex database schemas using AI
- **Ask natural language questions** about database structure
- **Connect multiple databases** (PostgreSQL, MySQL, MSSQL)
- **Generate documentation** automatically in Markdown format
- **Export schemas** for easy sharing and reference

### **Problem Solved**
When developers work with unfamiliar databases, understanding the schema, relationships, and purpose of tables/columns takes significant time. SchemaSense accelerates this with AI-powered explanations.

### **Target Users**
- 👨‍💻 Backend Developers
- 👨‍💼 Database Administrators (DBA)
- 📊 Data Teams
- 🔄 Team Onboarding processes

---

## TECHNOLOGY STACK

### **FRONTEND**
```
┌─ Framework: Next.js 15 (React 19)
├─ UI Library: Radix UI + Tailwind CSS
├─ State Management: React Hooks + Custom Hooks
├─ Forms: React Hook Form + Zod validation
├─ Charts: Recharts
├─ Animations: Framer Motion, Three.js
└─ Styling: Tailwind CSS v3
```

**Frontend Technologies Explained:**
- **Next.js**: React framework with server-side rendering (SSR), static generation, and API routes
- **Radix UI**: Unstyled, accessible component library
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Zod**: TypeScript-first schema validation

### **BACKEND**
```
┌─ Framework: FastAPI (Python)
├─ Server: Uvicorn (ASGI server)
├─ Database: PostgreSQL + asyncpg
├─ Auth: JWT + Bcrypt
├─ AI: OpenRouter API (DeepSeek LLM)
└─ Validation: Pydantic models
```

**Backend Technologies Explained:**
- **FastAPI**: Modern Python web framework with automatic API documentation
- **Uvicorn**: ASGI (Asynchronous Server Gateway Interface) web server
- **asyncpg**: Async PostgreSQL driver (non-blocking database queries)
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism
- **Bcrypt**: Password hashing algorithm (one-way encryption)
- **Pydantic**: Data validation using Python type annotations

### **DATABASE**
```
┌─ Primary: PostgreSQL
├─ Secondary: MySQL, MSSQL (via connection config)
└─ Connection Type: User-provided (multi-database support)
```

---

## DATABASE CONNECTION & ARCHITECTURE

### **How Database Connection Works**

#### **1. Connection Flow Diagram**
```
User enters DB credentials
        ↓
Frontend sends POST /api/connect-db
        ↓
Backend validates with asyncpg
        ↓
Connection stored with unique ID
        ↓
User can switch/manage multiple connections
        ↓
All queries use active connection
```

#### **2. Connection Configuration**

**Backend Environment Variables** (`.env`):
```ini
# Main Database (for user data)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=schemasense
DB_POOL_MIN_SIZE=5          # Minimum pooled connections
DB_POOL_MAX_SIZE=20         # Maximum pooled connections

# AI Service
OPENROUTER_API_KEY=sk-xxxxx

# Security
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server
API_PORT=8000
API_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,https://api.amitdevx.tech
```

**Frontend Environment Variables** (`.env.local`):
```ini
NEXT_PUBLIC_API_URL=https://api.amitdevx.tech
# For local development:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### **3. Connection Pooling Explained**

**What is Connection Pooling?**
- Instead of creating a new database connection per request (slow), we maintain a pool of reusable connections
- Min Size: 5 connections always ready
- Max Size: 20 connections maximum

**Benefits:**
- ⚡ **Performance**: Reuse existing connections (no connection overhead)
- 🛡️ **Stability**: Prevents connection exhaustion
- 💰 **Resource**: Fewer database resources consumed

**Code Implementation** (`backend/utils/database.py`):
```python
# asyncpg creates connection pool automatically
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=DB_POOL_MIN_SIZE,
    max_size=DB_POOL_MAX_SIZE
)
```

#### **4. Multi-Database Support**

Users can connect multiple databases:

```
┌─ Database Connection 1 (id: conn_123)
│  └─ Host: db1.example.com, User: analyst
│
├─ Database Connection 2 (id: conn_456)
│  └─ Host: db2.example.com, User: admin
│
└─ Active Connection: conn_123
   └─ All queries currently use this database
```

**Connection Storage** (in-memory dictionary):
```python
connections = {
    "conn_123": {
        "host": "db1.example.com",
        "port": 5432,
        "database": "analytics",
        "pool": <asyncpg.Pool>
    },
    "conn_456": {
        "host": "db2.example.com",
        "port": 5432,
        "database": "transactions",
        "pool": <asyncpg.Pool>
    }
}

active_connection = "conn_123"
```

---

## HTTPS/SECURITY IMPLEMENTATION

### **1. HTTPS Configuration**

#### **Frontend Deployment (Vercel)**
```
Domain: hackthon-demo-ten.vercel.app
Protocol: HTTPS (auto-enabled)
Certificate: Auto-renewed by Vercel
SSL/TLS: Automatic
```

**How it works:**
- Vercel automatically provisions SSL certificates
- Certificates auto-renew before expiration
- All traffic redirected HTTP → HTTPS

#### **Backend Deployment (Azure VM + Nginx)**
```
Domain: api.amitdevx.tech
Protocol: HTTPS (custom domain)
Reverse Proxy: Nginx
Certificate: Let's Encrypt (auto-renewed)
```

**Nginx Configuration** (reverse proxy):
```nginx
server {
    listen 443 ssl;
    server_name api.amitdevx.tech;
    
    ssl_certificate /etc/letsencrypt/live/api.amitdevx.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amitdevx.tech/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

### **2. Authentication Security**

#### **JWT (JSON Web Token) Flow**

```
User Login
    ↓
Backend validates credentials
    ↓
Creates JWT token:
{
    "sub": "user@example.com",
    "exp": 1234567890,
    "iat": 1234567200
}
    ↓
Signs with secret key (HS256 algorithm)
    ↓
Returns token to frontend
    ↓
Frontend stores in localStorage
    ↓
Includes in Authorization header for subsequent requests:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**JWT Definition:**
- **JWT (JSON Web Token)**: A compact, URL-safe method of representing claims to be transferred between parties
- **Stateless**: Server doesn't store token; it verifies the signature
- **Self-contained**: Token includes user info and expiration

**JWT Structure:**
```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwiaWF0IjoxNjk3NzgyMjAwLCJleHAiOjE2OTc4Njg2MDB9.signature
```

#### **Password Security**

**Bcrypt Hashing:**
```python
# Registration
password = "myPassword123"
hashed = bcrypt.hash(password)  # One-way encryption

# Login
entered_password = "myPassword123"
bcrypt.verify(entered_password, hashed)  # Returns True/False
```

**Why Bcrypt?**
- ✅ One-way hashing (cannot be reversed)
- ✅ Salting (adds randomness, prevents rainbow tables)
- ✅ Adaptive (gets slower over time as CPUs improve)
- ✅ Industry standard for password storage

### **3. CORS (Cross-Origin Resource Sharing)**

**What is CORS?**
- Browser security feature preventing unauthorized cross-origin requests
- Protects against malicious websites stealing your data

**SchemaSense CORS Configuration:**
```python
# backend/main.py
CORSMiddleware(
    app,
    allow_origins=["http://localhost:3000", "https://hackthon-demo-ten.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)
```

**Allowed Origins:**
- ✅ `http://localhost:3000` (local development)
- ✅ `https://hackthon-demo-ten.vercel.app` (production frontend)
- ❌ All other origins blocked

### **4. Input Validation**

**Pydantic Models** validate all inputs:
```python
from pydantic import BaseModel, EmailStr, constr

class LoginRequest(BaseModel):
    email: EmailStr                    # Must be valid email
    password: constr(min_length=6)    # At least 6 chars

class ConnectDBRequest(BaseModel):
    host: str
    port: int
    database: str
    user: str
    password: str
```

**Benefits:**
- ✅ Type validation
- ✅ Length constraints
- ✅ Format validation (email, URL, etc.)
- ✅ Automatic error responses

---

## FEATURES & MODULES

### **Core Features**

| Feature | Endpoint | Status | Purpose |
|---------|----------|--------|---------|
| **User Auth** | `POST /auth/register`, `/auth/login` | ✅ Complete | User registration & login |
| **DB Connection** | `POST /api/connect-db` | ✅ Complete | Connect to user's database |
| **Schema Analysis** | `GET /api/tables`, `/api/schema/{table}` | ✅ Complete | List tables and columns |
| **AI Explanation** | `GET /api/explain/{table}` | ✅ Complete | AI-generated schema docs |
| **Chat Q&A** | `POST /api/chat` | ✅ Complete | Natural language questions |
| **Export** | `GET /api/export/{table}` | ✅ Complete | Download schema as Markdown |
| **Data Quality** | `GET /api/quality/{table}` | ✅ Complete | Analyze data patterns |
| **Sample Data** | `GET /api/samples/{table}` | ✅ Complete | View sample rows |
| **Profile Management** | `GET/PUT /api/profile` | ✅ Complete | User profile CRUD |
| **Settings** | `GET/PUT /api/settings` | ✅ Complete | User preferences |
| **Integrations** | `POST/GET /api/integrations` | ✅ Complete | Manage DB connections |
| **Dashboard** | `GET /api/statistics` | ✅ Complete | Overview dashboard |
| **Caching** | `GET/DELETE /api/cache/*` | ✅ Complete | Performance optimization |

### **Frontend Pages**

```
Public Pages:
  / (Landing)
  /product (Product Overview)
  /pricing (Subscription Plans)
  /how-it-works (Feature Tour)
  /docs (API Documentation)
  /support (Help Center)

Auth Pages:
  /(auth)/sign-up (Registration)
  /(auth)/sign-in (Login)
  /(auth)/forgot-password (Password Reset)

Protected Pages (Dashboard):
  /connect-database (Initial Setup)
  /dashboard (Overview)
  /dashboard/analysis (Table Browser)
  /dashboard/analysis/[table] (Column Details)
  /dashboard/chat (AI Chat)
  /dashboard/integrations (Manage Connections)
  /dashboard/exports (Export History)
  /dashboard/profile (User Profile)
  /dashboard/settings (Preferences)
  /dashboard/billing (Subscription)
```

---

## API ARCHITECTURE

### **API Endpoints Summary**

#### **Authentication** (`/api/auth`)
```
POST /auth/register
  Request: { email, password, firstName, lastName }
  Response: { token, user }

POST /auth/login
  Request: { email, password }
  Response: { token, user }

GET /auth/profile
  Headers: Authorization: Bearer <token>
  Response: { user_data }
```

#### **Database Connection** (`/api`)
```
POST /connect-db
  Request: { host, port, database, user, password }
  Response: { connection_id, status }

GET /connection-status
  Response: { connected, database_name, tables_count }

GET /connections
  Response: [{ id, name, status }, ...]

POST /connections/{id}/activate
  Response: { active_connection_id }

DELETE /connections/{id}
  Response: { deleted: true }
```

#### **Schema & Analysis** (`/api`)
```
GET /tables
  Response: [{ name, row_count, schema }, ...]

GET /schema/{table}
  Response: { columns: [{ name, type, nullable, pk }, ...] }

GET /explain/{table}
  Response: { explanation: "AI-generated markdown documentation" }

GET /quality/{table}
  Response: { null_ratio, unique_count, data_types }

GET /samples/{table}
  Response: [{ row1 }, { row2 }, ...]
```

#### **Chat & AI** (`/api`)
```
POST /chat
  Request: { message: "Explain the users table" }
  Response: { response: "AI response", tokens_used: 150 }

POST /chat/stream
  Response: Streaming text response (Server-Sent Events)
```

#### **Export** (`/api`)
```
GET /export/{table}
  Response: Markdown file download

POST /export
  Request: { tables: ["users", "orders"] }
  Response: Zip file with all schemas
```

#### **User Management** (`/api`)
```
GET /profile
  Response: { email, firstName, lastName, organization }

PUT /profile
  Request: { firstName, lastName, organization }
  Response: { updated_user }

POST /logout
  Response: { success: true }
```

#### **Settings** (`/api`)
```
GET /settings
  Response: { theme: "dark", notifications: true, privacy: "private" }

PUT /settings
  Request: { theme, notifications, privacy }
  Response: { updated_settings }
```

#### **Integrations** (`/api`)
```
GET /integrations
  Response: [{ id, name, host, database }, ...]

POST /integrations
  Request: { name, host, port, database, user, password }
  Response: { connection_id }

PUT /integrations/{id}
  Request: Updated connection details
  Response: { updated }

DELETE /integrations/{id}
  Response: { deleted: true }

POST /integrations/{id}/test
  Response: { connected: true, tables_count: 42 }
```

---

## AUTHENTICATION FLOW

### **User Registration Flow**

```
┌─ User enters: email, password, firstName, lastName
│
├─ Frontend validates with Zod schema
│
├─ Send POST /auth/register
│  └─ { email, password, firstName, lastName }
│
├─ Backend receives request
│  ├─ Validate email format
│  ├─ Hash password with Bcrypt
│  ├─ Create user in database
│  └─ Generate JWT token
│
├─ Response: { token, user }
│  └─ token: "eyJhbGciOiJIUzI1NiIs..." (24hr expiration)
│
├─ Frontend stores in localStorage
│  └─ localStorage.setItem("token", token)
│
└─ Redirect to /dashboard
   └─ User logged in automatically
```

### **User Login Flow**

```
┌─ User enters: email, password
│
├─ Send POST /auth/login
│  └─ { email, password }
│
├─ Backend validates
│  ├─ Find user by email
│  ├─ Verify password with Bcrypt
│  ├─ If valid, generate JWT
│  └─ If invalid, return 401 Unauthorized
│
├─ Response: { token, user }
│
├─ Frontend stores token
│
└─ Redirect to /dashboard
```

### **Token Usage for Protected Requests**

```
┌─ Frontend wants to fetch tables
│
├─ Get token from localStorage
│
├─ Make request with Authorization header:
│  └─ GET /api/tables
│     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
│
├─ Backend middleware validates token
│  ├─ Extract Bearer token
│  ├─ Verify signature with secret key
│  ├─ Check expiration
│  └─ Get user_id from token payload
│
├─ If valid: Process request as this user
│  └─ Return tables data
│
└─ If invalid: Return 401 Unauthorized
   └─ Frontend redirects to /sign-in
```

### **Token Expiration Handling**

```
24 Hours Later:
  ├─ Token expires (exp claim reached)
  │
  ├─ User makes request with expired token
  │
  ├─ Backend returns 401 Unauthorized
  │
  ├─ Frontend detects 401
  │  ├─ Clears localStorage
  │  └─ Redirects to /sign-in
  │
  └─ User must login again to get new token
```

---

## PROJECT STRUCTURE

### **Frontend Directory Structure**

```
hackthon-git/
├── app/
│   ├── (main)/                    # Public pages group
│   │   ├── page.tsx              # Homepage
│   │   ├── product/page.tsx      # Product overview
│   │   ├── pricing/page.tsx      # Pricing page
│   │   ├── how-it-works/page.tsx # Tutorial
│   │   ├── docs/page.tsx         # API docs
│   │   └── support/page.tsx      # Support page
│   │
│   ├── (auth)/                    # Auth pages group
│   │   ├── sign-up/page.tsx
│   │   ├── sign-in/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── connect-database/         # DB connection setup
│   │   └── page.tsx
│   │
│   ├── dashboard/                # Protected dashboard
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── analysis/page.tsx     # Table list
│   │   ├── analysis/[table]/page.tsx  # Table detail
│   │   ├── chat/page.tsx         # AI Chat
│   │   ├── integrations/page.tsx # Manage connections
│   │   ├── exports/page.tsx      # Export management
│   │   ├── profile/page.tsx      # User profile
│   │   ├── settings/page.tsx     # Settings
│   │   └── billing/page.tsx      # Billing/Subscription
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                        # Radix UI components
│   │   ├── button.tsx, input.tsx, card.tsx, etc.
│   ├── header.tsx                # Navigation
│   ├── footer.tsx                # Footer
│   ├── dashboard-sidebar.tsx     # Sidebar
│   ├── connection-status.tsx     # Connection indicator
│   └── [other components]
│
├── hooks/
│   ├── useAuth.ts                # Auth state hook
│   ├── useDatabase.ts            # Database state
│   ├── useDashboard.ts           # Dashboard data
│   └── useChat.ts                # Chat functionality
│
├── lib/
│   ├── api-client.ts             # API methods
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts                  # Helpers
│
├── styles/
│   └── (Tailwind CSS)
│
└── public/
    └── (images, icons, fonts)
```

### **Backend Directory Structure**

```
backend/
├── main.py                       # FastAPI app initialization
├── config.py                     # Environment configuration
├── requirements.txt              # Python dependencies
│
├── routes/
│   ├── auth.py                  # Auth endpoints
│   ├── connection.py            # DB connection endpoints
│   ├── tables.py                # Schema analysis endpoints
│   ├── chat.py                  # Chat endpoint
│   ├── chat_stream.py           # Streaming chat
│   ├── export.py                # Export endpoint
│   ├── dashboard.py             # Dashboard endpoints
│   ├── profile.py               # Profile endpoints
│   ├── settings.py              # Settings endpoints
│   ├── integrations.py          # Integration endpoints
│   └── cache.py                 # Cache endpoints
│
├── utils/
│   ├── database.py              # DB connection pooling
│   ├── auth.py                  # JWT & password utilities
│   ├── deepseek_client.py       # OpenRouter AI client
│   ├── db_wrapper.py            # Query wrappers
│   ├── schema_queries.py        # Schema introspection
│   └── cache_db.py              # Caching utilities
│
├── models/
│   └── cache.py
│
├── schemas/
│   └── __init__.py              # Pydantic models
│
└── data/
    └── schema.sql               # Database schema
```

---

## DATA FLOW

### **Complete Data Flow Diagram**

```
┌──────────────────┐
│  User Browser    │
│  (Frontend)      │
└────────┬─────────┘
         │
         │ HTTPS Request
         │ Authorization: Bearer <token>
         ▼
┌──────────────────────┐
│  Next.js App Router  │
│  (/dashboard, etc)   │
└────────┬─────────────┘
         │
         │ API Call (lib/api-client.ts)
         │
         ▼
┌──────────────────────────┐
│  FastAPI Backend         │
│  (Uvicorn Server)        │
└────────┬─────────────────┘
         │
         ├─→ Auth Middleware (verify JWT)
         │
         ├─→ Route Handler
         │   ├─ /auth routes
         │   ├─ /api/connect-db routes
         │   ├─ /api/tables routes
         │   ├─ /api/chat routes
         │   └─ /api/export routes
         │
         ▼
┌────────────────────────────┐
│  Main PostgreSQL Database  │
│  (User data, connections)  │
└────────┬───────────────────┘
         │
         │ (Async Pool: 5-20 connections)
         │
         ▼
┌────────────────────────────┐
│  User's Connected Database │
│  (Schema analysis queries) │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  OpenRouter API            │
│  (DeepSeek LLM)            │
│  (For AI explanations)     │
└────────────────────────────┘
```

### **Example: User asks "Explain the users table"**

```
1. User types: "Explain the users table"
   └─ Frontend: /dashboard/chat

2. Frontend sends POST /api/chat
   ├─ Message: "Explain the users table"
   ├─ Token: "eyJhbGciOiJIUzI1NiIs..."
   └─ HTTPS: Encrypted transmission

3. Backend receives request
   ├─ Validates JWT token
   ├─ Fetches active database connection
   ├─ Queries "users" table schema via SQL
   ├─ Gets column info (names, types, constraints)
   └─ Response: [{ name: "id", type: "integer", pk: true }, ...]

4. Backend calls OpenRouter API (DeepSeek)
   ├─ Sends: Table schema + user question
   ├─ Prompts DeepSeek LLM
   └─ Gets: "The users table stores..."

5. Backend returns response
   ├─ Response: { response: "The users table stores...", tokens_used: 150 }
   └─ HTTPS: Encrypted transmission

6. Frontend displays response
   ├─ Renders as Markdown
   ├─ Shows to user
   └─ Updates chat history

✅ Complete! User has explanation.
```

---

## DEPLOYMENT

### **Frontend Deployment**

**Platform:** Vercel  
**URL:** https://hackthon-demo-ten.vercel.app

**Features:**
- ✅ Automatic deployment on git push
- ✅ Auto-generated SSL certificates
- ✅ Global CDN for fast delivery
- ✅ Automatic environment variables

**How to Deploy:**
```bash
# Vercel automatically watches your GitHub repo
# Commits to main branch trigger automatic deployment
# No manual action needed!
```

### **Backend Deployment**

**Platform:** Azure VM (Linux)  
**URL:** https://api.amitdevx.tech

**Architecture:**
```
┌─ Azure VM (Linux)
│  ├─ Nginx (Reverse Proxy)
│  │  ├─ Handles HTTPS/SSL
│  │  └─ Forwards to Uvicorn
│  │
│  └─ Uvicorn Server
│     ├─ Runs FastAPI app
│     ├─ Port 8000 (localhost)
│     └─ Processes requests
│
└─ SSL Certificate
   └─ Let's Encrypt (auto-renewed)
```

**Deployment Steps:**
```bash
# SSH into Azure VM
ssh user@api.amitdevx.tech

# Clone repository
git clone https://github.com/amitdevx/hackthon-git.git
cd hackthon-git/backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=...
export DB_USER=...
# ... all other env vars

# Run with systemd or screen
systemctl start schemasense
# or
screen -S schemasense
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.amitdevx.tech;
    
    ssl_certificate /etc/letsencrypt/live/api.amitdevx.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amitdevx.tech/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.amitdevx.tech;
    return 301 https://$server_name$request_uri;
}
```

---

## KEY FEATURES & DEFINITIONS

### **AI Integration: OpenRouter + DeepSeek**

**OpenRouter:**
- A unified API for multiple LLMs (Large Language Models)
- Provides access to models like DeepSeek, GPT-4, Claude, etc.
- Allows cost-effective usage with fallback options

**DeepSeek:**
- An open-source LLM (Language Model) trained on diverse data
- Understands code, databases, and technical concepts
- Cost-effective compared to GPT-4

**Integration Flow:**
```python
# backend/utils/deepseek_client.py
import httpx

async def get_schema_explanation(table_schema: str) -> str:
    # Send request to OpenRouter API
    response = await httpx.AsyncClient().post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        },
        json={
            "model": "deepseek/deepseek-chat",
            "messages": [{
                "role": "user",
                "content": f"Explain this database table:\n{table_schema}"
            }]
        }
    )
    
    return response.json()["choices"][0]["message"]["content"]
```

### **Connection Pooling Deep Dive**

**Why it matters:**
- **Without pooling:** Each request creates new connection (slow, resource-intensive)
- **With pooling:** Reuses existing connections (fast, efficient)

**Example:**
```
Without pooling:
Request 1 → Create connection → Query → Close → 100ms
Request 2 → Create connection → Query → Close → 100ms
Total: 200ms (sequential)

With pooling (5 pre-created connections):
Request 1 → Use connection #1 → Query → Return to pool → 20ms
Request 2 → Use connection #2 → Query → Return to pool → 20ms
Total: 20ms (parallel) ⚡ 10x faster!
```

### **Async Programming (asyncpg)**

**What is Async?**
- Allows multiple operations without blocking
- While waiting for database, server processes other requests

**Example:**
```python
# Synchronous (blocking)
user = db.query("SELECT * FROM users WHERE id=1")  # Waits 100ms
order = db.query("SELECT * FROM orders WHERE user_id=1")  # Waits 100ms
Total: 200ms

# Asynchronous (non-blocking)
user, order = await asyncio.gather(
    async_db.query("SELECT * FROM users WHERE id=1"),      # 100ms
    async_db.query("SELECT * FROM orders WHERE user_id=1") # 100ms
)  # Both run in parallel
Total: 100ms ⚡ 2x faster!
```

### **Schema Introspection**

**What it is:**
- Querying database metadata (tables, columns, constraints)
- Not querying actual data, but structure

**Example Queries:**
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Get column info
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Get constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users';
```

### **Streaming Responses**

**Standard Response:**
```
Request → Processing... → Complete response sent
```

**Streaming Response:**
```
Request → Processing starts
        ├─ Chunk 1 sent (explanation starts...)
        ├─ Chunk 2 sent (continues...)
        ├─ Chunk 3 sent (...)
        └─ Chunk N sent (complete!)
```

**Benefits:**
- User sees response appearing in real-time
- Better UX for long responses
- Server doesn't have to wait for complete response

**Implementation (Server-Sent Events):**
```python
@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generate():
        response = await deepseek_client.stream_response(request.message)
        async for chunk in response:
            yield f"data: {chunk}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

## QUICK REFERENCE FOR JUDGES

### **Key Technologies**
| What | Why | Status |
|------|-----|--------|
| Next.js 15 | Modern React with SSR | ✅ Implemented |
| FastAPI | Fast async Python framework | ✅ Implemented |
| PostgreSQL | Reliable ACID compliant database | ✅ Implemented |
| JWT Auth | Stateless authentication | ✅ Implemented |
| OpenRouter | AI integration via unified API | ✅ Implemented |
| Tailwind CSS | Rapid UI development | ✅ Implemented |
| Radix UI | Accessible components | ✅ Implemented |

### **Security Checklist**
- ✅ HTTPS enforced (both frontend & backend)
- ✅ JWT tokens with 24hr expiration
- ✅ Bcrypt password hashing
- ✅ CORS properly configured
- ✅ Input validation via Pydantic
- ✅ Connection pooling prevents DoS
- ✅ Environment variables for secrets
- ✅ No sensitive data in logs

### **Performance Features**
- ✅ Connection pooling (5-20 connections)
- ✅ Async/await throughout backend
- ✅ Frontend caching with React Query (if used)
- ✅ CDN delivery via Vercel
- ✅ Nginx reverse proxy with caching

### **Scalability Features**
- ✅ Multi-database support
- ✅ Connection pooling
- ✅ Stateless backend (can scale horizontally)
- ✅ Frontend CDN delivery
- ✅ Async database queries

---

## TROUBLESHOOTING COMMON QUESTIONS

### **Q: How are user credentials stored?**
**A:** User passwords are hashed with Bcrypt (one-way encryption). Database credentials for connected databases are stored in memory only, not persisted to database for security.

### **Q: What if a database connection fails?**
**A:** Backend validates connection before storing. If connection fails, 400 Bad Request is returned with error details.

### **Q: How long do JWT tokens last?**
**A:** 24 hours by default. After expiration, user must login again. This is configurable via `JWT_EXPIRATION_HOURS` environment variable.

### **Q: Can multiple users use different databases simultaneously?**
**A:** Yes! Each user has their own connection pool in memory. Multiple connections can be active across different users without interference.

### **Q: How is HTTPS enforced?**
**A:** 
- Frontend: Vercel auto-provisions SSL certificates
- Backend: Nginx reverse proxy handles SSL/TLS
- Both redirect HTTP → HTTPS automatically

### **Q: What happens if the AI API fails?**
**A:** Backend catches the exception and returns a friendly error message. The application continues to function with basic schema analysis (no AI explanations).

### **Q: Is the database connection secure?**
**A:** Yes! Connections use SSL/TLS encryption by default. Credentials are never logged or exposed.

---

## DEPLOYMENT URLS

**Frontend:** https://hackthon-demo-ten.vercel.app  
**Backend API:** https://api.amitdevx.tech  
**API Documentation:** https://api.amitdevx.tech/docs

---

**Last Updated:** February 2026  
**Project Status:** Production Ready ✅  
**All Features:** Fully Implemented ✅
