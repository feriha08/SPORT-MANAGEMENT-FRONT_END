import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrophy, FaUser, FaBell, FaSearch, FaSignOutAlt, FaCog, FaSchool, FaTshirt, FaFutbol, FaChartBar, FaClipboardList, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    // Redirect based on user role
    if (user?.role === 'super_admin') {
      navigate('/login');
    } else if (user?.role === 'school_admin') {
      navigate('/school/login');
    } else if (user?.role === 'referee') {
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'school_admin':
        return 'School Admin';
      case 'referee':
        return 'Referee';
      default:
        return 'Guest';
    }
  };

  const getDropdownItems = () => {
    const role = user?.role || 'public_user';
    
    // SUPER ADMIN
    if (role === 'super_admin') {
      return (
        <>
          <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaChartBar /> Admin Dashboard
          </Link>
          <Link to="/admin/schools" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaSchool /> Manage Schools
          </Link>
          <Link to="/admin/users" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaUser /> Manage Users
          </Link>
          <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaUser /> Profile
          </Link>
        </>
      );
    }
    
    // SCHOOL ADMIN
    else if (role === 'school_admin') {
      return (
        <>
          <Link to="/school/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaChartBar /> School Dashboard
          </Link>
          <Link to="/school/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaSchool /> School Profile
          </Link>
          <Link to="/school/students" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaUserGraduate /> Manage Students
          </Link>
          <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
            <FaUser /> Profile
          </Link>
        </>
      );
    }
    
// SCHOOL ADMIN
else if (role === 'school_admin') {
  return (
    <>
      <Link to="/school/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
        <FaChartBar /> School Dashboard
      </Link>
      <Link to="/school/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
        <FaSchool /> School Profile
      </Link>
      <Link to="/school/students" className="dropdown-item" onClick={() => setShowDropdown(false)}>
        <FaUserGraduate /> Manage Students
      </Link>
      <Link to="/school/teams" className="dropdown-item" onClick={() => setShowDropdown(false)}>
        <FaTshirt /> My Teams
      </Link>
      <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
        <FaUser /> Profile
      </Link>
    </>
  );
}
    
    // DEFAULT
    return (
      <>
        <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
          <FaUser /> Profile
        </Link>
      </>
    );
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
                  <p className="dropdown-role">{getRoleLabel(user?.role)}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              {getDropdownItems()}
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