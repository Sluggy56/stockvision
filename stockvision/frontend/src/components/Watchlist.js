import React, { useState, useEffect } from 'react';
import './Watchlist.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function generateMiniSparkline(canvas, prices, isUp) {
  if (!canvas || !prices.length) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 80;
  const H = canvas.height = 36;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const toY = (p) => H - ((p - min) / range) * H * 0.8 - H * 0.1;
  const toX = (i) => (i / (prices.length - 1)) * W;
  const color = isUp ? '#10b981' : '#ef4444';

  ctx.clearRect(0, 0, W, H);

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, isUp ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)');
  grad.addColorStop(1, 'transparent');
  ctx.beginPath();
  prices.forEach((p, i) => {
    i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p));
  });
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  prices.forEach((p, i) => {
    i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p));
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function WatchCard({ symbol, onSelect, onRemove }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stock/${symbol}?period=1mo`);
        const data = await res.json();
        if (mounted && !data.error) setInfo(data);
        else if (mounted) {
          // Mock fallback
          const price = 100 + Math.random() * 300;
          const chg = (Math.random() - 0.45) * 5;
          setInfo({
            symbol, name: symbol, currentPrice: parseFloat(price.toFixed(2)),
            previousClose: parseFloat((price - chg * price / 100).toFixed(2)),
            prices: Array.from({ length: 30 }, (_, i) => price + (Math.random() - 0.5) * price * 0.03 * i * 0.1),
          });
        }
      } catch {
        if (mounted) {
          const price = 100 + Math.random() * 300;
          setInfo({
            symbol, name: symbol, currentPrice: parseFloat(price.toFixed(2)),
            previousClose: parseFloat((price * 0.985).toFixed(2)),
            prices: Array.from({ length: 30 }, () => price + (Math.random() - 0.5) * price * 0.02),
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [symbol]);

  useEffect(() => {
    if (info?.prices && canvasRef.current) {
      const isUp = info.currentPrice >= info.previousClose;
      generateMiniSparkline(canvasRef.current, info.prices.slice(-30), isUp);
    }
  }, [info]);

  if (loading) {
    return (
      <div className="watch-card skeleton-card">
        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4, marginTop: 8 }} />
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 4, marginTop: 8 }} />
      </div>
    );
  }

  if (!info) return null;

  const change = info.currentPrice - info.previousClose;
  const changePct = (change / info.previousClose) * 100;
  const isUp = change >= 0;

  return (
    <div className="watch-card" onClick={() => onSelect(symbol)}>
      <div className="watch-card-top">
        <div>
          <div className="watch-symbol">{symbol}</div>
          <div className="watch-name">{info.name}</div>
        </div>
        <button className="remove-btn" onClick={e => { e.stopPropagation(); onRemove(symbol); }} title="Remove">×</button>
      </div>
      <div className="watch-price-row">
        <div className={`watch-price ${isUp ? 'positive' : 'negative'}`}>
          ${info.currentPrice?.toFixed(2)}
        </div>
        <div className={`watch-change ${isUp ? 'positive' : 'negative'}`}>
          {isUp ? '+' : ''}{changePct.toFixed(2)}%
        </div>
      </div>
      <canvas ref={canvasRef} className="watch-sparkline" />
    </div>
  );
}

export default function Watchlist({ favorites, onSelectStock, onToggleFavorite }) {
  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h2 className="page-title">Watchlist</h2>
        <p className="page-sub">{favorites.length} stocks tracked</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <div className="empty-title">No stocks in watchlist</div>
          <div className="empty-sub">Search for a stock and click Watch to add it here.</div>
        </div>
      ) : (
        <div className="watch-grid">
          {favorites.map(sym => (
            <WatchCard
              key={sym}
              symbol={sym}
              onSelect={onSelectStock}
              onRemove={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
