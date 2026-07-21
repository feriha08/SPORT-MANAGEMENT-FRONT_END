import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaTrophy, FaUserPlus } from 'react-icons/fa';
import axiosInstance from '../../api/axios';
import './auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        toast.error('Please login as Super Admin first');
        navigate('/login');
        return;
      }

      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        role: 'school_admin'
      };

      console.log('📤 Sending registration data:', requestData);

      const response = await axiosInstance.post(
        'accounts/register/',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Registration response:', response.data);

      toast.success('🎉 School Admin registered successfully!');
      
      setFormData({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Registration failed. ';
        
        if (typeof errorData === 'object') {
          const errors = [];
          
          if (errorData.username) {
            errors.push(`Username: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`);
          }
          if (errorData.email) {
            errors.push(`Email: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`);
          }
          if (errorData.password) {
            errors.push(`Password: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`);
          }
          if (errorData.full_name) {
            errors.push(`Full Name: ${Array.isArray(errorData.full_name) ? errorData.full_name.join(', ') : errorData.full_name}`);
          }
          if (errorData.phone_number) {
            errors.push(`Phone: ${Array.isArray(errorData.phone_number) ? errorData.phone_number.join(', ') : errorData.phone_number}`);
          }
          if (errorData.detail) {
            errors.push(errorData.detail);
          }
          if (errorData.non_field_errors) {
            errors.push(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors);
          }
          
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        }
        
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <FaTrophy className="logo-icon" />
            <h1>SS&MS</h1>
            <span>Register School Admin</span>
          </div>
        </div>

        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Register a new school administrator</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create password (min 8 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="info-message">
              <FaUserPlus className="info-icon" />
              <div>
                <p><strong>Note:</strong> You must be logged in as <strong>Super Admin</strong> to register a School Admin.</p>
                <p>If you are not logged in, please <Link to="/login">login here</Link> first.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-register"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Registering...
              </>
            ) : (
              'Register School Admin'
            )}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;