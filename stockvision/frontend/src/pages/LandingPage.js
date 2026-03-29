import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const MOCK_STOCKS = [
  { sym: 'AAPL', price: '189.84', chg: '+1.23%', up: true },
  { sym: 'TSLA', price: '248.42', chg: '+3.81%', up: true },
  { sym: 'NVDA', price: '623.91', chg: '+2.14%', up: true },
  { sym: 'MSFT', price: '415.32', chg: '-0.42%', up: false },
  { sym: 'AMZN', price: '186.70', chg: '+0.97%', up: true },
  { sym: 'META', price: '502.30', chg: '+1.66%', up: true },
  { sym: 'GOOGL', price: '172.15', chg: '-0.31%', up: false },
  { sym: 'BTC', price: '67,420', chg: '+4.20%', up: true },
];

export default function LandingPage({ onEnter, onLogin }) {
  const [mode, setMode] = useState('landing'); // landing | login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    onLogin({ name: form.name || form.email.split('@')[0], email: form.email });
  };

  return (
    <div className="landing">
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Grid */}
      <div className="landing-grid" />

      {/* Ticker */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {[...MOCK_STOCKS, ...MOCK_STOCKS].map((s, i) => (
            <span key={i} className={`ticker-item ${s.up ? 'up' : 'down'}`}>
              <span className="ticker-sym">{s.sym}</span>
              <span className="ticker-price">{s.price}</span>
              <span className="ticker-chg">{s.chg}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        {mode === 'landing' && (
          <div className="hero animate-fade-up">
            <div className="hero-badge">
              <span className="badge-dot" />
              AI-POWERED MARKET INTELLIGENCE
            </div>

            <h1 className="hero-title">
              <span className="title-line">STOCK</span>
              <span className="title-accent">VISION</span>
            </h1>

            <p className="hero-subtitle">
              Harness LSTM neural networks to predict market movements.<br />
              Real-time data. Deep analysis. Intelligent forecasting.
            </p>

            <div className="hero-stats">
              {[
                { label: 'Accuracy', value: '94.2%' },
                { label: 'Stocks Tracked', value: '10,000+' },
                { label: 'Predictions/Day', value: '50,000+' },
              ].map(s => (
                <div key={s.label} className="hero-stat">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <button className="cta-btn primary" onClick={() => setMode('signup')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Get Started Free
              </button>
              <button className="cta-btn ghost" onClick={() => setMode('login')}>
                Sign In
              </button>
              <button className="cta-btn outline" onClick={onEnter}>
                Explore Demo
              </button>
            </div>

            <div className="features-grid">
              {[
                { icon: '⚡', title: 'Real-Time Data', desc: 'Live quotes from Yahoo Finance' },
                { icon: '🧠', title: 'LSTM AI Model', desc: '7-day price predictions' },
                { icon: '📊', title: 'Advanced Charts', desc: 'Candlestick, RSI, MACD' },
                { icon: '💼', title: 'Portfolio Tracker', desc: 'Track your holdings' },
                { icon: '⭐', title: 'Watchlist', desc: 'Save favorite stocks' },
                { icon: '🌍', title: 'Global Markets', desc: 'US, India, Crypto & more' },
              ].map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div className="auth-box animate-fade-up">
            <div className="auth-logo">STOCKVISION</div>
            <h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-sub">{mode === 'login' ? 'Sign in to your dashboard' : 'Start your free AI trading journey'}</p>

            <form className="auth-form" onSubmit={handleAuth}>
              {mode === 'signup' && (
                <div className="form-group">
                  <label>Name</label>
                  <input className="input" placeholder="Your name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="cta-btn primary full">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'login' ? (
                <>Don't have an account? <button onClick={() => setMode('signup')}>Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>
              )}
            </div>
            <div className="auth-switch">
              <button onClick={onEnter}>Continue as Guest →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
