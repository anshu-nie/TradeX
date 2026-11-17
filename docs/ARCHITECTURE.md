# TradeX – System Architecture & Technical Design

## 1. Architectural Overview

TradeX follows a modern multi-tier decoupled architecture separating presentation, business logic, data persistence, and continuous integration.

```
+--------------------------------------------------------------------------+
|                           CLIENT TIER (Browser)                          |
|  - React 18 SPA (Vite Bundler)                                           |
|  - Plus Jakarta Sans FinTech Design System                                |
|  - Recharts Visualization Layer (Area & Pie charts)                       |
|  - React Context State Management (Auth, Virtual Balance, Quotes)        |
+------------------------------------+-------------------------------------+
                                     |
                                     | HTTPS / WSS / REST
                                     v
+------------------------------------+-------------------------------------+
|                     REVERSE PROXY & STATIC TIER                          |
|  - Nginx (Alpine Container)                                              |
|  - Client Routing Fallback (`try_files $uri $uri/ /index.html;`)         |
|  - API Gateway Proxy (`/api/v1/*` -> Backend Container:5000)            |
|  - Gzip Compression & Security Headers                                   |
+------------------------------------+-------------------------------------+
                                     |
                                     | HTTP Internal Docker Network
                                     v
+------------------------------------+-------------------------------------+
|                      APPLICATION TIER (Backend API)                       |
|  - Node.js & Express.js REST API                                         |
|  - Security Middlewares (Helmet, CORS, RateLimiter, JWT Protect)         |
|  - Controller Layer (Auth, Stocks, Trading, Portfolio, Watchlist)        |
|  - Service Layer (MarketDataService, TradingService, PortfolioService)  |
|  - Calculation Utilities (Weighted Averages, PnL, Brokerage Fees)       |
+------------------------------------+-------------------------------------+
                                     |
                                     | Mongoose ODM (Binary Protocol)
                                     v
+------------------------------------+-------------------------------------+
|                        DATA PERSISTENCE TIER                             |
|  - MongoDB 7.0 Cluster                                                   |
|  - Persistent Volume Mount (`mongo-data`)                                |
|  - Strict Validation Schemas & Compound Unique Indexes                   |
|  - Atomic Increment / Decrement Mutators                                 |
+--------------------------------------------------------------------------+
```

---

## 2. Data Flow & Safe Trading Engine

One of the most critical requirements of TradeX is **financial integrity without race conditions**.

### Buy Order Flow:
1. User enters desired quantity and submits order via UI.
2. The client transmits **only** `stockId` and `quantity` to `POST /api/v1/trading/buy`. The frontend price, order values, or user balances are intentionally ignored.
3. Backend retrieves the verified quoted price from the `Stock` collection.
4. Backend calculates:
   $$\text{Order Value} = \text{Price} \times \text{Quantity}$$
   $$\text{Brokerage Fee} = \max(\text{Order Value} \times 0.00115, ₹5.00)$$
   $$\text{Total Required} = \text{Order Value} + \text{Brokerage Fee}$$
5. Backend performs an **atomic conditional mutation** on the user balance:
   ```javascript
   User.findOneAndUpdate(
     { _id: userId, virtualBalance: { $gte: totalRequired } },
     { $inc: { virtualBalance: -totalRequired } },
     { new: true }
   );
   ```
   *If the user's balance is below `totalRequired`, the atomic query matches 0 documents and returns null, cleanly preventing overdrafts even under concurrent requests.*
6. The `Holding` record for `(userId, stockId)` is upserted with a new **weighted average price**:
   $$\text{New Avg Price} = \frac{(\text{Current Qty} \times \text{Current Avg}) + (\text{New Qty} \times \text{Execution Price})}{\text{Current Qty} + \text{New Qty}}$$
7. A permanent immutable `Transaction` record is written with status `COMPLETED`.

### Sell Order Flow:
1. User submits sell order with `stockId` and `quantity`.
2. Backend verifies holding exists and `holding.quantity >= quantity`.
3. Gross proceeds are calculated at current market price, minus statutory brokerage.
4. If selling all shares, the holding record is safely deleted; if partial, quantity is decremented.
5. User's virtual balance is credited with net proceeds.
6. A `SELL` transaction record is logged.

---

## 3. Database Schema Models

### User Schema (`User.js`)
- `name`: String (2-60 chars)
- `email`: String (Unique, lowercase, validated format)
- `password`: String (Bcrypt salt rounds 10, excluded by default)
- `virtualBalance`: Number (Default: ₹10,00,000, Min: 0)
- `timestamps`: true

### Stock Schema (`Stock.js`)
- `symbol`: String (Unique, uppercase, indexed)
- `companyName`: String
- `sector`: String (Indexed)
- `exchange`: String (Default: NSE)
- `currentPrice`: Number
- `previousClose`: Number
- `dayHigh`, `dayLow`: Number
- `yearHigh`, `yearLow`: Number
- `marketCap`, `volume`, `peRatio`: Number
- `dataSource`: String (`SIMULATED_DEMO` or `LIVE_API`)
- Virtuals: `change`, `changePercent`

### Holding Schema (`Holding.js`)
- `userId`: ObjectId -> User (Indexed)
- `stockId`: ObjectId -> Stock (Indexed)
- `quantity`: Number (Min: 0)
- `averagePrice`: Number
- **Index**: `{ userId: 1, stockId: 1 }` (Unique compound constraint)

### Transaction Schema (`Transaction.js`)
- `userId`: ObjectId -> User
- `stockId`: ObjectId -> Stock
- `transactionType`: Enum (`BUY`, `SELL`)
- `quantity`: Number (Min: 1)
- `price`: Number
- `totalAmount`: Number
- `charges`: Number
- `status`: Enum (`COMPLETED`, `FAILED`)
- `notes`: String
- **Index**: `{ userId: 1, createdAt: -1 }`

### Watchlist Schema (`Watchlist.js`)
- `userId`: ObjectId -> User (Unique constraint)
- `stockIds`: Array of ObjectId -> Stock
