import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PlusCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { portfolioAPI } from '../services/api';
import TradeModal from '../components/common/TradeModal';
import StatCard from '../components/common/StatCard';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trade Modal
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('SELL');

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await portfolioAPI.getPortfolio();
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openTrade = (holding, type = 'SELL') => {
    setSelectedStock({
      _id: holding.stockId,
      symbol: holding.symbol,
      companyName: holding.companyName,
      currentPrice: holding.currentPrice
    });
    setTradeType(type);
    setTradeModalOpen(true);
  };

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Calculating live portfolio statistics...</p>
      </div>
    );
  }

  const isTotalGain = (portfolio?.totalPnL || 0) >= 0;
  const isDailyGain = (portfolio?.dailyPnL || 0) >= 0;
  const holdings = portfolio?.holdings || [];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            My Investment Portfolio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
            Track your open holdings, asset allocation, and live profit / loss in real time.
          </p>
        </div>

        <Link to="/stocks" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add More Stocks</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolio?.totalPortfolioValue)}
          change={`${isTotalGain ? '+' : ''}${portfolio?.totalPnLPercent || 0}%`}
          isPositive={isTotalGain}
          subtitle="Holdings + Virtual Balance"
          icon={Briefcase}
        />

        <StatCard
          title="Total Invested Amount"
          value={formatCurrency(portfolio?.totalInvested)}
          subtitle={`${holdings.length} Active Positions`}
          icon={PieIcon}
        />

        <StatCard
          title="Total Profit / Loss"
          value={formatCurrency(portfolio?.totalPnL)}
          change={`${isTotalGain ? '+' : ''}${portfolio?.totalPnLPercent || 0}%`}
          isPositive={isTotalGain}
          subtitle="Overall Return"
          icon={TrendingUp}
        />

        <StatCard
          title="Day's Profit / Loss"
          value={formatCurrency(portfolio?.dailyPnL)}
          change={`${isDailyGain ? '+' : ''}${portfolio?.dailyPnLPercent || 0}%`}
          isPositive={isDailyGain}
          subtitle="Today's Movement"
          icon={TrendingUp}
        />
      </div>

      {/* Allocation Charts Row */}
      {holdings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}>
          {/* Stock Allocation */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Holdings Weightage</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
              <div style={{ width: '55%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio.stockAllocation}
                      dataKey="value"
                      nameKey="symbol"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {portfolio.stockAllocation.map((entry, index) => (
                        <Cell key={`stock-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {portfolio.stockAllocation.slice(0, 4).map((s, idx) => (
                  <div key={s.symbol} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: COLORS[idx % COLORS.length]
                    }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.symbol}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{s.percent}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Allocation */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Sector Allocation</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
              <div style={{ width: '55%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio.sectorAllocation}
                      dataKey="value"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {portfolio.sectorAllocation.map((entry, index) => (
                        <Cell key={`sector-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {portfolio.sectorAllocation.slice(0, 4).map((s, idx) => (
                  <div key={s.sector} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: COLORS[idx % COLORS.length]
                    }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.sector}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{s.percent}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Current Holdings ({holdings.length})</div>
            <div className="card-subtitle">Detailed breakdown of open positions</div>
          </div>
        </div>

        {holdings.length > 0 ? (
          <div className="table-responsive">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th style={{ textAlign: 'right' }}>Shares</th>
                  <th style={{ textAlign: 'right' }}>Avg Price</th>
                  <th style={{ textAlign: 'right' }}>LTP</th>
                  <th style={{ textAlign: 'right' }}>Total Invested</th>
                  <th style={{ textAlign: 'right' }}>Current Value</th>
                  <th style={{ textAlign: 'right' }}>P&L (Return)</th>
                  <th style={{ textAlign: 'center', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const isHoldingGain = h.pnl >= 0;

                  return (
                    <tr key={h.holdingId}>
                      <td>
                        <Link to={`/stocks/${h.stockId}`}>
                          <span className="stock-cell-title" style={{ color: 'var(--primary)' }}>
                            {h.symbol}
                          </span>
                          <span className="stock-cell-subtitle">{h.companyName} • {h.sector}</span>
                        </Link>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {h.quantity}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{h.averagePrice.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{h.currentPrice.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(h.investedValue)}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(h.currentValue)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: isHoldingGain ? 'var(--gain-dark)' : 'var(--loss-dark)' }}>
                          {isHoldingGain ? '+' : ''}{formatCurrency(h.pnl)}
                        </div>
                        <span className={isHoldingGain ? 'badge-gain' : 'badge-loss'}>
                          {isHoldingGain ? '+' : ''}{h.pnlPercent}%
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openTrade(h, 'BUY')}
                            className="btn-buy btn-sm"
                            title="Buy more shares"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => openTrade(h, 'SELL')}
                            className="btn-sell btn-sm"
                            title="Sell shares"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Your Portfolio is Empty
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 16px' }}>
              You have ₹{Number(portfolio?.virtualBalance || 1000000).toLocaleString('en-IN')} virtual cash available to trade.
            </p>
            <Link to="/stocks" className="btn btn-primary">
              Explore Market Stocks
            </Link>
          </div>
        )}
      </div>

      {/* Reusable Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType={tradeType}
        onTradeSuccess={fetchPortfolio}
      />
    </div>
  );
};

export default Portfolio;
