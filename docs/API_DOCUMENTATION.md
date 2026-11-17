# TradeX – REST API Documentation

Base URL: `/api/v1`

All protected endpoints require the following HTTP Header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. System Health

### `GET /api/v1/health`
Checks application health and MongoDB connection status.
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-17T09:45:00.000Z",
  "environment": "production",
  "uptimeSeconds": 1420,
  "database": {
    "connected": true,
    "state": "connected"
  },
  "version": "1.0.0"
}
```

---

## 2. Authentication

### `POST /api/v1/auth/register`
Creates a new user account with ₹10,00,000 initial virtual balance.
- **Request Body**:
```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Account registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "67399f...",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "virtualBalance": 1000000,
      "createdAt": "2026-11-17T09:45:00.000Z"
    }
  }
}
```

### `POST /api/v1/auth/login`
Authenticates existing user and returns JWT token.
- **Request Body**:
```json
{
  "email": "aarav@example.com",
  "password": "Password@123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "67399f...",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "virtualBalance": 1000000
    }
  }
}
```

### `GET /api/v1/auth/me`
Fetches current session user profile.
- **Access**: Private (Bearer Token)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "67399f...",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "virtualBalance": 1000000,
    "createdAt": "2026-11-17T09:45:00.000Z"
  }
}
```

---

## 3. Stock Market Explorer

### `GET /api/v1/stocks`
Lists all available securities with search, sector filtering, and sorting.
- **Query Parameters**:
  - `search`: Filter by symbol or company name (e.g. `RELIANCE` or `Tata`)
  - `sector`: Filter by sector (e.g. `Technology`, `Banking`, `Energy`)
  - `sortBy`: `price` | `marketCap` | `name`
  - `sortOrder`: `asc` | `desc`
  - `page`: Page number (Default: 1)
  - `limit`: Items per page (Default: 50)
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 12,
  "total": 12,
  "page": 1,
  "pages": 1,
  "sectors": ["Automotive", "Banking", "Energy", "FMCG", "Healthcare", "Infrastructure", "Technology"],
  "data": [
    {
      "_id": "67399...",
      "symbol": "RELIANCE",
      "companyName": "Reliance Industries Ltd.",
      "sector": "Energy",
      "exchange": "NSE",
      "currentPrice": 2980.5,
      "previousClose": 2945.0,
      "change": 35.5,
      "changePercent": 1.21,
      "marketCap": 2015000,
      "dataSource": "SIMULATED_DEMO"
    }
  ]
}
```

### `GET /api/v1/stocks/:id?timeframe=1M`
Fetches stock details and historical chart points.
- **Query Parameter**: `timeframe` = `1D` | `1W` | `1M` | `3M` | `1Y`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "_id": "67399...",
    "symbol": "RELIANCE",
    "companyName": "Reliance Industries Ltd.",
    "currentPrice": 2980.5,
    "dayHigh": 2998.0,
    "dayLow": 2930.0,
    "yearHigh": 3024.9,
    "yearLow": 2220.3,
    "chartData": [
      { "timestamp": "Nov 1", "price": 2910.4 },
      { "timestamp": "Nov 2", "price": 2935.2 },
      { "timestamp": "Nov 17", "price": 2980.5 }
    ]
  }
}
```

---

## 4. Virtual Trading

### `POST /api/v1/trading/quote`
Calculates live order estimate, brokerage, and affordability before placing an order.
- **Access**: Private
- **Request Body**:
```json
{
  "stockId": "67399...",
  "quantity": 10,
  "type": "BUY"
}
```

### `POST /api/v1/trading/buy`
Executes an atomic BUY transaction.
- **Access**: Private
- **Request Body**:
```json
{
  "stockId": "67399...",
  "quantity": 5
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Successfully purchased 5 share(s) of RELIANCE!",
  "data": {
    "transaction": {
      "id": "67399...",
      "transactionType": "BUY",
      "quantity": 5,
      "price": 2980.5,
      "totalAmount": 14924.64,
      "charges": 22.14,
      "status": "COMPLETED"
    },
    "holding": {
      "quantity": 5,
      "averagePrice": 2980.5
    },
    "updatedBalance": 985075.36
  }
}
```

### `POST /api/v1/trading/sell`
Executes an atomic SELL transaction.
- **Access**: Private
- **Request Body**:
```json
{
  "stockId": "67399...",
  "quantity": 2
}
```

---

## 5. Portfolio & Watchlist

### `GET /api/v1/portfolio`
Fetches user's current holdings, returns, and allocations.
- **Access**: Private
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "virtualBalance": 985075.36,
    "totalPortfolioValue": 1000000.0,
    "totalInvested": 14902.5,
    "totalCurrentValue": 14902.5,
    "totalPnL": 0.0,
    "totalPnLPercent": 0.0,
    "totalHoldingsCount": 1,
    "holdings": [...],
    "sectorAllocation": [...],
    "stockAllocation": [...]
  }
}
```

### `GET /api/v1/watchlist`
Returns user's saved watchlist with live quotes.

### `POST /api/v1/watchlist`
Adds a stock to user's watchlist.
- **Request Body**: `{ "stockId": "67399..." }`

### `DELETE /api/v1/watchlist/:stockId`
Removes a stock from user's watchlist.
