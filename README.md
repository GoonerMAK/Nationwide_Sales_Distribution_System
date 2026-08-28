# Nationwide_Sales_Distribution_System
An app that would help sale representatives (SRs) sell products to retailers across a nation. Each SR will be assigned to a list of retailers from a nationwide pool of ~millions. This project focuses on data modelling, performance and scalability. Scalability in terms of software design, root-level performance, readability and maintainability


## Prerequisites

- Node.js 20+
- Docker (for Postgres and Redis)

## Setup

```bash
# 1. Environment files - copy each example and fill in the values
cp .env.example .env                  # docker-compose credentials (postgres user/password/db)
cp server/.env.example server/.env    # DATABASE_URL, SECRET, PORT, REDIS_URL, FRONTEND_URL
cp client/.env.example client/.env.local

# 2. Start Postgres + Redis (both have healthchecks, so `up -d` waits until they are ready)
npm run db:up

# 3. Install dependencies for server and client
npm install          # root runner (concurrently)
npm run install:all

# 4. Apply migrations and seed the database
npm run db:setup

# 5. Run both apps (server on PORT, client on 3000)
npm run dev
```

### Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Runs server and client together |
| `npm run dev:server` / `npm run dev:client` | Runs one of them |
| `npm run build` | Builds both |
| `npm run lint` | Lints both |
| `npm run typecheck` | Type-checks the server |
| `npm run db:up` / `npm run db:down` | Starts / stops Postgres + Redis |
| `npm run db:setup` | `prisma migrate deploy` + seed |
| `npm run prisma:studio --prefix server` | Opens Prisma Studio |

The server also exposes a health check at `GET /health` (also available as `GET /api/health`).

> **Note:** all API routes are mounted under the `/api` prefix, e.g. `POST /api/auth/login`.




## API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/user` | Get authenticated user details | Yes |

### Area APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/area` | Create a new area | Yes |
| PUT | `/api/area/:id` | Update an existing area | Yes |
| DELETE | `/api/area/:id` | Delete an area | Yes |
| GET | `/api/areas` | Get all areas (default: offset=0, limit=10) | Yes |
| GET | `/api/areas?region_id={uuid}&offset={number}&limit={number}` | Get areas with query filters | Yes |
| GET | `/api/area/:id` | Get area by ID | Yes |

### Distributor APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/distributor` | Create a new distributor | Yes |
| PUT | `/api/distributor/:id` | Update an existing distributor | Yes |
| DELETE | `/api/distributor/:id` | Delete a distributor | Yes |
| GET | `/api/distributors` | Get all distributors (default: offset=0, limit=10) | Yes |
| GET | `/api/distributors?name={name}&offset={number}&limit={number}` | Get distributors with query filters | Yes |
| GET | `/api/distributor/:id` | Get distributor by ID | Yes |

### Region APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/region` | Create a new region | Yes |
| PUT | `/api/region/:id` | Update an existing region | Yes |
| DELETE | `/api/region/:id` | Delete a region | Yes |
| GET | `/api/regions` | Get all regions (default: offset=0, limit=10) | Yes |
| GET | `/api/regions?name={name}&offset={number}&limit={number}` | Get regions with query filters | Yes |
| GET | `/api/region/:id` | Get region by ID | Yes |

### Retailer APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/retailer` | Create a new retailer | Yes |
| PUT | `/api/retailer/:id` | Update an existing retailer | Yes |
| DELETE | `/api/retailer/:id` | Delete a retailer | Yes |
| GET | `/api/retailers` | Get all retailers (default: offset=0, limit=10) | Yes |
| GET | `/api/retailers?&assigned={true}` | Get all assigned retailers (default: offset=0, limit=10) | Yes |
| GET | `/api/retailers?distributor_id={uuid}&territory_id={uuid}&point={point}&offset={number}&limit={number}` | Get retailers with query filters | Yes |
| GET | `/api/retailer/:id` | Get retailer by ID | Yes |

### Sales Representative APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/sales-representative` | Create a new sales representative | Yes |
| PUT | `/api/sales-representative/:id` | Update an existing sales representative | Yes |
| DELETE | `/api/sales-representative/:id` | Delete a sales representative | Yes |
| GET | `/api/sales-representatives` | Get all sales representatives (default: offset=0, limit=10) | Yes |
| GET | `/api/sales-representatives?username={username}&territory_id={uuid}&offset={number}&limit={number}` | Get sales representatives with query filters | Yes |
| GET | `/api/sales-representative/:id` | Get sales representative by ID | Yes |

### Territory APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/territory` | Create a new territory | Yes |
| PUT | `/api/territory/:id` | Update an existing territory | Yes |
| DELETE | `/api/territory/:id` | Delete a territory | Yes |
| GET | `/api/territories` | Get all territories (default: offset=0, limit=10) | Yes |
| GET | `/api/territories?name={name}&area_id={uuid}&offset={number}&limit={number}` | Get territories with query filters | Yes |
| GET | `/api/territory/:id` | Get territory by ID | Yes |


## Postman Setup & Usage Guide

### 1. Sign Up (Create New Account)

Create a new user account:
```
POST /api/auth/signup
```

**Request Body (JSON):**
```json
{
  "email": "email@example.com",
  "password": "your_password"
}
```

**Response:** 201 Created

---

### 2. Login

Login with your credentials:
```
POST /api/auth/login
```

**Request Body (JSON):**
```json
{
  "email": "same_email@example.com",
  "password": "your_password"
}
```

**Response:** 200 OK

You will receive a JWT token that looks like this:
```
<HEADER>.<PAYLOAD>.<SIGNATURE>
```

The JWT token consists of three parts separated by periods:
- **Header**: `<HEADER>`
- **Payload**: `<PAYLOAD>`
- **Signature**: `<SIGNATURE>`

**Important:** Copy this entire token for use in subsequent requests via Postman

---

### 3. Setting Up Authentication for Subsequent Requests in Postman

You are now logged in. To authenticate your requests:

1. Go to the **Headers** tab in your request
2. Add a new header:
   - **Key**: `Cookie`
   - **Value**: `jwt=YOUR_TOKEN_HERE`

**Example:**
```
Cookie: jwt=<HEADER>.<PAYLOAD>.<SIGNATURE>
```

---

### 4. Verify Authentication

Check if you are currently authenticated:
```
GET /api/auth/user
```

**Headers:**
```
Cookie: jwt=YOUR_TOKEN_HERE
```

**Response:**
- **Status Code 200**: You are authenticated successfully
- The response will contain your user information

---

### 5. Making Authenticated Requests

**All subsequent requests require authentication.** Always include the Cookie header with your JWT token.

#### Example: Get All Regions
```
GET /api/regions
Headers:
  Cookie: jwt=YOUR_TOKEN_HERE
```

#### Example: Create a New Area
```
POST /api/area
Headers:
  Cookie: jwt=YOUR_TOKEN_HERE
  Content-Type: application/json

Body (JSON):
{
  "name": "Agargaon",
  "region_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Example: Get Retailers with Filters
```
GET /api/retailers?region_id=550e8400-e29b-41d4-a716-446655440000&assigned=true
Headers:
  Cookie: jwt=YOUR_TOKEN_HERE
```

---

### Quick Reference

| Step | Endpoint | Method | Authentication Required |
|------|----------|--------|------------------------|
| 1. Sign Up | `/api/auth/signup` | POST | No |
| 2. Login | `/api/auth/login` | POST | No |
| 3. Verify Auth | `/api/auth/user` | GET | Yes (Cookie with JWT) |
| 4. All Other APIs | Various | Various | Yes (Cookie with JWT) |
