import React, { useState } from 'react';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
];

export default function Sidebar({ activeView, setActiveView, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">SV</div>
        {!collapsed && <span className="logo-text">STOCKVISION</span>}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="nav-item collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle">
          <span className="nav-icon">{collapsed ? '▶' : '◀'}</span>
          {!collapsed && <span className="nav-label">Collapse</span>}
        </button>
        {user ? (
          <button className="nav-item logout-btn" onClick={onLogout} title="Logout">
            <span className="nav-icon">⎋</span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        ) : null}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="market-status">
              <span className="status-dot live" />
              Markets Live
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
