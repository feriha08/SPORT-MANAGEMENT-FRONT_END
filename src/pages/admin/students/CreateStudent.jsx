import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaUser, FaCalendarAlt, FaSave, FaImage,
  FaUsers, FaMale, FaFemale, FaSchool, FaTrophy
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import { useAuth } from '../../../context/authContext'; // ADD THIS IMPORT
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import '../competitions/CompetitionForm.css';

// Validation schema - removed email, phone_number, username
const studentSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  gender: yup.string().required('Gender is required'),
  date_of_birth: yup.string().required('Date of birth is required'),
  school: yup.string().required('School is required'),
  sports: yup.array(),
  profile_picture: yup.mixed().nullable(),
  is_active: yup.boolean(),
});

const CreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [schools, setSchools] = useState([]);
  const [sports, setSports] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Now useAuth is defined

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  }, []);

  const fetchData = async () => {
    try {
      const [schoolsRes, sportsRes] = await Promise.all([
        axiosInstance.get('schools/'),
        axiosInstance.get('sports/')
      ]);
      setSchools(schoolsRes.data.results || schoolsRes.data || []);
      setSports(sportsRes.data.results || sportsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    } finally {
      setFetchingData(false);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('profile_picture', file);
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
      formData.append('is_active', data.is_active);
      
      if (data.sports && data.sports.length > 0) {
        data.sports.forEach(sportId => {
          formData.append('sports', sportId);
        });
      }

      if (data.profile_picture) {
        formData.append('profile_picture', data.profile_picture);
      }

      console.log('📤 Creating student with data:', data);

      const response = await axiosInstance.post('students/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Student created:', response.data);
      toast.success('🎉 Student created successfully!');
      
      setTimeout(() => {
        navigate('/admin/students');
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating student:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create student. ';
        
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
        toast.error('Failed to create student. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <h1 className="form-title">Create Student</h1>
          <p className="form-subtitle">Add a new student to the system</p>
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
                          setValue('profile_picture', null);
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
                  Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create Student
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateStudent;