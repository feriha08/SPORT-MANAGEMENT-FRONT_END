// src/pages/school/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaSchool,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/school/login.css';

const schema = yup.object().shape({
  username: yup.string()
    .required('Username is required'),
  password: yup.string()
    .required('Password is required'),
  rememberMe: yup.boolean()
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rememberMe: false
    }
  });

  const rememberMe = watch('rememberMe');

  // Check for registration success message
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'Super Admin':
        navigate('/admin/dashboard');
        break;
      case 'School Admin':
        navigate('/school/dashboard');
        break;
      case 'Referee':
        navigate('/referee/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setLoginError('');
      
      const result = await login({
        username: data.username,
        password: data.password
      });

      if (result.success) {
        const userRole = result.user?.role;
        if (userRole === 'School Admin') {
          navigate('/school/dashboard');
        } else if (userRole === 'Super Admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'Referee') {
          navigate('/referee/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setLoginError('Invalid username or password. Please try again.');
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <FaSchool className="logo-icon" />
                <span>ZSSCMS</span>
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to your school admin account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username or email"
                    className={`form-input ${errors.username || loginError ? 'error' : ''}`}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    className={`form-input ${errors.password || loginError ? 'error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
              </div>

              {/* Login Error */}
              {loginError && (
                <div className="login-error">
                  {loginError}
                </div>
              )}

              {/* Options */}
              <div className="login-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner small />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="btn-icon" />
                  </>
                )}
              </button>

              <div className="login-footer">
                <span>Don't have an account?</span>
                <Link to="/register">Register here</Link>
              </div>

              <div className="login-divider">
                <span>or</span>
              </div>

              <div className="login-role-info">
                <p>School Admin login</p>
                <small>Manage your school's sports activities</small>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-badge">
              <FaSchool />
              <span>School Admin</span>
            </div>
            <h1>School Sports Management</h1>
            <p>Manage your school's participation in sports competitions, register students, and track performance all in one place.</p>
            <div className="brand-stats">
              <div className="stat">
                <span className="stat-number">100+</span>
                <span className="stat-label">Schools Registered</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Active Competitions</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Students Enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;