import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tradex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're on login or register endpoints
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('tradex_token');
        localStorage.removeItem('tradex_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  resetBalance: () => api.post('/users/reset-balance')
};

export const stockAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getById: (id, timeframe = '1M') => api.get(`/stocks/${id}`, { params: { timeframe } }),
  getTopMovers: () => api.get('/stocks/movers/top'),
  getOverview: () => api.get('/stocks/market/overview')
};

export const tradingAPI = {
  buy: (data) => api.post('/trading/buy', data),
  sell: (data) => api.post('/trading/sell', data),
  getQuote: (data) => api.post('/trading/quote', data)
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio')
};

export const watchlistAPI = {
  getWatchlist: () => api.get('/watchlist'),
  add: (stockId) => api.post('/watchlist', { stockId }),
  remove: (stockId) => api.delete(`/watchlist/${stockId}`)
};

export const transactionAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`)
};

export const newsAPI = {
  getNews: (category) => api.get('/news', { params: { category } })
};

export default api;
