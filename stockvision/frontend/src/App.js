import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  const [entered, setEntered] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sv_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('sv_favorites') || '["AAPL","TSLA","NVDA"]');
  });
  const [portfolio, setPortfolio] = useState(() => {
    return JSON.parse(localStorage.getItem('sv_portfolio') || '[]');
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sv_user', JSON.stringify(userData));
    setEntered(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sv_user');
    setEntered(false);
  };

  const toggleFavorite = (symbol) => {
    setFavorites(prev => {
      const updated = prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem('sv_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const addToPortfolio = (item) => {
    setPortfolio(prev => {
      const updated = [...prev, { ...item, id: Date.now() }];
      localStorage.setItem('sv_portfolio', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromPortfolio = (id) => {
    setPortfolio(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('sv_portfolio', JSON.stringify(updated));
      return updated;
    });
  };

  if (!entered && !user) {
    return <LandingPage onEnter={() => setEntered(true)} onLogin={login} />;
  }

  return (
    <Dashboard
      user={user}
      favorites={favorites}
      portfolio={portfolio}
      onLogout={logout}
      onToggleFavorite={toggleFavorite}
      onAddToPortfolio={addToPortfolio}
      onRemoveFromPortfolio={removeFromPortfolio}
    />
  );
}

export default App;
