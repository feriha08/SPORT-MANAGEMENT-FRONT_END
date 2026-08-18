import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSave, FaTrophy, FaCalendarAlt, 
  FaUsers, FaFutbol, FaVenusMars, FaClock,
  FaTrash, FaSync
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

const EditCompetition = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [competitionData, setCompetitionData] = useState(null);
  const [sports, setSports] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(competitionSchema),
    defaultValues: {
      name: '',
      sport: '',
      season: '',
      gender: '',
      max_age: '',
      registration_deadline: '',
      status: '',
      description: '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [compRes, sportsRes] = await Promise.all([
        axiosInstance.get(`competitions/${id}/`),
        axiosInstance.get('sports/')
      ]);
      
      const competition = compRes.data;
      setCompetitionData(competition);
      
      // Set form values
      setValue('name', competition.name || '');
      setValue('season', competition.season || '');
      setValue('gender', competition.gender || 'mixed');
      setValue('max_age', competition.max_age || 18);
      setValue('registration_deadline', competition.registration_deadline || '');
      setValue('status', competition.status || 'draft');
      setValue('description', competition.description || '');
      
      // Find sport name from ID
      const sportsList = sportsRes.data.results || sportsRes.data || [];
      const sportObj = sportsList.find(s => s.id === competition.sport);
      if (sportObj) {
        setValue('sport', sportObj.name);
      }
      
      setSports(sportsList);
    } catch (error) {
      console.error('Error fetching competition:', error);
      toast.error('Failed to load competition data');
      navigate('/admin/competitions');
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Map sport name to ID
      const selectedSport = sports.find(s => s.name === data.sport);
      if (!selectedSport) {
        toast.error('Please select a valid sport');
        setLoading(false);
        return;
      }

      // Build payload with only changed fields
      const payload = {};
      
      if (data.name !== competitionData.name) {
        payload.name = data.name;
      }
      
      if (selectedSport.id !== competitionData.sport) {
        payload.sport = selectedSport.id;
      }
      
      if (data.season !== competitionData.season) {
        payload.season = data.season;
      }
      
      const genderLower = data.gender.toLowerCase();
      if (genderLower !== competitionData.gender) {
        payload.gender = genderLower;
      }
      
      const maxAge = parseInt(data.max_age);
      if (maxAge !== competitionData.max_age) {
        payload.max_age = maxAge;
      }
      
      if (data.registration_deadline !== competitionData.registration_deadline) {
        payload.registration_deadline = data.registration_deadline;
      }
      
      const statusLower = data.status.toLowerCase();
      if (statusLower !== competitionData.status) {
        payload.status = statusLower;
      }
      
      if (data.description !== (competitionData.description || '')) {
        payload.description = data.description;
      }

      // If no changes, show message
      if (Object.keys(payload).length === 0) {
        toast.info('No changes detected');
        setLoading(false);
        return;
      }

      console.log('📤 Updating competition with payload:', payload);

      const response = await axiosInstance.put(`competitions/${id}/manage/`, payload);
      
      console.log('✅ Competition updated:', response.data);
      toast.success('🎉 Competition updated successfully!');
      
      setTimeout(() => {
        navigate('/admin/competitions');
      }, 1500);
    } catch (error) {
      console.error('❌ Error updating competition:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to update competition. ';
        
        if (typeof errorData === 'object') {
          if (errorData.error) {
            errorMessage = errorData.error;
          } else {
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
        }
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update competition. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`competitions/${id}/manage/`);
      toast.success('Competition deleted successfully');
      setShowDeleteModal(false);
      navigate('/admin/competitions');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete competition');
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.info('Data refreshed');
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#6B7280',
      'open': '#3B82F6',
      'closed': '#EF4444',
      'ongoing': '#F59E0B',
      'completed': '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': '📝 Draft',
      'open': '🔓 Open',
      'closed': '🔒 Closed',
      'ongoing': '🔄 Ongoing',
      'completed': '✅ Completed'
    };
    return labels[status] || status;
  };

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'mixed', label: 'Mixed' }
  ];

  // Status options
  const statusOptions = [
    { value: 'draft', label: '📝 Draft' },
    { value: 'open', label: '🔓 Open' },
    { value: 'closed', label: '🔒 Closed' },
    { value: 'ongoing', label: '🔄 Ongoing' },
    { value: 'completed', label: '✅ Completed' }
  ];

  if (fetchingData) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="competition-form-page">
      <div className="form-header">
        <Link to={`/admin/competitions/${id}`} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="form-header-right">
          <h1 className="form-title">Edit Competition</h1>
          <p className="form-subtitle">Update competition details</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="status-badge-container">
        <span 
          className="status-badge-large" 
          style={{ 
            backgroundColor: getStatusColor(selectedStatus || competitionData?.status),
            color: '#FFFFFF'
          }}
        >
          Status: {getStatusLabel(selectedStatus || competitionData?.status)}
        </span>
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
                  <option value="">Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  <option value="">Select Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.status && (
                <span className="error-message">{errors.status.message}</span>
              )}
              <small className="field-help">
                {selectedStatus === 'draft' && 'Competition is being prepared'}
                {selectedStatus === 'open' && 'Schools can register for this competition'}
                {selectedStatus === 'closed' && 'Registration is closed'}
                {selectedStatus === 'ongoing' && 'Competition is currently in progress'}
                {selectedStatus === 'completed' && 'Competition has finished'}
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
            <Link to={`/admin/competitions/${id}`} className="btn btn-secondary">
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
                  <FaSave /> Update Competition
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
              <h3>Delete Competition</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{competitionData?.name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. All associated data will be deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCompetition;