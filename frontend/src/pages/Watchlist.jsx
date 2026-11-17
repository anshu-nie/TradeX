import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, TrendingUp, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import TradeModal from '../components/common/TradeModal';

const Watchlist = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trade Modal
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await watchlistAPI.getWatchlist();
      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (stockId) => {
    try {
      const res = await watchlistAPI.remove(stockId);
      if (res.data.success) {
        setStocks((prev) => prev.filter((s) => s._id !== stockId));
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const openTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeModalOpen(true);
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
        <p style={{ color: 'var(--text-muted)' }}>Loading saved watchlist...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
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
            My Watchlist ({stocks.length})
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
            Track real-time movements and quickly execute simulated trades.
          </p>
        </div>

        <Link to="/stocks" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Stocks</span>
        </Link>
      </div>

      <div className="card">
        {stocks.length > 0 ? (
          <div className="table-responsive">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Symbol & Company</th>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Current Price</th>
                  <th style={{ textAlign: 'right' }}>Day Change</th>
                  <th style={{ textAlign: 'right' }}>52W Range</th>
                  <th style={{ textAlign: 'center', width: '220px' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => {
                  const isPositive = s.changePercent >= 0;

                  return (
                    <tr key={s._id}>
                      <td>
                        <Link to={`/stocks/${s._id}`}>
                          <span className="stock-cell-title" style={{ color: 'var(--primary)' }}>
                            {s.symbol}
                          </span>
                          <span className="stock-cell-subtitle">{s.companyName} • {s.exchange || 'NSE'}</span>
                        </Link>
                      </td>

                      <td>
                        <span className="badge-neutral">{s.sector}</span>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>
                        ₹{s.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isPositive ? '+' : ''}{s.changePercent}%
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        ₹{(s.yearLow || s.currentPrice * 0.75).toFixed(0)} - ₹{(s.yearHigh || s.currentPrice * 1.25).toFixed(0)}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => openTrade(s, 'BUY')}
                            className="btn-buy btn-sm"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => openTrade(s, 'SELL')}
                            className="btn-sell btn-sm"
                          >
                            Sell
                          </button>
                          <button
                            onClick={() => handleRemove(s._id)}
                            className="btn-outline btn-sm"
                            style={{ color: 'var(--loss-dark)', borderColor: 'var(--loss-border)' }}
                            title="Remove from Watchlist"
                          >
                            <Trash2 size={14} />
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
            <Bookmark size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              No Stocks in Watchlist
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '360px', margin: '6px auto 16px' }}>
              Add stocks from the Market Explorer to track price volatility and jump on trading opportunities.
            </p>
            <Link to="/stocks" className="btn btn-primary">
              Browse Market
            </Link>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType={tradeType}
        onTradeSuccess={fetchWatchlist}
      />
    </div>
  );
};

export default Watchlist;
