import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSave, FaCalendarAlt, FaClock, 
  FaMapMarkerAlt, FaUsers, FaTrophy, FaFutbol
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './FixtureForm.css';

// Validation schema
const fixtureSchema = yup.object({
  competition: yup.string().required('Competition is required'),
  stage: yup.string().required('Stage is required'),
  home_team: yup.string().required('Home team is required'),
  away_team: yup.string().required('Away team is required'),
  venue: yup.string().required('Venue is required'),
  match_date: yup.string().required('Match date is required'),
  match_time: yup.string().required('Match time is required'),
  referee: yup.string(),
});

const CreateFixture = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [referees, setReferees] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(fixtureSchema),
    defaultValues: {
      competition: '',
      stage: '',
      home_team: '',
      away_team: '',
      venue: '',
      match_date: '',
      match_time: '',
      referee: '',
    },
  });

  const selectedCompetition = watch('competition');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchTeams(selectedCompetition);
    }
  }, [selectedCompetition]);

  const fetchData = async () => {
    try {
      const [competitionsRes, refereesRes] = await Promise.all([
        axiosInstance.get('competitions/'),
        axiosInstance.get('accounts/list/?role=referee')
      ]);
      setCompetitions(competitionsRes.data.results || competitionsRes.data || []);
      setReferees(refereesRes.data.results || refereesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchTeams = async (competitionId) => {
    try {
      const response = await axiosInstance.get(`competitions/${competitionId}/participations/`);
      const participations = response.data || [];
      
      // Extract school names from participations
      const schoolNames = participations.map(p => p.school_name || p.school?.name).filter(Boolean);
      setTeams(schoolNames);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Find competition ID
      const comp = competitions.find(c => c.id === parseInt(data.competition));
      
      const payload = {
        competition: parseInt(data.competition),
        home_team: data.home_team,
        away_team: data.away_team,
        stage: data.stage,
        venue: data.venue,
        match_date: data.match_date,
        match_time: data.match_time,
        referee: data.referee || null,
      };

      console.log('📤 Creating fixture with payload:', payload);

      const response = await axiosInstance.post('fixtures/create/', payload);
      
      console.log('✅ Fixture created:', response.data);
      toast.success('🎉 Fixture created successfully!');
      
      setTimeout(() => {
        navigate('/admin/fixtures');
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating fixture:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create fixture. ';
        
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
        toast.error('Failed to create fixture. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { value: 'Quarter Final', label: 'Quarter Final' },
    { value: 'Semi Final', label: 'Semi Final' },
    { value: 'Final', label: 'Final' },
    { value: 'Group Stage', label: 'Group Stage' },
  ];

  if (fetchingData) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="fixture-form-page">
      <div className="form-header">
        <Link to="/admin/fixtures" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="form-header-right">
          <h1 className="form-title">Create Fixture</h1>
          <p className="form-subtitle">Add a new fixture to the system</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Competition */}
            <div className="form-group">
              <label htmlFor="competition">
                Competition <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <select
                  id="competition"
                  {...register('competition')}
                  className={`form-control ${errors.competition ? 'error' : ''}`}
                >
                  <option value="">Select Competition</option>
                  {competitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} ({comp.sport_name || comp.sport} - {comp.season})
                    </option>
                  ))}
                </select>
              </div>
              {errors.competition && (
                <span className="error-message">{errors.competition.message}</span>
              )}
            </div>

            {/* Stage */}
            <div className="form-group">
              <label htmlFor="stage">
                Stage <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaTrophy className="input-icon" />
                <select
                  id="stage"
                  {...register('stage')}
                  className={`form-control ${errors.stage ? 'error' : ''}`}
                >
                  <option value="">Select Stage</option>
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.stage && (
                <span className="error-message">{errors.stage.message}</span>
              )}
            </div>

            {/* Home Team */}
            <div className="form-group">
              <label htmlFor="home_team">
                Home Team <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <select
                  id="home_team"
                  {...register('home_team')}
                  className={`form-control ${errors.home_team ? 'error' : ''}`}
                >
                  <option value="">Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
              {errors.home_team && (
                <span className="error-message">{errors.home_team.message}</span>
              )}
            </div>

            {/* Away Team */}
            <div className="form-group">
              <label htmlFor="away_team">
                Away Team <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaUsers className="input-icon" />
                <select
                  id="away_team"
                  {...register('away_team')}
                  className={`form-control ${errors.away_team ? 'error' : ''}`}
                >
                  <option value="">Select Away Team</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
              {errors.away_team && (
                <span className="error-message">{errors.away_team.message}</span>
              )}
            </div>

            {/* Venue */}
            <div className="form-group">
              <label htmlFor="venue">
                Venue <span className="required">*</span>
              </label>
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
                <FaUsers className="input-icon" />
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
          </div>

          <div className="form-actions">
            <Link to="/admin/fixtures" className="btn btn-secondary">
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
                  <FaSave /> Create Fixture
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateFixture;