import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import './auth.css';

const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const result = await login(data.username, data.password);
      
      if (result.success) {
        toast.success('Login successful!');
        
        const userData = result.user;
        console.log('User data:', userData);
        console.log('User role:', userData?.role);
        
        // SIMPLE REDIRECT LOGIC
        const role = userData?.role || 'public_user';
        
        // Use window.location for force redirect
        if (role === 'Super Admin') {
          console.log('Redirecting to admin dashboard...');
          window.location.href = '/admin/dashboard';
        } else if (role === 'school_admin' || role === 'School Admin') {
          console.log('Redirecting to school dashboard...');
          window.location.href = '/school/dashboard';
        } else if (role === 'referee' || role === 'Referee') {
          console.log('Redirecting to referee dashboard...');
          window.location.href = '/referee/dashboard';
        } else {
          console.log('Public user, redirecting to home...');
          window.location.href = '/';
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
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
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register('username')}
                className={errors.username ? 'error' : ''}
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
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

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" {...register('rememberMe')} />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%',padding: '10px', borderRadius: '10px' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;