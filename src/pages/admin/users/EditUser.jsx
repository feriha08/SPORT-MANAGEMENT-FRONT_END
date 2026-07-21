import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaUser, FaEnvelope, FaLock, 
  FaPhone, FaSave, FaUsers, FaSchool,
  FaUserCog, FaUserGraduate, FaUserTie,
  FaTrash, FaCheck, FaTimes, FaSync
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
  full_name: yup.string().required('Full name is required'),
  phone_number: yup.string(),
  role: yup.string().required('Role is required'),
  school: yup.string().when('role', {
    is: (role) => role === 'School Admin' || role === 'school_admin',
    then: () => yup.string().required('School is required for School Admin'),
    otherwise: () => yup.string().nullable(),
  }),
  is_active: yup.boolean(),
});

const EditUser = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [schools, setSchools] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      full_name: '',
      phone_number: '',
      role: '',
      school: '',
      is_active: true,
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    fetchUserData();
    fetchSchools();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`accounts/${id}/`);
      const user = response.data;
      setUserData(user);
      
      console.log('Fetched user data:', user);
      
      // Set form values
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('full_name', user.full_name || '');
      setValue('phone_number', user.phone_number || '');
      
      // Map backend role to frontend display
      const roleMap = {
        'super_admin': 'Super Admin',
        'school_admin': 'School Admin',
        'referee': 'Referee',
        'public_user': 'Public User',
      };
      setValue('role', roleMap[user.role] || user.role || '');
      
      setValue('school', user.school?.id || '');
      setValue('is_active', user.is_active !== undefined ? user.is_active : true);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data');
      navigate('/admin/users');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get('schools/');
      setSchools(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('📤 Sending update data:', data);
      
      // Map role back to backend format
      const roleMap = {
        'Super Admin': 'super_admin',
        'School Admin': 'school_admin',
        'Referee': 'referee',
        'Public User': 'public_user',
      };
      
      const payload = {
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        phone_number: data.phone_number || '',
        role: roleMap[data.role] || data.role,
        is_active: data.is_active,
      };

      if ((data.role === 'School Admin' || data.role === 'school_admin') && data.school) {
        payload.school = data.school;
      }

      console.log('📤 Final payload:', payload);

      const response = await axiosInstance.put(`accounts/${id}/`, payload);
      
      console.log('✅ Update response:', response.data);
      
      toast.success('✅ User updated successfully!');
      
      setTimeout(() => {
        navigate('/admin/users', { state: { refresh: true } });
      }, 1000);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update user. ';
        
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
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`accounts/${id}/`);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      navigate('/admin/users', { state: { refresh: true } });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  const refreshData = async () => {
    setFetchingData(true);
    await fetchUserData();
    setFetchingData(false);
    toast.info('Data refreshed');
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
          <h1 className="form-title">Edit User</h1>
          <p className="form-subtitle">Update user information</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={refreshData} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
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
                  <option value="Public User">Public User</option>
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
                  Updating...
                </>
              ) : (
                <>
                  <FaSave /> Update User
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete User</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{userData?.username}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. All associated data will be deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;