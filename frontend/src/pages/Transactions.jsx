import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { transactionAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionAPI.getTransactions({
        type,
        search,
        sort,
        page,
        limit: 15
      });

      if (res.data.success) {
        setTransactions(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [type, search, sort, page]);

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Transaction History ({totalCount})
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
          Audit trail of all executed virtual buy and sell orders.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search by ticker symbol or company..."
              className="form-control"
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'BUY', 'SELL'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(1);
                }}
                className={type === t ? 'btn btn-primary btn-sm' : 'btn-outline btn-sm'}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} color="var(--text-secondary)" />
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
            <p style={{ color: 'var(--text-muted)' }}>Retrieving transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Security / Symbol</th>
                    <th style={{ textAlign: 'right' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Execution Price</th>
                    <th style={{ textAlign: 'right' }}>Brokerage / Charges</th>
                    <th style={{ textAlign: 'right' }}>Net Amount</th>
                    <th>Date & Time</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
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

                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {tx.quantity}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{tx.price.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        ₹{(tx.charges || 0).toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(tx.totalAmount)}
                      </td>

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(tx.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="badge-neutral" style={{ color: '#059669', borderColor: '#a7f3d0' }}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderTop: '1px solid var(--border-color)',
                marginTop: '12px'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-outline btn-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="btn-outline btn-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <History size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              No Transactions Found
            </h3>
            <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
              Execute your first simulated order from the Market Explorer to record trades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
