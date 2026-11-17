import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { tradingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TradeModal = ({ isOpen, onClose, stock, initialType = 'BUY', onTradeSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [tradeType, setTradeType] = useState(initialType);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Synchronize initial trade type when opened
  useEffect(() => {
    if (isOpen) {
      setTradeType(initialType);
      setQuantity(1);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialType]);

  // Fetch real-time backend calculated order quote whenever stock, quantity, or type changes
  useEffect(() => {
    if (!isOpen || !stock?._id) return;

    let isMounted = true;
    const fetchQuote = async () => {
      try {
        const res = await tradingAPI.getQuote({
          stockId: stock._id,
          quantity: Math.max(1, parseInt(quantity, 10) || 1),
          type: tradeType
        });
        if (isMounted && res.data.success) {
          setQuote(res.data.data);
        }
      } catch (err) {
        console.error('Failed to calculate quote:', err);
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [isOpen, stock, quantity, tradeType]);

  if (!isOpen || !stock) return null;

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) ? '' : Math.max(1, val));
    setErrorMsg('');
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setErrorMsg('Please enter a valid quantity of 1 or more');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (tradeType === 'BUY') {
        res = await tradingAPI.buy({
          stockId: stock._id,
          quantity: qty
        });
      } else {
        res = await tradingAPI.sell({
          stockId: stock._id,
          quantity: qty
        });
      }

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        await refreshUser(); // Update virtual balance in navbar
        if (onTradeSuccess) {
          onTradeSuccess(res.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Trade execution failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = stock.currentPrice || 0;
  const numQty = parseInt(quantity, 10) || 1;
  const estimatedGross = Math.round(currentPrice * numQty * 100) / 100;
  const estimatedCharges = quote ? quote.charges : Math.max(5, Math.round(estimatedGross * 0.00115 * 100) / 100);
  const netEstimatedTotal = tradeType === 'BUY'
    ? estimatedGross + estimatedCharges
    : estimatedGross - estimatedCharges;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="trade-modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Trade {stock.symbol}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stock.companyName} • {stock.exchange || 'NSE'}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="trade-type-tabs">
          <button
            type="button"
            className={`trade-tab ${tradeType === 'BUY' ? 'active-buy' : ''}`}
            onClick={() => {
              setTradeType('BUY');
              setErrorMsg('');
            }}
          >
            BUY
          </button>
          <button
            type="button"
            className={`trade-tab ${tradeType === 'SELL' ? 'active-sell' : ''}`}
            onClick={() => {
              setTradeType('SELL');
              setErrorMsg('');
            }}
          >
            SELL
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleExecuteTrade} className="trade-modal-body">
          {/* Price Banner */}
          <div className="trade-price-display">
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                MARKET PRICE
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tradeType === 'BUY' ? 'AVAILABLE CASH' : 'SHARES OWNED'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {tradeType === 'BUY'
                  ? `₹${Number(user?.virtualBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : `${quote?.ownedShares ?? 0} Shares`}
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--loss-light)',
              border: '1px solid var(--loss-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--loss-dark)',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--gain-light)',
              border: '1px solid var(--gain-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gain-dark)',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quantity Input */}
          <div className="form-group">
            <label className="form-label">Order Quantity (Shares)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                value={quantity}
                onChange={handleQuantityChange}
                required
                placeholder="Number of shares"
              />
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '0 16px', fontWeight: 700 }}
                onClick={() => setQuantity((prev) => Math.max(1, (parseInt(prev, 10) || 0) + 1))}
              >
                +1
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '0 16px', fontWeight: 700 }}
                onClick={() => setQuantity((prev) => Math.max(1, (parseInt(prev, 10) || 1) + 10))}
              >
                +10
              </button>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="order-summary-box">
            <div className="summary-row">
              <span>Gross Value ({numQty} × ₹{currentPrice.toFixed(2)})</span>
              <span>₹{estimatedGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Estimated Brokerage & Taxes <Info size={13} color="var(--text-muted)" />
              </span>
              <span>₹{estimatedCharges.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>{tradeType === 'BUY' ? 'Total Required' : 'Net Proceeds'}</span>
              <span style={{ color: tradeType === 'BUY' ? 'var(--primary)' : 'var(--gain-dark)' }}>
                ₹{netEstimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className={`btn ${tradeType === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading
                ? 'Processing Order...'
                : `${tradeType === 'BUY' ? 'Confirm Purchase' : 'Confirm Sale'} (₹${netEstimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
