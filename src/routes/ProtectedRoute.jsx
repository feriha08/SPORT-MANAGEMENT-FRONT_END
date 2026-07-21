import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6B7280'
      }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but we don't have user data yet
  if (!user) {
    console.log('No user data yet, showing loading');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6B7280'
      }}>
        Loading user data...
      </div>
    );
  }

  // Get user role
  const userRole = user?.role || 'public_user';
  console.log('User role in ProtectedRoute:', userRole);

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    console.log('No roles required, allowing access');
    return children;
  }

  // Check if user has required role
  const hasAllowedRole = allowedRoles.some(role => {
    if (role === 'Super Admin' && userRole === 'Super Admin') return true;
    if (role === 'School Admin' && (userRole === 'school_admin' || userRole === 'School Admin')) return true;
    if (role === 'Referee' && (userRole === 'referee' || userRole === 'Referee')) return true;
    return false;
  });

  console.log('Has allowed role:', hasAllowedRole);

  // If user doesn't have required role, redirect
  if (!hasAllowedRole) {
    console.log('User does not have required role, redirecting...');
    if (userRole === 'Super Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'school_admin' || userRole === 'School Admin') {
      return <Navigate to="/school/dashboard" replace />;
    } else if (userRole === 'referee' || userRole === 'Referee') {
      return <Navigate to="/referee/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // User has required role, render children
  console.log('Access granted!');
  return children;
};

export default ProtectedRoute;