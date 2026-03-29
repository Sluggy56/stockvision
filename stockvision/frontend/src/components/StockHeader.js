import React from 'react';
import './StockHeader.css';

function fmt(n, decimals = 2) {
  if (n == null) return 'N/A';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMarketCap(n) {
  if (!n) return 'N/A';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n}`;
}

export default function StockHeader({ data, isFavorite, onToggleFavorite, onAddToPortfolio }) {
  const change = data.currentPrice - data.previousClose;
  const changePct = (change / data.previousClose) * 100;
  const isUp = change >= 0;

  return (
    <div className="stock-header">
      <div className="stock-info">
        <div className="symbol-badge">{data.symbol}</div>
        <div className="stock-name-group">
          <h2 className="stock-name">{data.name}</h2>
          {data.sector && data.sector !== 'N/A' && (
            <span className="sector-tag">{data.sector}</span>
          )}
        </div>
      </div>

      <div className="stock-price-group">
        <div className={`stock-price ${isUp ? 'positive' : 'negative'}`}>
          {data.currency === 'INR' ? '₹' : '$'}{fmt(data.currentPrice)}
        </div>
        <div className={`stock-change ${isUp ? 'positive' : 'negative'}`}>
          <span className="change-arrow">{isUp ? '▲' : '▼'}</span>
          {fmt(Math.abs(change))} ({fmt(Math.abs(changePct))}%)
        </div>
      </div>

      <div className="stock-stats">
        <StatItem label="Market Cap" value={fmtMarketCap(data.marketCap)} />
        <StatItem label="Volume" value={data.volume ? Number(data.volume).toLocaleString() : 'N/A'} />
        <StatItem label="P/E Ratio" value={data.pe ? fmt(data.pe) : 'N/A'} />
        <StatItem label="52W High" value={data.high52w ? `$${fmt(data.high52w)}` : 'N/A'} className="positive" />
        <StatItem label="52W Low" value={data.low52w ? `$${fmt(data.low52w)}` : 'N/A'} className="negative" />
      </div>

      <div className="stock-actions">
        <button
          className={`fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={onToggleFavorite}
          title={isFavorite ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isFavorite ? '⭐' : '☆'} {isFavorite ? 'Watching' : 'Watch'}
        </button>
        <button className="btn btn-primary" onClick={onAddToPortfolio}>
          + Portfolio
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value, className }) {
  return (
    <div className="stat-item">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${className || ''}`}>{value}</div>
    </div>
  );
}
