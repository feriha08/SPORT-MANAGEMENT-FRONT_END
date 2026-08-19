import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSave, FaCalendarAlt, FaClock, 
  FaMapMarkerAlt, FaUsers, FaTrophy, FaFutbol,
  FaUserCheck
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import '../fixtures/FixtureForm.css';

// Validation schema
const matchSchema = yup.object({
  fixture: yup.string().required('Fixture is required'),
  home_score: yup.number()
    .typeError('Must be a number')
    .min(0, 'Score cannot be negative')
    .nullable(),
  away_score: yup.number()
    .typeError('Must be a number')
    .min(0, 'Score cannot be negative')
    .nullable(),
  status: yup.string().required('Status is required'),
  referee: yup.string(),
  venue: yup.string(),
  match_date: yup.string().required('Match date is required'),
  match_time: yup.string().required('Match time is required'),
});

const CreateMatch = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fixtures, setFixtures] = useState([]);
  const [referees, setReferees] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(matchSchema),
    defaultValues: {
      fixture: '',
      home_score: '',
      away_score: '',
      status: 'Scheduled',
      referee: '',
      venue: '',
      match_date: '',
      match_time: '',
    },
  });

  const selectedFixtureId = watch('fixture');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFixtureId) {
      const fixture = fixtures.find(f => f.id === parseInt(selectedFixtureId));
      setSelectedFixture(fixture);
      if (fixture) {
        setValue('venue', fixture.venue || '');
        setValue('match_date', fixture.match_date || '');
        setValue('match_time', fixture.match_time || '');
        setValue('referee', fixture.referee || '');
      }
    }
  }, [selectedFixtureId, fixtures, setValue]);

  const fetchData = async () => {
    try {
      const [fixturesRes, refereesRes] = await Promise.all([
        axiosInstance.get('fixtures/'),
        axiosInstance.get('accounts/list/?role=referee')
      ]);
      setFixtures(fixturesRes.data.results || fixturesRes.data || []);
      setReferees(refereesRes.data.results || refereesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        fixture: parseInt(data.fixture),
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        status: data.status,
        referee: data.referee || null,
        venue: data.venue || '',
        match_date: data.match_date,
        match_time: data.match_time,
      };

      console.log('📤 Creating match with payload:', payload);

      const response = await axiosInstance.post('matches/create/', payload);
      
      console.log('✅ Match created:', response.data);
      toast.success('🎉 Match created successfully!');
      
      setTimeout(() => {
        navigate('/admin/matches');
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating match:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create match. ';
        
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
        toast.error('Failed to create match. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Scheduled', label: '📅 Scheduled' },
    { value: 'Ongoing', label: '🔄 Ongoing' },
    { value: 'Finished', label: '✅ Finished' },
    { value: 'Cancelled', label: '❌ Cancelled' }
  ];

  if (fetchingData) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="fixture-form-page">
      <div className="form-header">
        <Link to="/admin/matches" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="form-header-right">
          <h1 className="form-title">Create Match</h1>
          <p className="form-subtitle">Add a new match to the system</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Fixture */}
            <div className="form-group">
              <label htmlFor="fixture">
                Fixture <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <select
                  id="fixture"
                  {...register('fixture')}
                  className={`form-control ${errors.fixture ? 'error' : ''}`}
                >
                  <option value="">Select Fixture</option>
                  {fixtures.map((fixture) => (
                    <option key={fixture.id} value={fixture.id}>
                      {fixture.home_team} vs {fixture.away_team} ({fixture.competition_name || fixture.competition?.name})
                    </option>
                  ))}
                </select>
              </div>
              {errors.fixture && (
                <span className="error-message">{errors.fixture.message}</span>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaFutbol className="input-icon" />
                <select
                  id="status"
                  {...register('status')}
                  className={`form-control ${errors.status ? 'error' : ''}`}
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
            </div>

            {/* Home Score */}
            <div className="form-group">
              <label htmlFor="home_score">Home Score</label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <input
                  id="home_score"
                  type="number"
                  placeholder="Home score"
                  {...register('home_score')}
                  className={`form-control ${errors.home_score ? 'error' : ''}`}
                  min="0"
                />
              </div>
              {errors.home_score && (
                <span className="error-message">{errors.home_score.message}</span>
              )}
            </div>

            {/* Away Score */}
            <div className="form-group">
              <label htmlFor="away_score">Away Score</label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <input
                  id="away_score"
                  type="number"
                  placeholder="Away score"
                  {...register('away_score')}
                  className={`form-control ${errors.away_score ? 'error' : ''}`}
                  min="0"
                />
              </div>
              {errors.away_score && (
                <span className="error-message">{errors.away_score.message}</span>
              )}
            </div>

            {/* Venue */}
            <div className="form-group">
              <label htmlFor="venue">Venue</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  id="venue"
                  type="text"
                  placeholder="Enter venue"
                  {...register('venue')}
                  className={`form-control ${errors.venue ? 'error' : ''}`}
                />
              </div>
              {errors.venue && (
                <span className="error-message">{errors.venue.message}</span>
              )}
            </div>

            {/* Referee */}
            <div className="form-group">
              <label htmlFor="referee">Referee</label>
              <div className="input-wrapper">
                <FaUserCheck className="input-icon" />
                <select
                  id="referee"
                  {...register('referee')}
                  className={`form-control ${errors.referee ? 'error' : ''}`}
                >
                  <option value="">Select Referee</option>
                  {referees.map((ref) => (
                    <option key={ref.id} value={ref.id}>
                      {ref.full_name || ref.username}
                    </option>
                  ))}
                </select>
              </div>
              {errors.referee && (
                <span className="error-message">{errors.referee.message}</span>
              )}
            </div>

            {/* Match Date */}
            <div className="form-group">
              <label htmlFor="match_date">
                Match Date <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  id="match_date"
                  type="date"
                  {...register('match_date')}
                  className={`form-control ${errors.match_date ? 'error' : ''}`}
                />
              </div>
              {errors.match_date && (
                <span className="error-message">{errors.match_date.message}</span>
              )}
            </div>

            {/* Match Time */}
            <div className="form-group">
              <label htmlFor="match_time">
                Match Time <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaClock className="input-icon" />
                <input
                  id="match_time"
                  type="time"
                  {...register('match_time')}
                  className={`form-control ${errors.match_time ? 'error' : ''}`}
                />
              </div>
              {errors.match_time && (
                <span className="error-message">{errors.match_time.message}</span>
              )}
            </div>

            {/* Fixture Preview */}
            {selectedFixture && (
              <div className="form-group form-group-full">
                <div className="fixture-preview">
                  <h4>Fixture Details</h4>
                  <div className="fixture-preview-grid">
                    <div className="preview-item">
                      <label>Competition</label>
                      <span>{selectedFixture.competition_name || selectedFixture.competition?.name}</span>
                    </div>
                    <div className="preview-item">
                      <label>Stage</label>
                      <span>{selectedFixture.stage}</span>
                    </div>
                    <div className="preview-item">
                      <label>Home Team</label>
                      <span>{selectedFixture.home_team}</span>
                    </div>
                    <div className="preview-item">
                      <label>Away Team</label>
                      <span>{selectedFixture.away_team}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/admin/matches" className="btn btn-secondary">
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
                  <FaSave /> Create Match
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateMatch;