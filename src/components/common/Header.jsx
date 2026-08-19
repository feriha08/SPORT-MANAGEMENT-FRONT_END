import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrophy, FaUser, FaBell, FaSearch, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link to="/" className="header-brand">
          <FaTrophy className="header-logo-icon" />
          <span className="header-brand-text">SS&MS</span>
        </Link>
      </div>

      <div className="header-center">
        <div className="header-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">

        <div className="header-user">
          <button 
            className="header-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <span className="user-name">{user?.full_name || user?.username || 'User'}</span>
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="dropdown-name">{user?.full_name || user?.username || 'User'}</p>
                  <p className="dropdown-role">{user?.role || 'Guest'}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <FaUser /> Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <FaCog /> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;