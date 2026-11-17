import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StockExplorer from './pages/StockExplorer';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Transactions from './pages/Transactions';
import News from './pages/News';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stocks" element={<StockExplorer />} />
              <Route path="/stocks/:id" element={<StockDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/news" element={<News />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
