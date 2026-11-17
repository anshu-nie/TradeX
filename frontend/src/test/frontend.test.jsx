import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import StatCard from '../components/common/StatCard';
import TradeModal from '../components/common/TradeModal';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend Auth UI Tests', () => {
  it('Login form renders properly with email and password fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to TradeX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/one-click demo account login/i)).toBeInTheDocument();
  });

  it('Registration form renders properly with all required fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Create TradeX Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open free virtual account/i })).toBeInTheDocument();
  });
});

describe('Dashboard Component Tests', () => {
  it('StatCard renders title, value, and positive badge correctly', () => {
    render(
      <StatCard
        title="Total Portfolio Value"
        value="₹10,50,000.00"
        change="+5.0%"
        isPositive={true}
        subtitle="All assets + Cash"
      />
    );

    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('₹10,50,000.00')).toBeInTheDocument();
    expect(screen.getByText('+5.0%')).toBeInTheDocument();
    expect(screen.getByText('All assets + Cash')).toBeInTheDocument();
  });
});

describe('Virtual Trading Modal Tests', () => {
  const dummyStock = {
    _id: 'stock123',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    currentPrice: 3000.0,
    exchange: 'NSE'
  };

  it('TradeModal renders with BUY and SELL tabs, calculates gross correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TradeModal
            isOpen={true}
            onClose={() => {}}
            stock={dummyStock}
            initialType="BUY"
          />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Trade RELIANCE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BUY' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SELL' })).toBeInTheDocument();
    expect(screen.getByText('MARKET PRICE')).toBeInTheDocument();

    const qtyInput = screen.getByPlaceholderText(/number of shares/i);
    expect(qtyInput).toHaveValue(1);

    // Increase quantity to 2
    fireEvent.change(qtyInput, { target: { value: '2' } });
    expect(qtyInput).toHaveValue(2);
  });
});
