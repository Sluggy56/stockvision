import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import StockHeader from '../components/StockHeader';
import PriceChart from '../components/PriceChart';
import PredictionChart from '../components/PredictionChart';
import IndicatorPanel from '../components/IndicatorPanel';
import Portfolio from '../components/Portfolio';
import Watchlist from '../components/Watchlist';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function Dashboard({ user, favorites, portfolio, onLogout, onToggleFavorite, onAddToPortfolio, onRemoveFromPortfolio }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1y');
  const [chartType, setChartType] = useState('line');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMAs, setShowMAs] = useState({ ma20: true, ma50: true, ma200: false });

  const fetchStock = useCallback(async (sym, per) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/stock/${sym}?period=${per}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStockData(data);
    } catch (e) {
      setError(`Failed to load ${sym}: ${e.message}`);
      // Use mock data for demo
      setStockData(generateMockData(sym));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock(symbol, period);
  }, [symbol, period, fetchStock]);

  const handleSearch = (sym) => {
    setSymbol(sym.toUpperCase());
    setActiveView('dashboard');
  };

  return (
    <div className="dashboard">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <SearchBar onSearch={handleSearch} currentSymbol={symbol} />
          <div className="header-actions">
            {user && <span className="user-greeting">Hey, <strong>{user.name}</strong></span>}
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="dashboard-content">
            {loading && <LoadingSpinner />}
            {error && !loading && (
              <div className="error-banner">⚠ {error} — showing demo data</div>
            )}

            {stockData && !loading && (
              <>
                <StockHeader
                  data={stockData}
                  isFavorite={favorites.includes(stockData.symbol)}
                  onToggleFavorite={() => onToggleFavorite(stockData.symbol)}
                  onAddToPortfolio={() => onAddToPortfolio({
                    symbol: stockData.symbol,
                    name: stockData.name,
                    price: stockData.currentPrice,
                    shares: 1,
                    buyPrice: stockData.currentPrice,
                    date: new Date().toISOString().split('T')[0]
                  })}
                />

                {/* Chart Controls */}
                <div className="chart-controls">
                  <div className="period-tabs">
                    {['1mo', '3mo', '6mo', '1y', '2y', '5y'].map(p => (
                      <button key={p} className={`period-tab ${period === p ? 'active' : ''}`}
                        onClick={() => setPeriod(p)}>
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="chart-type-tabs">
                    {['line', 'candle', 'area'].map(t => (
                      <button key={t} className={`type-tab ${chartType === t ? 'active' : ''}`}
                        onClick={() => setChartType(t)}>
                        {t === 'line' ? '📈' : t === 'candle' ? '🕯' : '🌊'} {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MA toggles */}
                <div className="ma-toggles">
                  {Object.entries(showMAs).map(([key, val]) => (
                    <button key={key}
                      className={`ma-toggle ${val ? 'active' : ''} ma-${key}`}
                      onClick={() => setShowMAs(prev => ({ ...prev, [key]: !prev[key] }))}>
                      {key.toUpperCase()}
                    </button>
                  ))}
                  <span className="ma-label">Moving Averages</span>
                </div>

                <div className="charts-grid">
                  <div className="chart-card main-chart">
                    <div className="card-label">Price Chart · {stockData.symbol}</div>
                    <PriceChart data={stockData} chartType={chartType} showMAs={showMAs} />
                  </div>

                  <div className="chart-card prediction-chart">
                    <div className="card-label">
                      <span className="ai-badge">🧠 LSTM AI</span>
                      7-Day Forecast
                    </div>
                    <PredictionChart data={stockData} />
                  </div>

                  <div className="chart-card indicator-rsi">
                    <div className="card-label">RSI · Relative Strength Index</div>
                    <IndicatorPanel data={stockData} type="rsi" />
                  </div>

                  <div className="chart-card indicator-macd">
                    <div className="card-label">MACD · Moving Average Convergence Divergence</div>
                    <IndicatorPanel data={stockData} type="macd" />
                  </div>

                  <div className="chart-card volume-chart">
                    <div className="card-label">Volume</div>
                    <IndicatorPanel data={stockData} type="volume" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeView === 'watchlist' && (
          <Watchlist
            favorites={favorites}
            onSelectStock={handleSearch}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {activeView === 'portfolio' && (
          <Portfolio
            portfolio={portfolio}
            onRemove={onRemoveFromPortfolio}
            onSelectStock={handleSearch}
          />
        )}
      </main>
    </div>
  );
}

// Mock data for demo/offline use
function generateMockData(symbol) {
  const days = 365;
  const dates = [];
  const prices = [];
  const volumes = [];
  const candles = [];
  let price = 150 + Math.random() * 200;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const change = (Math.random() - 0.48) * price * 0.025;
    price = Math.max(10, price + change);
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const dateStr = d.toISOString().split('T')[0];
    dates.push(dateStr);
    prices.push(parseFloat(price.toFixed(2)));
    volumes.push(Math.floor(Math.random() * 80000000 + 20000000));
    candles.push({ x: dateStr, o: parseFloat(open.toFixed(2)), h: parseFloat(high.toFixed(2)), l: parseFloat(low.toFixed(2)), c: parseFloat(price.toFixed(2)), v: volumes[volumes.length-1] });
  }

  // Indicators
  const rsi = prices.map((_, i) => {
    if (i < 14) return 50;
    const gains = []; const losses = [];
    for (let j = i-13; j <= i; j++) {
      const d = prices[j] - prices[j-1];
      if (d > 0) gains.push(d); else losses.push(Math.abs(d));
    }
    const ag = gains.reduce((a,b)=>a+b,0)/14;
    const al = losses.reduce((a,b)=>a+b,0)/14 || 0.001;
    return parseFloat((100 - 100/(1+ag/al)).toFixed(2));
  });

  const ma = (arr, n) => arr.map((_, i) => i < n-1 ? null : parseFloat((arr.slice(i-n+1,i+1).reduce((a,b)=>a+b,0)/n).toFixed(2)));
  
  const predDates = [];
  const lastDate = new Date(dates[dates.length-1]);
  for (let i = 1; i <= 7; i++) {
    const d = new Date(lastDate); d.setDate(d.getDate()+i);
    while(d.getDay()===0||d.getDay()===6) d.setDate(d.getDate()+1);
    predDates.push(d.toISOString().split('T')[0]);
  }

  const lastPrice = prices[prices.length-1];
  const trend = (prices[prices.length-1] - prices[prices.length-10]) / 10;
  const predictions = Array.from({length:7}, (_,i) => parseFloat((lastPrice + trend*(i+1) + (Math.random()-0.5)*lastPrice*0.01).toFixed(2)));

  return {
    symbol,
    name: symbol + ' Corp.',
    sector: 'Technology',
    currency: 'USD',
    currentPrice: prices[prices.length-1],
    previousClose: prices[prices.length-2],
    marketCap: Math.floor(price * 1e9),
    volume: volumes[volumes.length-1],
    pe: 25.4,
    high52w: Math.max(...prices),
    low52w: Math.min(...prices),
    dates,
    prices,
    volumes,
    candles,
    rsi,
    ma20: ma(prices, 20),
    ma50: ma(prices, 50),
    ma200: ma(prices, 200),
    macd: prices.map(() => (Math.random()-0.5)*5),
    macdSignal: prices.map(() => (Math.random()-0.5)*3),
    macdHist: prices.map(() => (Math.random()-0.5)*2),
    predictions,
    predDates,
  };
}
