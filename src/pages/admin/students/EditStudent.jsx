import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaUser, FaCalendarAlt, FaSave, FaImage,
  FaUsers, FaSchool, FaTrophy, FaTrash, FaCheck, FaTimes
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import '../competitions/CompetitionForm.css';

const studentSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  gender: yup.string().required('Gender is required'),
  date_of_birth: yup.string().required('Date of birth is required'),
  school: yup.string().required('School is required'),
  sports: yup.array(),
  profile_picture: yup.mixed().nullable(),
  is_active: yup.boolean(),
});

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [schools, setSchools] = useState([]);
  const [sports, setSports] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      full_name: '',
      gender: '',
      date_of_birth: '',
      school: '',
      sports: [],
      profile_picture: null,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, schoolsRes, sportsRes] = await Promise.all([
        axiosInstance.get(`students/${id}/`),
        axiosInstance.get('schools/'),
        axiosInstance.get('sports/')
      ]);
      
      const student = studentRes.data;
      setStudentData(student);
      
      // IMPORTANT: Set isActive correctly
      setIsActive(student.is_active === true);
      
      setValue('full_name', student.full_name || '');
      setValue('gender', student.gender || '');
      setValue('date_of_birth', student.date_of_birth || '');
      setValue('school', student.school || '');
      setValue('is_active', student.is_active === true);
      
      // Handle sports
      if (student.sport_assignments && student.sport_assignments.length > 0) {
        const sportIds = student.sport_assignments.map(s => s.sport);
        setValue('sports', sportIds);
      }
      
      if (student.profile_picture) {
        setProfilePreview(student.profile_picture);
      }
      
      setSchools(schoolsRes.data.results || schoolsRes.data || []);
      setSports(sportsRes.data.results || sportsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load student data');
      navigate('/admin/students');
    } finally {
      setFetchingData(false);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('gender', data.gender);
      formData.append('date_of_birth', data.date_of_birth);
      formData.append('school', data.school);
      formData.append('is_active', data.is_active ? 'true' : 'false');
      
      // Send sports as JSON
      if (data.sports && data.sports.length > 0) {
        formData.append('sports', JSON.stringify(data.sports));
      }

      if (profileFile) {
        formData.append('profile_picture', profileFile);
      }

      console.log('📤 Updating student:', data);

      const response = await axiosInstance.put(`students/${id}/manage/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Student updated:', response.data);
      toast.success('🎉 Student updated successfully!');
      
      setTimeout(() => {
        navigate('/admin/students');
      }, 1500);
    } catch (error) {
      console.error('❌ Error updating student:', error);
      if (error.response) {
        toast.error(error.response.data?.detail || 'Failed to update student');
      } else {
        toast.error('Failed to update student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const formData = new FormData();
      formData.append('is_active', (!isActive).toString());
      
      await axiosInstance.put(`students/${id}/manage/`, formData);
      setIsActive(!isActive);
      toast.success(`Student ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle student status');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`students/${id}/manage/`);
      toast.success('Student deleted successfully');
      setShowDeleteModal(false);
      navigate('/admin/students');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete student');
    }
  };

  if (fetchingData) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="competition-form-page">
      <div className="form-header">
        <Link to="/admin/students" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div>
          <h1 className="form-title">Edit Student</h1>
          <p className="form-subtitle">Update student information</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button 
            onClick={handleToggleStatus} 
            className={`btn ${isActive ? 'btn-warning' : 'btn-success'}`}
          >
            {isActive ? <FaTimes /> : <FaCheck />} 
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="status-badge-container">
        <span className={`status-badge-large ${isActive ? 'status-active' : 'status-inactive'}`}>
          Status: {isActive ? 'Active' : 'Inactive'}
        </span>
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

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <select
                  id="gender"
                  {...register('gender')}
                  className={`form-control ${errors.gender ? 'error' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {errors.gender && (
                <span className="error-message">{errors.gender.message}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="date_of_birth">
                Date of Birth <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                  className={`form-control ${errors.date_of_birth ? 'error' : ''}`}
                />
              </div>
              {errors.date_of_birth && (
                <span className="error-message">{errors.date_of_birth.message}</span>
              )}
            </div>

            {/* School */}
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

            {/* Sports */}
            <div className="form-group">
              <label htmlFor="sports">Sports</label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <select
                  id="sports"
                  multiple
                  {...register('sports')}
                  className={`form-control ${errors.sports ? 'error' : ''}`}
                  style={{ height: '100px' }}
                >
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.sports && (
                <span className="error-message">{errors.sports.message}</span>
              )}
              <small className="field-help">Hold Ctrl/Cmd to select multiple sports</small>
            </div>

            {/* Profile Picture */}
            <div className="form-group">
              <label htmlFor="profile_picture">Profile Picture</label>
              <div className="file-upload-wrapper">
                <div className="file-upload-area" style={{ minHeight: '120px' }}>
                  {profilePreview ? (
                    <div className="logo-preview">
                      <img 
                        src={profilePreview} 
                        alt="Profile" 
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <button
                        type="button"
                        className="remove-logo"
                        onClick={() => {
                          setProfilePreview(null);
                          setProfileFile(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <FaImage className="upload-icon" />
                      <span>Click to upload profile picture</span>
                      <span className="upload-hint">PNG, JPG up to 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileChange}
                        className="file-input"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

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
              <small className="field-help">Uncheck to deactivate student</small>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/admin/students" className="btn btn-secondary">
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
                  <FaSave /> Update Student
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
              <h3>Delete Student</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{studentData?.full_name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditStudent;