// src/pages/school/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaSchool,
  FaEye,
  FaEyeSlash,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/school/register.css';

// Validation schema
const schema = yup.object().shape({
  full_name: yup.string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+\-\s()]{10,15}$/, 'Please enter a valid phone number'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  terms: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: '#D32F2F'
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const password = watch('password', '');
  const fullName = watch('full_name', '');

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const strengthMap = {
      0: { label: 'Very Weak', color: '#EF4444' },
      1: { label: 'Weak', color: '#F59E0B' },
      2: { label: 'Fair', color: '#FDB813' },
      3: { label: 'Good', color: '#3A7BD5' },
      4: { label: 'Strong', color: '#1A8A4A' },
      5: { label: 'Very Strong', color: '#10B981' }
    };

    setPasswordStrength({
      score,
      ...strengthMap[score]
    });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const userData = {
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'School Admin' // Fixed role
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login to continue.' 
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Left Side - Branding */}
        <div className="register-brand">
          <div className="brand-content">
            <div className="brand-logo">
              <FaSchool className="logo-icon" />
              <span>ZSSCMS</span>
            </div>
            <h1>School Admin Registration</h1>
            <p>Create your account to manage your school's sports activities</p>
            <div className="brand-features">
              <div className="feature">
                <FaCheckCircle />
                <span>Manage school profile</span>
              </div>
              <div className="feature">
                <FaCheckCircle />
                <span>Register and manage students</span>
              </div>
              <div className="feature">
                <FaCheckCircle />
                <span>Participate in competitions</span>
              </div>
              <div className="feature">
                <FaCheckCircle />
                <span>Track team performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in the details to register as a school admin</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="register-form">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="full_name"
                    placeholder="Enter your full name"
                    className={`form-input ${errors.full_name ? 'error' : ''}`}
                    {...register('full_name')}
                  />
                </div>
                {errors.full_name && (
                  <span className="error-message">{errors.full_name.message}</span>
                )}
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    placeholder="Choose a username"
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username.message}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-group">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+255 712 345 678"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
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
                    placeholder="Create a strong password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    {...register('password')}
                    onChange={(e) => {
                      register('password').onChange(e);
                      checkPasswordStrength(e.target.value);
                    }}
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
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    <span 
                      className="strength-label"
                      style={{ color: passwordStrength.color }}
                    >
                      Password Strength: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('terms')}
                  />
                  <span className="checkbox-text">
                    I agree to the <Link to="/terms">Terms and Conditions</Link> and 
                    <Link to="/privacy"> Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && (
                  <span className="error-message">{errors.terms.message}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner small />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="form-footer">
                <span>Already have an account?</span>
                <Link to="/login">Login here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;