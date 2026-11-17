# TradeX – Stock Trading and Investment Management System with DevOps Automation

[![CI/CD Pipeline](https://github.com/tradex/tradex/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/tradex/tradex/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47a248.svg)](https://www.mongodb.com/)

---

## 📌 1. Project Abstract

**TradeX** is an enterprise-grade, full-stack financial technology (FinTech) web application designed to bridge the gap between financial literacy and practical stock market experience. Built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and containerized with **Docker**, TradeX provides users with a simulated ₹10,00,000 virtual balance to practice equity trading, analyze market trends, build diversified investment portfolios, and monitor real-time profit & loss metrics without risking real capital.

The project incorporates modern software engineering methodologies, featuring a modular MVC backend architecture, race-condition safe atomic database operations, JWT authentication with bcrypt hashing, a responsive Zerodha/TradingView-inspired UI, and a complete **DevOps automation pipeline** utilizing Docker multi-stage builds and GitHub Actions CI/CD.

---

## 🎯 2. Problem Statement & Objectives

### Problem Statement
Retail investing is growing rapidly, yet over 80% of novice traders suffer severe financial losses due to emotional trading, inadequate portfolio management skills, and lack of practical exposure to order types, brokerage charges, and volatility. Traditional stock market simulators often suffer from cumbersome interfaces, lack of realistic fee calculations, or excessive complexity.

### Core Objectives
1. **Realistic Simulation**: Provide an authentic market environment with order execution, weighted average accumulation, unrealized P&L tracking, and brokerage/regulatory charges.
2. **Financial Education**: Empower users with ₹10,00,000 virtual capital to experiment with portfolio diversification across sectors (Technology, Banking, Energy, Automotive, FMCG, Healthcare, etc.).
3. **Data Integrity & Safety**: Ensure that trade calculations and price validations occur strictly server-side, preventing frontend tampering and race conditions through atomic MongoDB operations.
4. **DevOps Automation**: Establish an automated delivery pipeline incorporating automated testing (Jest, Supertest, Vitest), containerization (Docker & Nginx), multi-container orchestration (Docker Compose), and automated CI/CD workflows via GitHub Actions.

---

## 🛠️ 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Recharts (Area, Pie & Line charts), Lucide React Icons, Custom CSS Design System |
| **Backend** | Node.js, Express.js (MVC), JSON Web Tokens (JWT), bcryptjs, Morgan, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB 7.0, Mongoose ODM (Indexes, compound keys, virtuals, atomic mutations) |
| **Testing** | Jest, Supertest, In-Memory MongoDB (`mongodb-memory-server`), Vitest, React Testing Library, JSDOM |
| **DevOps & Containers** | Git, Docker (Multi-stage builds), Docker Compose, Nginx (Alpine), GitHub Actions CI/CD |

---

## 🏛️ 4. System Architecture

TradeX follows a decoupled client-server architecture:

```
[ Client Browser (React + Recharts) ]
                  |
         HTTP / REST (Port 3000 / 80 via Nginx)
                  |
                  v
[ Nginx Reverse Proxy / Static Host ]
                  |
         Proxy Pass (/api/v1/* -> Port 5000)
                  |
                  v
[ Express.js REST API Server ]
    ├── Security Middlewares (Helmet, CORS, RateLimiter)
    ├── Auth Controller & JWT Verification
    ├── Trading Engine (Atomic Deductions & Holdings Upsert)
    ├── Portfolio Analytics Engine
    └── Market Data Service (Live / Seeded Fallback)
                  |
            Mongoose ODM
                  |
                  v
[ MongoDB Database (Port 27017) ]
    ├── Users Collection
    ├── Stocks Collection
    ├── Holdings Collection
    ├── Transactions Collection
    └── Watchlists Collection
```

---

## 📂 5. Repository Structure

```
TradeX/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # Multi-stage CI/CD GitHub Actions Pipeline
├── backend/
│   ├── config/
│   │   ├── db.js                    # Database connection with reconnect logic
│   │   └── env.js                   # Environment variables validation & defaults
│   ├── controllers/
│   │   ├── authController.js        # Registration, login, session inspection
│   │   ├── newsController.js        # Financial news feed
│   │   ├── portfolioController.js   # Portfolio aggregation controller
│   │   ├── stockController.js       # Stock explorer, movers & charts
│   │   ├── tradingController.js     # Buy/Sell execution & quote previews
│   │   ├── transactionController.js # Transaction ledger & filtering
│   │   ├── userController.js        # Profile management & balance reset
│   │   └── watchlistController.js   # Watchlist add/remove
│   ├── middleware/
│   │   ├── authMiddleware.js        # Bearer JWT verification
│   │   ├── errorMiddleware.js       # Centralized error handler
│   │   ├── rateLimiter.js           # API, Auth & Trade rate limits
│   │   └── validateRequest.js       # Express-validator error handler
│   ├── models/
│   │   ├── Holding.js               # User stock holdings with compound unique index
│   │   ├── Stock.js                 # Securities catalog schema with virtuals
│   │   ├── Transaction.js           # Trade history schema
│   │   ├── User.js                  # User schema with bcrypt pre-save hook
│   │   └── Watchlist.js             # User watchlist schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── newsRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── tradingRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── userRoutes.js
│   │   └── watchlistRoutes.js
│   ├── services/
│   │   ├── marketDataService.js     # Price simulator & historical trend generator
│   │   ├── portfolioService.js      # P&L, daily returns & sector allocation calculations
│   │   └── tradingService.js        # Safe atomic Buy & Sell transaction engine
│   ├── tests/
│   │   ├── auth.test.js             # Health check & Authentication tests
│   │   ├── portfolio.test.js        # Portfolio math & Watchlist tests
│   │   ├── setup.js                 # In-memory MongoDB testing setup
│   │   └── trading.test.js          # Buy, sell, balance & quantity validation tests
│   ├── utils/
│   │   ├── calculations.js          # Brokerage, weighted avg, P&L formulas
│   │   └── generateToken.js         # JWT signing utility
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile                   # Production Node.js lightweight Alpine container
│   ├── package.json
│   ├── seed.js                      # Database seed script for NSE sample securities
│   └── server.js                    # Express app configuration & server entrypoint
├── docs/
│   ├── API_DOCUMENTATION.md         # Comprehensive REST API endpoint specifications
│   ├── ARCHITECTURE.md              # Architectural design & data flow diagrams
│   ├── DEPLOYMENT_GUIDE.md          # Cloud VM / Ubuntu deployment instructions
│   ├── DOCKER_SETUP.md              # Detailed Docker containerization guide
│   ├── GITHUB_ACTIONS_GUIDE.md      # CI/CD pipeline explanation
│   └── TROUBLESHOOTING.md           # Common issues, debugging steps & solutions
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx # Route guard for authenticated users
│   │   │   │   ├── StatCard.jsx       # Reusable financial metric badge card
│   │   │   │   └── TradeModal.jsx     # Interactive Buy/Sell order execution modal
│   │   │   └── layout/
│   │   │       ├── Layout.jsx         # App shell wrapper
│   │   │       ├── Navbar.jsx         # Topbar with live balance & market status
│   │   │       └── Sidebar.jsx        # Dark charcoal collapsible navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication & user balance state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # KPI stats, area chart & allocation breakdown
│   │   │   ├── Login.jsx              # Sign-in with one-click demo login
│   │   │   ├── News.jsx               # Financial news insights
│   │   │   ├── Portfolio.jsx          # Holdings ledger, unrealized P&L
│   │   │   ├── Profile.jsx            # Account settings & balance reset
│   │   │   ├── Register.jsx           # Registration with ₹10,00,000 initial grant
│   │   │   ├── StockDetail.jsx        # Interactive 1D-1Y charts & fundamentals
│   │   │   ├── StockExplorer.jsx      # Stock market search & sector filters
│   │   │   ├── Transactions.jsx       # Complete audit ledger with pagination
│   │   │   └── Watchlist.jsx          # Personal saved stocks
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with auto JWT interceptor
│   │   ├── test/
│   │   │   ├── frontend.test.jsx      # Vitest component & modal tests
│   │   │   └── setup.js               # JSDOM & localStorage mocks
│   │   ├── App.jsx                    # Routing configuration
│   │   ├── index.css                  # FinTech design system styles
│   │   ├── main.jsx                   # React DOM entrypoint
│   │   ├── nginx.conf                 # Production Nginx reverse proxy configuration
│   │   ├── vite.config.js             # Vite bundler & proxy configuration
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   ├── Dockerfile                 # Multi-stage build with Nginx
│   │   └── package.json
├── .gitignore
├── docker-compose.dev.yml            # Development Docker Compose file
├── docker-compose.yml                # Production multi-container Docker Compose file
└── README.md
```

---

## ⚡ 6. Quick Start & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on v20.x and v26.x)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port 27017 OR MongoDB Atlas connection URI

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/tradex.git
cd TradeX
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/tradex
JWT_SECRET=tradex_super_secret_jwt_key_2026_fintech_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MARKET_DATA_API_KEY=
NEWS_API_KEY=
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 3: Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 4: Seed Database with Sample Stocks
```bash
cd ../backend
npm run seed
```
*Creates 12 prominent NSE stocks across sectors and a demo account (`demo@tradex.com` / `Password@123`).*

### Step 5: Start Development Servers
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
# Health check available at http://localhost:5000/api/v1/health
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Vite server starts at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**. Use the **One-Click Demo Login** or create a new account!

---

## 🐳 7. Running with Docker & Docker Compose

TradeX is containerized for cross-platform production deployments.

### Run All Services in Containers
```bash
docker compose up --build
```

This starts:
1. **`tradex-mongodb`**: MongoDB 7.0 with persistent data storage in volume `mongo-data`.
2. **`tradex-backend`**: Node.js Alpine production container running non-root on port 5000.
3. **`tradex-frontend`**: Nginx Alpine container serving optimized React build on port 3000.

### Access Application:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### Stop Containers:
```bash
docker compose down
```

---

## 🧪 8. Automated Testing

### Backend Test Suite (Jest + Supertest + In-Memory MongoDB)
```bash
cd backend
npm test
```
*Executes 17 comprehensive automated tests:*
- Health check verification
- User registration, duplicate rejection, and password validation
- User login and invalid credential rejection
- Authorized / unauthorized JWT route protection
- Stock listing and sector filters
- Atomic virtual buy orders, balance deductions, and fee calculations
- Insufficient virtual balance validation
- Sell orders, holdings updates, and credit proceeds
- Selling more shares than owned prevention
- Portfolio metrics and sector allocation calculations
- Watchlist addition, duplicate prevention, and deletion

### Frontend Test Suite (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
*Validates:*
- Login form fields and submission
- Registration form inputs
- StatCard metric formatting and gain/loss indicators
- Virtual Trading Modal buy/sell tab switches and dynamic order valuation

---

## 🚀 9. CI/CD Pipeline (GitHub Actions)

The repository includes a production-style GitHub Actions pipeline defined in `.github/workflows/ci-cd.yml`:

```
[ Push to main / develop OR Pull Request ]
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  Job 1: test-and-build              │
  │  • Checkout Code                    │
  │  • Setup Node.js 20                 │
  │  • Run Backend Tests (Jest)         │
  │  • Run Frontend Tests (Vitest)      │
  │  • Build Frontend Bundle (Vite)     │
  └──────────────────┬──────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  Job 2: docker-validation           │
  │  • Validate docker-compose.yml      │
  │  • Build Backend Docker Image       │
  │  • Build Frontend Docker Image      │
  └──────────────────┬──────────────────┘
                     │
          (Only on push to 'main')
                     ├──────────────────────────────┐
                     ▼                              ▼
  ┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
  │  Job 3: publish-images              │ │  Job 4: deploy                      │
  │  • Log in to GitHub Container Reg   │ │  • Check SSH credentials            │
  │  • Push Backend image (:sha, :lat)  │ │  • SSH into remote Linux host       │
  │  • Push Frontend image (:sha, :lat) │ │  • Run docker compose pull & up     │
  └─────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 🌐 10. REST API Specification

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/v1/health` | `GET` | Public | System health & DB connectivity |
| `/api/v1/auth/register` | `POST` | Public | Register new user + ₹10,00,000 balance |
| `/api/v1/auth/login` | `POST` | Public | User authentication & JWT issuance |
| `/api/v1/auth/me` | `GET` | Private | Retrieve authenticated user profile |
| `/api/v1/stocks` | `GET` | Public | List stocks with search, filter & sort |
| `/api/v1/stocks/:id` | `GET` | Public | Stock details with 1D-1Y chart data |
| `/api/v1/stocks/movers/top` | `GET` | Public | Top gainers and top losers |
| `/api/v1/trading/buy` | `POST` | Private | Execute atomic BUY order |
| `/api/v1/trading/sell` | `POST` | Private | Execute atomic SELL order |
| `/api/v1/trading/quote` | `POST` | Private | Calculate order value & brokerage preview |
| `/api/v1/portfolio` | `GET` | Private | Dynamic portfolio valuation & allocations |
| `/api/v1/watchlist` | `GET` | Private | User's saved watchlist |
| `/api/v1/watchlist` | `POST` | Private | Add stock to watchlist |
| `/api/v1/watchlist/:stockId` | `DELETE` | Private | Remove stock from watchlist |
| `/api/v1/transactions` | `GET` | Private | Filtered transaction history ledger |
| `/api/v1/news` | `GET` | Public | Financial news & market insights |
| `/api/v1/users/profile` | `PUT` | Private | Update user display name/email |
| `/api/v1/users/change-password` | `PUT` | Private | Update account password |
| `/api/v1/users/reset-balance` | `POST` | Private | Reset virtual balance to ₹10,00,000 |

*Detailed request/response schemas are available in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).*

---

## 🔮 11. Future Enhancements

- **Limit & Stop-Loss Orders**: Support pending limit orders with automatic execution triggers.
- **WebSocket Streaming**: Real-time tick-by-tick price stream using Socket.io.
- **Options & Derivatives Simulation**: Call/Put virtual options chain simulation for advanced financial learning.
- **Social Trading & Leaderboards**: Public trader rankings based on monthly percentage returns.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
