import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSave, FaTrophy, FaCalendarAlt, 
  FaUsers, FaFutbol, FaVenusMars, FaClock,
  FaPlus, FaTimes
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './CompetitionForm.css';

// Validation schema
const competitionSchema = yup.object({
  name: yup.string().required('Competition name is required'),
  sport: yup.string().required('Sport is required'),
  season: yup.string().required('Season is required'),
  gender: yup.string().required('Gender is required'),
  max_age: yup.number()
    .typeError('Must be a number')
    .min(5, 'Minimum age is 5')
    .max(25, 'Maximum age is 25'),
  registration_deadline: yup.string().required('Registration deadline is required'),
  status: yup.string().required('Status is required'),
  description: yup.string(),
});

const CreateCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [fetchingSports, setFetchingSports] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(competitionSchema),
    defaultValues: {
      name: '',
      sport: '',
      season: new Date().getFullYear().toString(),
      gender: 'Mixed',
      max_age: 18,
      registration_deadline: '',
      status: 'Draft',
      description: '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await axiosInstance.get('sports/');
      console.log('Sports response:', response.data);
      setSports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
      // Sample sports if API fails
      setSports([
        { id: 1, name: 'Football' },
        { id: 2, name: 'Netball' },
        { id: 3, name: 'Volleyball' },
        { id: 4, name: 'Basketball' },
        { id: 5, name: 'Athletics' },
        { id: 6, name: 'Rugby' },
        { id: 7, name: 'Swimming' },
      ]);
    } finally {
      setFetchingSports(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Creating competition with data:', data);
      
      const payload = {
        name: data.name,
        sport: data.sport,
        season: data.season,
        gender: data.gender,
        max_age: data.max_age ? parseInt(data.max_age) : null,
        registration_deadline: data.registration_deadline,
        status: data.status,
        description: data.description || '',
      };

      const response = await axiosInstance.post('competitions/create/', payload);
      
      console.log('Competition created:', response.data);
      toast.success('🎉 Competition created successfully!');
      
      // Redirect to competitions list after 1.5 seconds
      setTimeout(() => {
        navigate('/admin/competitions');
      }, 1500);
    } catch (error) {
      console.error('Error creating competition:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        console.log('Error data:', errorData);
        
        let errorMessage = 'Failed to create competition. ';
        
        if (typeof errorData === 'object') {
          const errors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            } else if (typeof messages === 'object') {
              for (const [subField, subMessages] of Object.entries(messages)) {
                if (Array.isArray(subMessages)) {
                  errors.push(`${field}.${subField}: ${subMessages.join(', ')}`);
                }
              }
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          }
        }
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': '#6B7280',
      'Open': '#3B82F6',
      'Closed': '#EF4444',
      'Ongoing': '#F59E0B',
      'Completed': '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  if (fetchingSports) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="competition-form-page">
      <div className="form-header">
        <Link to="/admin/competitions" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="form-header-right">
          <h1 className="form-title">Create Competition</h1>
          <p className="form-subtitle">Set up a new sports competition</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Competition Name */}
            <div className="form-group form-group-full">
              <label htmlFor="name">
                Competition Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter competition name"
                  {...register('name')}
                  className={`form-control ${errors.name ? 'error' : ''}`}
                />
              </div>
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            {/* Sport */}
            <div className="form-group">
              <label htmlFor="sport">
                Sport <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaFutbol className="input-icon" />
                <select
                  id="sport"
                  {...register('sport')}
                  className={`form-control ${errors.sport ? 'error' : ''}`}
                >
                  <option value="">Select Sport</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.name}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.sport && (
                <span className="error-message">{errors.sport.message}</span>
              )}
            </div>

            {/* Season */}
            <div className="form-group">
              <label htmlFor="season">
                Season <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  id="season"
                  type="text"
                  placeholder="e.g., 2026"
                  {...register('season')}
                  className={`form-control ${errors.season ? 'error' : ''}`}
                />
              </div>
              {errors.season && (
                <span className="error-message">{errors.season.message}</span>
              )}
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaVenusMars className="input-icon" />
                <select
                  id="gender"
                  {...register('gender')}
                  className={`form-control ${errors.gender ? 'error' : ''}`}
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              {errors.gender && (
                <span className="error-message">{errors.gender.message}</span>
              )}
            </div>

            {/* Max Age */}
            <div className="form-group">
              <label htmlFor="max_age">Maximum Age</label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <input
                  id="max_age"
                  type="number"
                  placeholder="e.g., 18"
                  {...register('max_age')}
                  className={`form-control ${errors.max_age ? 'error' : ''}`}
                  min="5"
                  max="25"
                />
              </div>
              {errors.max_age && (
                <span className="error-message">{errors.max_age.message}</span>
              )}
              <small className="field-help">Age limit for participants (5-25)</small>
            </div>

            {/* Registration Deadline */}
            <div className="form-group">
              <label htmlFor="registration_deadline">
                Registration Deadline <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaClock className="input-icon" />
                <input
                  id="registration_deadline"
                  type="datetime-local"
                  {...register('registration_deadline')}
                  className={`form-control ${errors.registration_deadline ? 'error' : ''}`}
                />
              </div>
              {errors.registration_deadline && (
                <span className="error-message">{errors.registration_deadline.message}</span>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <select
                  id="status"
                  {...register('status')}
                  className={`form-control ${errors.status ? 'error' : ''}`}
                  style={{ borderColor: selectedStatus ? getStatusColor(selectedStatus) : '' }}
                >
                  <option value="Draft">📝 Draft</option>
                  <option value="Open">🔓 Open</option>
                  <option value="Closed">🔒 Closed</option>
                  <option value="Ongoing">🔄 Ongoing</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>
              {errors.status && (
                <span className="error-message">{errors.status.message}</span>
              )}
              <small className="field-help">
                {selectedStatus === 'Draft' && 'Competition is being prepared'}
                {selectedStatus === 'Open' && 'Schools can register for this competition'}
                {selectedStatus === 'Closed' && 'Registration is closed'}
                {selectedStatus === 'Ongoing' && 'Competition is currently in progress'}
                {selectedStatus === 'Completed' && 'Competition has finished'}
              </small>
            </div>

            {/* Description */}
            <div className="form-group form-group-full">
              <label htmlFor="description">Description</label>
              <div className="input-wrapper">
                <textarea
                  id="description"
                  placeholder="Enter competition description..."
                  {...register('description')}
                  className={`form-control ${errors.description ? 'error' : ''}`}
                  rows="4"
                />
              </div>
              {errors.description && (
                <span className="error-message">{errors.description.message}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/admin/competitions" className="btn btn-secondary">
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
                  <FaSave /> Create Competition
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCompetition;