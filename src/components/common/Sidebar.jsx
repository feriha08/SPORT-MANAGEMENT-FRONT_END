import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTrophy, FaHome, FaUsers, FaSchool, 
  FaUserGraduate, FaCalendarAlt, FaFutbol,
  FaFileAlt, FaCog, FaSignOutAlt, FaChartBar,
  FaTshirt, FaUserCog, FaClipboardList, FaPlus,
  FaUserPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaBuilding, FaUserCircle, FaUserTie, FaRegChartBar,
  FaUsersCog
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role || 'public_user';
    
    // SUPER ADMIN
    if (role === 'Super Admin' || role === 'super_admin') {
      return [
        { path: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { path: '/admin/schools', icon: <FaSchool />, label: 'Schools' },
        { path: '/admin/students', icon: <FaUserGraduate />, label: 'Students' },
        { path: '/admin/competitions', icon: <FaTrophy />, label: 'Competitions' },
        { path: '/admin/fixtures', icon: <FaCalendarAlt />, label: 'Fixtures' },
        { path: '/admin/matches', icon: <FaFutbol />, label: 'Matches' },
        { path: '/admin/reports', icon: <FaFileAlt />, label: 'Reports' },
        { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
      ];
    } 
    
    // SCHOOL ADMIN
    else if (role === 'School Admin' || role === 'school_admin') {
      return [
        { path: '/school/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/school/register-school', icon: <FaPlus />, label: 'Register School' },
        { path: '/school/profile', icon: <FaBuilding />, label: 'School Profile' },
        { path: '/school/students', icon: <FaUserGraduate />, label: 'Students' },
        { path: '/school/teams', icon: <FaTshirt />, label: 'My Teams' },
        { path: '/school/competitions', icon: <FaTrophy />, label: 'Competitions' },
        { path: '/school/fixtures', icon: <FaCalendarAlt />, label: 'Fixtures' },
        { path: '/school/matches', icon: <FaFutbol />, label: 'Matches' },
        { path: '/school/reports', icon: <FaFileAlt />, label: 'Reports' },
      ];
    } 
    
    // REFEREE
    else if (role === 'Referee' || role === 'referee') {
      return [
        { path: '/referee/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/referee/matches', icon: <FaFutbol />, label: 'My Matches' },
        { path: '/referee/results', icon: <FaClipboardList />, label: 'Match Results' },
        { path: '/referee/profile', icon: <FaUserCog />, label: 'Profile' },
      ];
    }
    
    // PUBLIC USER or default
    return [
      { path: '/', icon: <FaHome />, label: 'Home' },
      { path: '/competitions', icon: <FaTrophy />, label: 'Competitions' },
      { path: '/schools', icon: <FaSchool />, label: 'Schools' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <FaTrophy className="sidebar-logo-icon" />
            <span className="sidebar-brand-text">SS&MS</span>
          </Link>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.full_name || user?.username || 'User'}</p>
            <p className="sidebar-user-role">
              {getRoleLabel(user?.role)}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  toggleSidebar();
                }
              }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;