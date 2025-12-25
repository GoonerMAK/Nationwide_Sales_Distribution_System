# Nationwide_Sales_Distribution_System
An app that would help sale representatives (SRs) sell products to retailers across a nation. Each SR will be assigned to a list of retailers from a nationwide pool of ~millions. This project focuses on data modelling, performance and scalability. Scalability in terms of software design, root-level performance, readability and maintainability


Commands in order:

1. docker compose up -d (rename .env.example to .env and set the values accordingly)

2. cd server

3. npm install

4. npx prisma generate

5. npx prisma migrate deploy

6. npm run seed (to populate the database)

7. npm run dev




## API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | No |
| GET | `/auth/user` | Get authenticated user details | Yes |

### Area APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/area` | Create a new area | Yes |
| PUT | `/area/:id` | Update an existing area | Yes |
| DELETE | `/area/:id` | Delete an area | Yes |
| GET | `/areas` | Get all areas (default: offset=0, limit=10) | Yes |
| GET | `/areas?region_id={uuid}&offset={number}&limit={number}` | Get areas with query filters | Yes |
| GET | `/area/:id` | Get area by ID | Yes |

### Distributor APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/distributor` | Create a new distributor | Yes |
| PUT | `/distributor/:id` | Update an existing distributor | Yes |
| DELETE | `/distributor/:id` | Delete a distributor | Yes |
| GET | `/distributors` | Get all distributors (default: offset=0, limit=10) | Yes |
| GET | `/distributors?name={name}&offset={number}&limit={number}` | Get distributors with query filters | Yes |
| GET | `/distributor/:id` | Get distributor by ID | Yes |

### Region APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/region` | Create a new region | Yes |
| PUT | `/region/:id` | Update an existing region | Yes |
| DELETE | `/region/:id` | Delete a region | Yes |
| GET | `/regions` | Get all regions (default: offset=0, limit=10) | Yes |
| GET | `/regions?name={name}&offset={number}&limit={number}` | Get regions with query filters | Yes |
| GET | `/region/:id` | Get region by ID | Yes |

### Retailer APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/retailer` | Create a new retailer | Yes |
| PUT | `/retailer/:id` | Update an existing retailer | Yes |
| DELETE | `/retailer/:id` | Delete a retailer | Yes |
| GET | `/retailers` | Get all retailers (default: offset=0, limit=10) | Yes |
| GET | `/retailers?&assigned={true}` | Get all assigned retailers (default: offset=0, limit=10) | Yes |
| GET | `/retailers?distributor_id={uuid}&territory_id={uuid}&point={point}&offset={number}&limit={number}` | Get retailers with query filters | Yes |
| GET | `/retailer/:id` | Get retailer by ID | Yes |

### Sales Representative APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/sales-representative` | Create a new sales representative | Yes |
| PUT | `/sales-representative/:id` | Update an existing sales representative | Yes |
| DELETE | `/sales-representative/:id` | Delete a sales representative | Yes |
| GET | `/sales-representatives` | Get all sales representatives (default: offset=0, limit=10) | Yes |
| GET | `/sales-representatives?username={username}&territory_id={uuid}&offset={number}&limit={number}` | Get sales representatives with query filters | Yes |
| GET | `/sales-representative/:id` | Get sales representative by ID | Yes |

### Territory APIs

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/territory` | Create a new territory | Yes |
| PUT | `/territory/:id` | Update an existing territory | Yes |
| DELETE | `/territory/:id` | Delete a territory | Yes |
| GET | `/territories` | Get all territories (default: offset=0, limit=10) | Yes |
| GET | `/territories?name={name}&area_id={uuid}&offset={number}&limit={number}` | Get territories with query filters | Yes |
| GET | `/territory/:id` | Get territory by ID | Yes |


## Postman Setup & Usage Guide

### 1. Sign Up (Create New Account)

Create a new user account:
```
POST /auth/signup
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
POST /auth/login
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
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE0NDIyMzA4LWI0OTAtNDcxMC05OGNjLThkNmNmY2Q5YjUwZCIsImlhdCI6MTc2NjY4NDU0MywiZXhwIjoxNzY2OTQzNzQzfQ.DeBwuVVSgmLj8Ikn2NqUKTUO5SaW801OVquAZyAJxII
```

The JWT token consists of three parts separated by periods:
- **Header**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Payload**: `eyJpZCI6ImE0NDIyMzA4LWI0OTAtNDcxMC05OGNjLThkNmNmY2Q5YjUwZCIsImlhdCI6MTc2NjY4NDU0MywiZXhwIjoxNzY2OTQzNzQzfQ`
- **Signature**: `DeBwuVVSgmLj8Ikn2NqUKTUO5SaW801OVquAZyAJxII`

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
Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE0NDIyMzA4LWI0OTAtNDcxMC05OGNjLThkNmNmY2Q5YjUwZCIsImlhdCI6MTc2NjY4NDU0MywiZXhwIjoxNzY2OTQzNzQzfQ.DeBwuVVSgmLj8Ikn2NqUKTUO5SaW801OVquAZyAJxII
```

---

### 4. Verify Authentication

Check if you are currently authenticated:
```
GET /auth/user
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
GET /regions
Headers:
  Cookie: jwt=YOUR_TOKEN_HERE
```

#### Example: Create a New Area
```
POST /area
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
GET /retailers?region_id=550e8400-e29b-41d4-a716-446655440000&assigned=true
Headers:
  Cookie: jwt=YOUR_TOKEN_HERE
```

---

### Quick Reference

| Step | Endpoint | Method | Authentication Required |
|------|----------|--------|------------------------|
| 1. Sign Up | `/auth/signup` | POST | No |
| 2. Login | `/auth/login` | POST | No |
| 3. Verify Auth | `/auth/user` | GET | Yes (Cookie with JWT) |
| 4. All Other APIs | Various | Various | Yes (Cookie with JWT) |
