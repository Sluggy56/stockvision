import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const POPULAR = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
];

export default function SearchBar({ onSearch, currentSymbol }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && e.target !== inputRef.current) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(POPULAR.slice(0, 6));
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/search/${query}`);
        const data = await res.json();
        setResults(data.length ? data : POPULAR.filter(s =>
          s.symbol.includes(query.toUpperCase()) || s.name.toUpperCase().includes(query.toUpperCase())
        ).slice(0, 6));
      } catch {
        setResults(POPULAR.filter(s =>
          s.symbol.includes(query.toUpperCase()) || s.name.toUpperCase().includes(query.toUpperCase())
        ).slice(0, 6));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => {
    onSearch(symbol);
    setQuery('');
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim().toUpperCase());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-icon">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          className="search-input"
          placeholder={`Search stocks... (${currentSymbol})`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="clear-btn" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
            ×
          </button>
        )}
      </form>

      {open && (
        <div ref={dropdownRef} className="search-dropdown">
          {!query && <div className="dropdown-section-label">Popular</div>}
          {loading && <div className="dropdown-loading">Searching...</div>}
          {!loading && results.map(r => (
            <button key={r.symbol} className="dropdown-item" onClick={() => handleSelect(r.symbol)}>
              <span className="item-symbol">{r.symbol}</span>
              <span className="item-name">{r.name}</span>
            </button>
          ))}
          {!loading && results.length === 0 && query && (
            <div className="dropdown-empty">No results. Try pressing Enter to search "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
}
