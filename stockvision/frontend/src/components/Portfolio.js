import React, { useState, useEffect } from 'react';
import './Portfolio.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function fmt(n, d = 2) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

export default function Portfolio({ portfolio, onRemove, onSelectStock }) {
  const [prices, setPrices] = useState({});
  const [addForm, setAddForm] = useState({ symbol: '', shares: '', buyPrice: '' });
  const [showForm, setShowForm] = useState(false);

  // Fetch live prices for portfolio items
  useEffect(() => {
    const symbols = [...new Set(portfolio.map(p => p.symbol))];
    symbols.forEach(async (sym) => {
      try {
        const res = await fetch(`${API_BASE}/api/stock/${sym}?period=2d`);
        const data = await res.json();
        if (!data.error) {
          setPrices(prev => ({ ...prev, [sym]: data.currentPrice }));
        }
      } catch {
        // Use stored price as fallback
        const item = portfolio.find(p => p.symbol === sym);
        if (item) setPrices(prev => ({ ...prev, [sym]: item.price }));
      }
    });
  }, [portfolio]);

  const getStats = () => {
    let totalValue = 0, totalCost = 0;
    portfolio.forEach(p => {
      const currentPrice = prices[p.symbol] || p.price;
      totalValue += currentPrice * p.shares;
      totalCost += p.buyPrice * p.shares;
    });
    const totalPnL = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalPnL, pnlPct };
  };

  const stats = getStats();

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Portfolio</h2>
          <p className="page-sub">{portfolio.length} positions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Position'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="portfolio-summary">
        <SummaryCard label="Total Value" value={`$${fmt(stats.totalValue)}`} />
        <SummaryCard label="Total Cost" value={`$${fmt(stats.totalCost)}`} />
        <SummaryCard
          label="Total P&L"
          value={`${stats.totalPnL >= 0 ? '+' : ''}$${fmt(Math.abs(stats.totalPnL))}`}
          className={stats.totalPnL >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          label="Return %"
          value={`${stats.pnlPct >= 0 ? '+' : ''}${fmt(stats.pnlPct)}%`}
          className={stats.pnlPct >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Add form */}
      {showForm && (
        <AddForm
          form={addForm}
          setForm={setAddForm}
          onClose={() => setShowForm(false)}
          onSelectStock={onSelectStock}
        />
      )}

      {/* Positions table */}
      {portfolio.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <div className="empty-title">No positions yet</div>
          <div className="empty-sub">Search for a stock and click "+ Portfolio" to add positions here.</div>
        </div>
      ) : (
        <div className="positions-table">
          <div className="table-header">
            <span>Symbol</span>
            <span>Shares</span>
            <span>Buy Price</span>
            <span>Current</span>
            <span>Value</span>
            <span>P&L</span>
            <span>Return</span>
            <span></span>
          </div>
          {portfolio.map(pos => {
            const currentPrice = prices[pos.symbol] || pos.price;
            const value = currentPrice * pos.shares;
            const cost = pos.buyPrice * pos.shares;
            const pnl = value - cost;
            const ret = (pnl / cost) * 100;
            const isUp = pnl >= 0;
            return (
              <div key={pos.id} className="table-row">
                <button className="sym-link" onClick={() => onSelectStock(pos.symbol)}>
                  <span className="pos-symbol">{pos.symbol}</span>
                  <span className="pos-name">{pos.name}</span>
                </button>
                <span className="mono">{pos.shares}</span>
                <span className="mono">${fmt(pos.buyPrice)}</span>
                <span className="mono">${fmt(currentPrice)}</span>
                <span className="mono">${fmt(value)}</span>
                <span className={`mono ${isUp ? 'positive' : 'negative'}`}>
                  {isUp ? '+' : ''}${fmt(Math.abs(pnl))}
                </span>
                <span className={`mono ${isUp ? 'positive' : 'negative'}`}>
                  {isUp ? '+' : ''}{fmt(ret)}%
                </span>
                <button className="remove-pos-btn" onClick={() => onRemove(pos.id)} title="Remove">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, className }) {
  return (
    <div className="summary-card">
      <div className="summary-label">{label}</div>
      <div className={`summary-value ${className || ''}`}>{value}</div>
    </div>
  );
}

function AddForm({ form, setForm, onClose, onSelectStock }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.symbol || !form.shares || !form.buyPrice) return;
    onSelectStock(form.symbol.toUpperCase());
    onClose();
  };

  return (
    <div className="add-form">
      <h3 className="add-form-title">Add Position</h3>
      <form onSubmit={handleSubmit} className="add-form-grid">
        <div className="form-group">
          <label>Symbol</label>
          <input className="input" placeholder="e.g. AAPL" value={form.symbol}
            onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })} />
        </div>
        <div className="form-group">
          <label>Shares</label>
          <input className="input" type="number" placeholder="e.g. 10" value={form.shares}
            onChange={e => setForm({ ...form, shares: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Buy Price ($)</label>
          <input className="input" type="number" step="0.01" placeholder="e.g. 150.00" value={form.buyPrice}
            onChange={e => setForm({ ...form, buyPrice: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
          Add
        </button>
      </form>
    </div>
  );
}
