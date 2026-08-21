import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/common/Button';
import { FaSchool, FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import './SchoolAuth.css';

const SchoolAdminRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.includes('@')) {
      errors.email = 'Enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}accounts/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'school_admin',
        phone_number: formData.phone_number || undefined
      });

      if (response.status === 201) {
        // Registration successful - redirect to login with success message
        navigate('/school/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          } 
        });
      }
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        
        // Handle field-specific errors
        if (data.username) {
          setFieldErrors({ ...fieldErrors, username: data.username[0] });
        }
        if (data.email) {
          setFieldErrors({ ...fieldErrors, email: data.email[0] });
        }
        if (data.password) {
          setFieldErrors({ ...fieldErrors, password: data.password[0] });
        }
        if (data.error) {
          setError(data.error);
        }
        
        // If no specific field errors, show general error
        if (!data.username && !data.email && !data.password && !data.error) {
          setError('Registration failed. Please check your information and try again.');
        }
      } else {
        setError('Network error. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon">
            <FaSchool />
          </div>
          <h2>School Admin Registration</h2>
          <p>Register your school admin account</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
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
                placeholder="Choose a username"
                required
                className={fieldErrors.username ? 'input-error' : ''}
              />
              {fieldErrors.username && (
                <span className="field-error">{fieldErrors.username}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="form-icon" />
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className={fieldErrors.email ? 'input-error' : ''}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone_number">
                <FaPhone className="form-icon" />
                Phone Number <span className="optional">(optional)</span>
              </label>
              <input
                id="phone_number"
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="form-row">
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
                placeholder="At least 8 characters"
                required
                minLength={8}
                className={fieldErrors.password ? 'input-error' : ''}
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="confirm_password">
                <FaLock className="form-icon" />
                Confirm Password
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className={fieldErrors.confirm_password ? 'input-error' : ''}
              />
              {fieldErrors.confirm_password && (
                <span className="field-error">{fieldErrors.confirm_password}</span>
              )}
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/school/login">Login here</Link>
          </p>
        </div>
        
        <div className="auth-back-link">
          <Link to="/login">← Back to general login</Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminRegister;