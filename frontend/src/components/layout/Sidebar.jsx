import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Bookmark,
  History,
  Newspaper,
  User,
  ShieldCheck,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, mobileOpen, closeMobileSidebar }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Market Explorer', path: '/stocks', icon: TrendingUp },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { label: 'Transactions', path: '/transactions', icon: History },
    { label: 'Market News', path: '/news', icon: Newspaper },
    { label: 'Account & Settings', path: '/profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 99
          }}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <TrendingUp size={20} />
            </div>
            {!isCollapsed && <span>TradeX</span>}
          </div>

          {/* Mobile close button */}
          <button
            onClick={closeMobileSidebar}
            style={{
              color: 'var(--sidebar-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={19} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="demo-badge-pill">
              <ShieldCheck size={16} />
              <span>Virtual Simulation Mode</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
