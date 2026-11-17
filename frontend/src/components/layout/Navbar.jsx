import React from 'react';
import { Menu, Wallet, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleMobileSidebar, toggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();

  const formattedBalance = user?.virtualBalance !== undefined
    ? Number(user.virtualBalance).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00';

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="navbar-market-status">
          <span className="pulse-indicator"></span>
          <span>Market Open (Simulated)</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Virtual balance indicator */}
        <div className="virtual-balance-chip" title="Simulated virtual cash for training">
          <Wallet size={16} color="#059669" />
          <div>
            <div className="virtual-balance-label">Virtual Cash</div>
            <div className="virtual-balance-amount">₹{formattedBalance}</div>
          </div>
        </div>

        {/* Profile Dropdown / Link */}
        <Link to="/profile" className="user-profile-menu-btn" title="View Profile">
          <div className="user-avatar">{userInitial}</div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name?.split(' ')[0] || 'User'}
          </span>
        </Link>

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Sign Out"
        >
          <LogOut size={15} />
          <span style={{ display: 'none', md: 'inline' }}>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
