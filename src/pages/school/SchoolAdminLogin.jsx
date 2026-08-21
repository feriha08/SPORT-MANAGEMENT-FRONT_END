import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Button from '../../components/common/Button';
import { FaSchool, FaUser, FaLock } from 'react-icons/fa';
import './SchoolAuth.css';

const SchoolAdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'school_admin') {
      navigate('/school/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        if (result.user?.role === 'school_admin') {
          navigate('/school/dashboard');
        } else {
          setError('This account is not a School Admin. Please use the appropriate login.');
          // Logout if wrong role
          const { logout } = useAuth();
          logout();
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <FaSchool />
          </div>
          <h2>School Admin Login</h2>
          <p>Welcome back! Login to manage your school.</p>
        </div>
        
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <FaUser className="form-icon" />
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="form-icon" />
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/school/register">Register here</Link>
          </p>
        </div>
        
        <div className="auth-back-link">
          <Link to="/login">← Back to general login</Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminLogin;