import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaUser, FaEnvelope, FaLock, 
  FaPhone, FaSave, FaUsers, FaSchool,
  FaUserCog, FaUserGraduate, FaUserTie
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './UserForm.css';

// Validation schema
const userSchema = yup.object({
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup.string().required('Role is required'),
  full_name: yup.string().required('Full name is required'),
  phone_number: yup.string(),
  school: yup.string().when('role', {
    is: (role) => role === 'School Admin' || role === 'school_admin',
    then: () => yup.string().required('School is required for School Admin'),
    otherwise: () => yup.string().nullable(),
  }),
  is_active: yup.boolean(),
});

const CreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      full_name: '',
      phone_number: '',
      school: '',
      is_active: true,
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get('schools/');
      setSchools(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number || '',
        role: data.role,
        is_active: data.is_active,
      };

      // Add school if role is School Admin
      if ((data.role === 'School Admin' || data.role === 'school_admin') && data.school) {
        payload.school = data.school;
      }

      console.log('Creating user with payload:', payload);

      // If role is Super Admin, use different endpoint
      let response;
      if (data.role === 'Super Admin' || data.role === 'super_admin') {
        // Super Admin creation might need special handling
        response = await axiosInstance.post('accounts/create-superadmin/', payload);
      } else if (data.role === 'Referee' || data.role === 'referee') {
        response = await axiosInstance.post('accounts/create-referee/', payload);
      } else {
        response = await axiosInstance.post('accounts/register/', payload);
      }

      console.log('User created:', response.data);
      toast.success('🎉 User created successfully!');
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create user. ';
        
        if (typeof errorData === 'object') {
          const errors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          }
        }
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Super Admin': <FaUserTie />,
      'School Admin': <FaSchool />,
      'Referee': <FaUserGraduate />,
    };
    return icons[role] || <FaUser />;
  };

  if (fetchingData) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="user-form-page">
      <div className="form-header">
        <Link to="/admin/users" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div>
          <h1 className="form-title">Create User</h1>
          <p className="form-subtitle">Add a new user to the system</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="full_name">
                Full Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="full_name"
                  type="text"
                  placeholder="Enter full name"
                  {...register('full_name')}
                  className={`form-control ${errors.full_name ? 'error' : ''}`}
                />
              </div>
              {errors.full_name && (
                <span className="error-message">{errors.full_name.message}</span>
              )}
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">
                Username <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Choose username"
                  {...register('username')}
                  className={`form-control ${errors.username ? 'error' : ''}`}
                />
              </div>
              {errors.username && (
                <span className="error-message">{errors.username.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register('email')}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  id="phone_number"
                  type="tel"
                  placeholder="Enter phone number"
                  {...register('phone_number')}
                  className={`form-control ${errors.phone_number ? 'error' : ''}`}
                />
              </div>
              {errors.phone_number && (
                <span className="error-message">{errors.phone_number.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Create password (min 8 chars)"
                  {...register('password')}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                />
              </div>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
              <small className="field-help">
                Must contain uppercase, lowercase, and at least one number
              </small>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  {...register('confirmPassword')}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Role */}
            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <select
                  id="role"
                  {...register('role')}
                  className={`form-control ${errors.role ? 'error' : ''}`}
                >
                  <option value="">Select Role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="School Admin">School Admin</option>
                  <option value="Referee">Referee</option>
                </select>
              </div>
              {errors.role && (
                <span className="error-message">{errors.role.message}</span>
              )}
            </div>

            {/* School (conditional) */}
            {(selectedRole === 'School Admin' || selectedRole === 'school_admin') && (
              <div className="form-group">
                <label htmlFor="school">
                  School <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FaSchool className="input-icon" />
                  <select
                    id="school"
                    {...register('school')}
                    className={`form-control ${errors.school ? 'error' : ''}`}
                  >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.school && (
                  <span className="error-message">{errors.school.message}</span>
                )}
              </div>
            )}

            {/* Active Status */}
            <div className="form-group">
              <label htmlFor="is_active">Status</label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                />
                <label htmlFor="is_active" className="checkbox-label">
                  Active
                </label>
              </div>
              <small className="field-help">Uncheck to deactivate user</small>
            </div>
          </div>

          {/* Role Preview */}
          {selectedRole && (
            <div className="role-preview">
              <div className="role-preview-icon">
                {getRoleIcon(selectedRole)}
              </div>
              <div>
                <p className="role-preview-title">Selected Role</p>
                <p className="role-preview-value">{selectedRole}</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <Link to="/admin/users" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create User
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;