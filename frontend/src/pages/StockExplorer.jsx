import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { stockAPI, watchlistAPI } from '../services/api';
import TradeModal from '../components/common/TradeModal';

const StockExplorer = () => {
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');

  // Trade Modal
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await stockAPI.getAll({
        search,
        sector: selectedSector,
        sortBy,
        sortOrder
      });

      if (res.data.success) {
        setStocks(res.data.data);
        if (res.data.sectors && res.data.sectors.length > 0) {
          setSectors(res.data.sectors);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const res = await watchlistAPI.getWatchlist();
      if (res.data.success) {
        const ids = new Set(res.data.data.map((s) => s._id));
        setWatchlistIds(ids);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStocks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedSector, sortBy, sortOrder]);

  const toggleWatchlist = async (stock) => {
    const isSaved = watchlistIds.has(stock._id);
    try {
      if (isSaved) {
        await watchlistAPI.remove(stock._id);
        setWatchlistIds((prev) => {
          const updated = new Set(prev);
          updated.delete(stock._id);
          return updated;
        });
      } else {
        await watchlistAPI.add(stock._id);
        setWatchlistIds((prev) => new Set(prev).add(stock._id));
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const openTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeModalOpen(true);
  };

  return (
    <div>
      {/* Title & Description */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Stock Market Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
          Explore shares across key sectors with realistic quotes and simulated market data.
        </p>
      </div>

      {/* Control Bar: Search, Sector Filter, Sort */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Field */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search ticker (e.g., RELIANCE, TCS) or company name..."
              className="form-control"
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sector Pill Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="ALL">All Sectors</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} color="var(--text-secondary)" />
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="marketCap">Sort by Market Cap</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="btn-outline btn-sm"
              title="Toggle Ascending / Descending"
            >
              {sortOrder === 'asc' ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stock Cards / Table View */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Searching stocks...</p>
          </div>
        ) : stocks.length > 0 ? (
          <div className="table-responsive">
            <table className="fin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Watch</th>
                  <th>Symbol & Company</th>
                  <th>Sector</th>
                  <th>Exchange</th>
                  <th style={{ textAlign: 'right' }}>Current Price</th>
                  <th style={{ textAlign: 'right' }}>Day Change</th>
                  <th style={{ textAlign: 'right' }}>Market Cap (Cr)</th>
                  <th style={{ textAlign: 'center' }}>Data Source</th>
                  <th style={{ textAlign: 'center', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => {
                  const isSaved = watchlistIds.has(s._id);
                  const isPositive = s.changePercent >= 0;

                  return (
                    <tr key={s._id}>
                      {/* Watchlist Star/Bookmark */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => toggleWatchlist(s)}
                          style={{
                            color: isSaved ? '#f59e0b' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                          }}
                          title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        </button>
                      </td>

                      {/* Stock Symbol & Company */}
                      <td>
                        <Link to={`/stocks/${s._id}`}>
                          <span className="stock-cell-title" style={{ color: 'var(--primary)' }}>
                            {s.symbol}
                          </span>
                          <span className="stock-cell-subtitle">{s.companyName}</span>
                        </Link>
                      </td>

                      {/* Sector */}
                      <td>
                        <span className="badge-neutral">{s.sector}</span>
                      </td>

                      {/* Exchange */}
                      <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {s.exchange || 'NSE'}
                      </td>

                      {/* Current Price */}
                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.98rem' }}>
                        ₹{s.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Day Change */}
                      <td style={{ textAlign: 'right' }}>
                        <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
                          {isPositive ? '+' : ''}{s.changePercent}%
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {s.marketCap ? `₹${(s.marketCap / 1000).toFixed(1)}k Cr` : '—'}
                      </td>

                      {/* Data Source Badge */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: s.dataSource === 'LIVE_API' ? '#ecfdf5' : '#eff6ff',
                          color: s.dataSource === 'LIVE_API' ? '#059669' : '#2563eb',
                          border: s.dataSource === 'LIVE_API' ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
                        }}>
                          {s.dataSource === 'LIVE_API' ? 'LIVE' : 'SIMULATED'}
                        </span>
                      </td>

                      {/* Trade Buttons */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No stocks match your search criteria</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try resetting your sector filter or search keyword.</p>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType={tradeType}
        onTradeSuccess={fetchStocks}
      />
    </div>
  );
};

export default StockExplorer;
