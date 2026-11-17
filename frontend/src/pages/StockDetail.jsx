import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { stockAPI, watchlistAPI } from '../services/api';
import TradeModal from '../components/common/TradeModal';

const StockDetail = () => {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Trade Modal
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchStockDetail = async (tf = timeframe) => {
    try {
      setLoading(true);
      const res = await stockAPI.getById(id, tf);
      if (res.data.success) {
        setStock(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    try {
      const res = await watchlistAPI.getWatchlist();
      if (res.data.success) {
        const found = res.data.data.some((s) => s._id === id);
        setIsSaved(found);
      }
    } catch (err) {
      console.error('Failed to check watchlist:', err);
    }
  };

  useEffect(() => {
    fetchStockDetail(timeframe);
    checkWatchlist();
  }, [id, timeframe]);

  const toggleWatchlist = async () => {
    try {
      if (isSaved) {
        await watchlistAPI.remove(id);
        setIsSaved(false);
      } else {
        await watchlistAPI.add(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const openTrade = (type) => {
    setTradeType(type);
    setTradeModalOpen(true);
  };

  if (loading && !stock) {
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
        <p style={{ color: 'var(--text-muted)' }}>Loading security details...</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2>Stock Not Found</h2>
        <Link to="/stocks" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Market Explorer
        </Link>
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/stocks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Market Explorer</span>
        </Link>
      </div>

      {/* Stock Header & Actions Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stock.symbol}
              </h1>
              <span className="badge-neutral">{stock.exchange || 'NSE'}</span>
              <span className="badge-neutral">{stock.sector}</span>
              <button
                onClick={toggleWatchlist}
                className="btn-outline btn-sm"
                style={{ padding: '6px 10px' }}
                title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isSaved ? <BookmarkCheck size={16} color="#f59e0b" /> : <Bookmark size={16} />}
                <span>{isSaved ? 'Watchlisted' : 'Watchlist'}</span>
              </button>
            </div>
            <div style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {stock.companyName}
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
                  {isPositive ? '+' : ''}{stock.changePercent}%
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({isPositive ? '+' : ''}₹{stock.change})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => openTrade('BUY')} className="btn btn-buy" style={{ minWidth: '100px' }}>
                Buy {stock.symbol}
              </button>
              <button onClick={() => openTrade('SELL')} className="btn btn-sell" style={{ minWidth: '100px' }}>
                Sell {stock.symbol}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="card-title">Interactive Price Chart</div>
            <div className="card-subtitle">
              {timeframe} Performance • {stock.dataSource === 'LIVE_API' ? 'Live Provider Feed' : 'Simulated Market Walk'}
            </div>
          </div>

          {/* Timeframe Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '8px' }}>
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: timeframe === tf ? 'var(--primary)' : 'transparent',
                  color: timeframe === tf ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: '340px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stock.chartData || []}>
              <defs>
                <linearGradient id="stockPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${val.toFixed(0)}`}
              />
              <Tooltip
                formatter={(val) => [`₹${val.toFixed(2)}`, 'Price']}
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
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#stockPriceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Fundamentals & Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Key Statistics */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Key Financial Statistics</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DAY HIGH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gain-dark)' }}>
                ₹{(stock.dayHigh || stock.currentPrice * 1.02).toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DAY LOW</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--loss-dark)' }}>
                ₹{(stock.dayLow || stock.currentPrice * 0.98).toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>52-WEEK HIGH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{(stock.yearHigh || stock.currentPrice * 1.25).toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>52-WEEK LOW</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{(stock.yearLow || stock.currentPrice * 0.75).toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>P/E RATIO</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stock.peRatio || '24.5'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MARKET CAP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{((stock.marketCap || 100000) / 1000).toFixed(1)}k Cr
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile & Description */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">About {stock.companyName}</div>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {stock.description ||
              `${stock.companyName} is one of India's premier listed corporate entities in the ${stock.sector} sector, traded primarily on the National Stock Exchange (NSE).`}
          </p>

          <div style={{
            padding: '14px 16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.5 }}>
              <strong>Educational Trading Note:</strong> All order executions on TradeX use your ₹10,00,000 virtual balance.
              Quotes reflect simulated market conditions for realistic portfolio management exercises.
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={stock}
        initialType={tradeType}
        onTradeSuccess={() => fetchStockDetail(timeframe)}
      />
    </div>
  );
};

export default StockDetail;
