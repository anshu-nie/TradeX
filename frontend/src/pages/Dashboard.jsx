import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Wallet,
  PieChart as PieIcon,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../components/common/StatCard';
import TradeModal from '../components/common/TradeModal';
import { portfolioAPI, stockAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });
  const [marketOverview, setMarketOverview] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchDashboardData = async () => {
    try {
      const [portRes, moversRes, marketRes, txRes] = await Promise.all([
        portfolioAPI.getPortfolio(),
        stockAPI.getTopMovers(),
        stockAPI.getOverview(),
        transactionAPI.getTransactions({ limit: 5 })
      ]);

      if (portRes.data.success) setPortfolio(portRes.data.data);
      if (moversRes.data.success) setTopMovers(moversRes.data.data);
      if (marketRes.data.success) setMarketOverview(marketRes.data.data);
      if (txRes.data.success) setRecentTransactions(txRes.data.data);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
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
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading market overview...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isTotalGain = (portfolio?.totalPnL || 0) >= 0;
  const isDailyGain = (portfolio?.dailyPnL || 0) >= 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
            Simulate trades, analyze asset allocation, and master your investment journey.
          </p>
        </div>

        <Link to="/stocks" className="btn btn-primary">
          <TrendingUp size={18} />
          <span>Explore Stock Market</span>
        </Link>
      </div>

      {/* Market Overview Ticker */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '28px'
      }}>
        {marketOverview.map((item) => (
          <div
            key={item.name}
            style={{
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <span className={item.change >= 0 ? 'badge-gain' : 'badge-loss'}>
              {item.change >= 0 ? '+' : ''}{item.changePercent}%
            </span>
          </div>
        ))}
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolio?.totalPortfolioValue)}
          change={`${isTotalGain ? '+' : ''}${portfolio?.totalPnLPercent || 0}%`}
          isPositive={isTotalGain}
          subtitle="All assets + Cash"
          icon={Briefcase}
        />

        <StatCard
          title="Available Virtual Cash"
          value={formatCurrency(portfolio?.virtualBalance)}
          subtitle="Ready to invest"
          icon={Wallet}
        />

        <StatCard
          title="Total Investment"
          value={formatCurrency(portfolio?.totalInvested)}
          subtitle={`${portfolio?.totalHoldingsCount || 0} Stocks owned`}
          icon={PieIcon}
        />

        <StatCard
          title="Total Profit / Loss"
          value={formatCurrency(portfolio?.totalPnL)}
          change={`${isTotalGain ? '+' : ''}${portfolio?.totalPnLPercent || 0}%`}
          isPositive={isTotalGain}
          subtitle="Unrealized returns"
          icon={TrendingUp}
        />
      </div>

      {/* Interactive Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Portfolio Value Curve */}
        <div className="card" style={{ minHeight: '340px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Portfolio Performance</div>
              <div className="card-subtitle">Estimated 7-day asset evaluation</div>
            </div>
            <span className={isTotalGain ? 'badge-gain' : 'badge-loss'}>
              {isTotalGain ? 'Profitable' : 'Drawdown'}
            </span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolio?.performanceTrend || []}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Value']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#portfolioGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="card" style={{ minHeight: '340px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Asset Allocation</div>
              <div className="card-subtitle">Holdings distribution by sector</div>
            </div>
          </div>

          {portfolio?.sectorAllocation && portfolio.sectorAllocation.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: '240px' }}>
              <div style={{ width: '55%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio.sectorAllocation}
                      dataKey="value"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {portfolio.sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Invested']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {portfolio.sectorAllocation.slice(0, 4).map((sec, idx) => (
                  <div key={sec.sector} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: COLORS[idx % COLORS.length]
                    }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{sec.sector}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{sec.percent}%</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '220px',
              color: 'var(--text-muted)'
            }}>
              <PieIcon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.88rem' }}>No stocks in portfolio yet</p>
              <Link to="/stocks" className="btn-outline btn-sm" style={{ marginTop: '12px' }}>
                Buy First Stock
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top Gainers & Losers Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '28px'
      }}>
        {/* Top Gainers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ArrowUpRight size={18} color="#10b981" />
              <span>Top Gainers</span>
            </div>
            <Link to="/stocks" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <table className="fin-table">
              <tbody>
                {topMovers.gainers.slice(0, 4).map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/stocks/${s._id}`}>
                        <span className="stock-cell-title">{s.symbol}</span>
                        <span className="stock-cell-subtitle">{s.companyName}</span>
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₹{s.currentPrice.toFixed(2)}</div>
                      <span className="badge-gain">+{s.changePercent}%</span>
                    </td>
                    <td style={{ textAlign: 'right', width: '90px' }}>
                      <button
                        onClick={() => openTrade(s, 'BUY')}
                        className="btn-buy btn-sm"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Losers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ArrowDownRight size={18} color="#ef4444" />
              <span>Top Losers</span>
            </div>
            <Link to="/stocks" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <table className="fin-table">
              <tbody>
                {topMovers.losers.slice(0, 4).map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/stocks/${s._id}`}>
                        <span className="stock-cell-title">{s.symbol}</span>
                        <span className="stock-cell-subtitle">{s.companyName}</span>
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₹{s.currentPrice.toFixed(2)}</div>
                      <span className="badge-loss">{s.changePercent}%</span>
                    </td>
                    <td style={{ textAlign: 'right', width: '90px' }}>
                      <button
                        onClick={() => openTrade(s, 'BUY')}
                        className="btn-buy btn-sm"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-subtitle">Your latest executed market simulated orders</div>
          </div>
          <Link to="/transactions" className="btn-outline btn-sm">
            <span>View Full Ledger</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="table-responsive">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Net Value</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <span className={tx.transactionType === 'BUY' ? 'badge-gain' : 'badge-loss'}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td>
                      <span className="stock-cell-title">{tx.stockId?.symbol || 'STOCK'}</span>
                      <span className="stock-cell-subtitle">{tx.stockId?.companyName || ''}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{tx.price.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(tx.totalAmount)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className="badge-neutral" style={{ color: '#059669', borderColor: '#a7f3d0' }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontSize: '0.9rem' }}>No trading orders executed yet</p>
          </div>
        )}
      </div>

      {/* Reusable Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType={tradeType}
        onTradeSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
