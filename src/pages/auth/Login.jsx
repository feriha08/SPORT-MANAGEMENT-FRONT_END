import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import './auth.css';

// Validation schema
const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user);
    }
  }, [isAuthenticated, user]);

  const redirectUser = (userData) => {
    const role = userData?.role || 'public_user';
    
    if (role === 'Super Admin' || role === 'super_admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'School Admin' || role === 'school_admin') {
      navigate('/school/dashboard', { replace: true });
    } else if (role === 'Referee' || role === 'referee') {
      navigate('/referee/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Clear any old tokens before login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      const result = await login(data.username, data.password);
      
      if (result.success) {
        toast.success('Login successful!');
        
        const userData = result.user;
        console.log('User logged in:', userData);
        
        // Redirect based on role
        redirectUser(userData);
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors.join(', '));
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaTrophy className="logo-icon" />
            <h1>SS&MS</h1>
            <span>Sports School & Management System</span>
          </div>
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register('username')}
                className={`form-control ${errors.username ? 'error' : ''}`}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`form-control ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          {/* Options */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" {...register('rememberMe')} disabled={isLoading} />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Register Link */}
          <p className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;