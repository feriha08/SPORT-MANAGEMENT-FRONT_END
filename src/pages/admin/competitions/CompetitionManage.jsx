import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaTrophy, FaUsers, FaSchool, 
  FaCheckCircle, FaTimesCircle, FaClock, FaPlus,
  FaTrash, FaUserPlus, FaUserMinus, FaEye,
  FaSync, FaFutbol, FaCalendarAlt, FaVenusMars,
  FaUserCheck, FaUserTimes, FaEdit
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './CompetitionManage.css';

const CompetitionManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, partsRes] = await Promise.all([
        axiosInstance.get(`competitions/${id}/`),
        axiosInstance.get(`competitions/${id}/participations/`)
      ]);
      
      setCompetition(compRes.data);
      const parts = partsRes.data || [];
      setParticipations(parts);
      
      // Fetch team players for each participation
      const playersData = {};
      for (const part of parts) {
        try {
          const playersRes = await axiosInstance.get(`competitions/participations/${part.id}/details/`);
          playersData[part.id] = playersRes.data.team_players || [];
        } catch (error) {
          playersData[part.id] = [];
        }
      }
      setTeamPlayers(playersData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load competition data');
      navigate('/admin/competitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async (participationId) => {
    try {
      const schoolId = participations.find(p => p.id === participationId)?.school;
      if (!schoolId) {
        toast.error('School not found');
        return;
      }
      
      const studentsRes = await axiosInstance.get(`students/?school=${schoolId}`);
      const allStudents = studentsRes.data.results || studentsRes.data || [];
      
      // Get already selected students
      const existingPlayers = teamPlayers[participationId] || [];
      const existingIds = existingPlayers.map(p => p.student);
      
      const available = allStudents.filter(s => !existingIds.includes(s.id));
      setAvailableStudents(available);
      setSelectedStudents([]);
      setSelectedParticipation(participationId);
      setShowAddPlayerModal(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load available students');
    }
  };

  const handleAddPlayers = async () => {
    if (!selectedParticipation || selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      await axiosInstance.post('competitions/team-players/add-multiple/', {
        participation: selectedParticipation,
        student_ids: selectedStudents
      });
      
      toast.success(`Added ${selectedStudents.length} players successfully`);
      setShowAddPlayerModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding players:', error);
      toast.error(error.response?.data?.error || 'Failed to add players');
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to remove this player?')) return;
    
    try {
      await axiosInstance.delete(`competitions/team-players/${playerId}/remove/`);
      toast.success('Player removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  const handleSetCaptain = async (playerId) => {
    try {
      await axiosInstance.put(`competitions/team-players/${playerId}/set-captain/`);
      toast.success('Captain updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error setting captain:', error);
      toast.error('Failed to set captain');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await axiosInstance.put(`competitions/${id}/manage/`, { status });
      toast.success(`Competition status updated to ${status}`);
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update competition status');
    }
  };

  const handleApproveParticipation = async (participationId) => {
    try {
      await axiosInstance.put(`competitions/participations/${participationId}/status/`, {
        status: 'approved'
      });
      toast.success('Participation approved successfully');
      fetchData();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve participation');
    }
  };

  const handleRejectParticipation = async (participationId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    
    try {
      await axiosInstance.put(`competitions/participations/${participationId}/status/`, {
        status: 'rejected',
        reason: reason
      });
      toast.success('Participation rejected successfully');
      fetchData();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject participation');
    }
  };

  const handleSubmitTeam = async (participationId) => {
    try {
      await axiosInstance.post(`competitions/participations/${participationId}/submit/`);
      toast.success('Team submitted for approval successfully');
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit team');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'draft': 'status-draft',
      'open': 'status-open',
      'closed': 'status-closed',
      'ongoing': 'status-ongoing',
      'completed': 'status-completed'
    };
    return classes[status] || 'status-draft';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Draft',
      'open': 'Open for Registration',
      'closed': 'Registration Closed',
      'ongoing': 'Ongoing',
      'completed': 'Completed'
    };
    return labels[status] || status;
  };

  const getParticipationStatusClass = (status) => {
    const classes = {
      'pending': 'participation-pending',
      'approved': 'participation-approved',
      'rejected': 'participation-rejected'
    };
    return classes[status] || 'participation-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!competition) {
    return (
      <div className="competition-manage-error">
        <h2>Competition not found</h2>
        <Link to="/admin/competitions" className="btn btn-primary">
          <FaArrowLeft /> Back to Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="competition-manage-page">
      {/* Header */}
      <div className="manage-header">
        <Link to={`/admin/competitions/${id}`} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="manage-header-info">
          <h1 className="manage-title">{competition.name}</h1>
          <p className="manage-subtitle">
            Manage teams and participations
          </p>
        </div>
        <div className="manage-header-actions">
          <Link to={`/admin/competitions/${id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit
          </Link>
          <button onClick={() => { fetchData(); toast.info('Data refreshed'); }} className="btn btn-secondary">
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Competition Summary */}
      <Card className="summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <FaTrophy className="summary-icon" />
            <div>
              <span className="summary-label">Competition</span>
              <span className="summary-value">{competition.name}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaFutbol className="summary-icon" />
            <div>
              <span className="summary-label">Sport</span>
              <span className="summary-value">{competition.sport_name || competition.sport}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaCalendarAlt className="summary-icon" />
            <div>
              <span className="summary-label">Season</span>
              <span className="summary-value">{competition.season}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaVenusMars className="summary-icon" />
            <div>
              <span className="summary-label">Gender</span>
              <span className="summary-value">{competition.gender}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaUsers className="summary-icon" />
            <div>
              <span className="summary-label">Schools</span>
              <span className="summary-value">{participations.length}</span>
            </div>
          </div>
          <div className="summary-item">
            <span className={`status-badge ${getStatusBadgeClass(competition.status)}`}>
              {getStatusLabel(competition.status)}
            </span>
          </div>
        </div>
      </Card>

      {/* Status Actions - Full Control for Super Admin */}
      <Card className="status-actions-card">
        <h3>Update Competition Status</h3>
        <p className="status-current">
          Current Status: <span className={`status-badge ${getStatusBadgeClass(competition.status)}`}>
            {getStatusLabel(competition.status)}
          </span>
        </p>
        <div className="status-actions-grid">
          {competition.status !== 'completed' ? (
            <>
              <button 
                onClick={() => handleUpdateStatus('draft')}
                className={`status-btn ${competition.status === 'draft' ? 'active-draft' : ''}`}
                disabled={competition.status === 'completed'}
              >
                📝 Draft
              </button>
              <button 
                onClick={() => handleUpdateStatus('open')}
                className={`status-btn ${competition.status === 'open' ? 'active-open' : ''}`}
                disabled={competition.status === 'completed'}
              >
                🔓 Open
              </button>
              <button 
                onClick={() => handleUpdateStatus('closed')}
                className={`status-btn ${competition.status === 'closed' ? 'active-closed' : ''}`}
                disabled={competition.status === 'completed'}
              >
                🔒 Closed
              </button>
              <button 
                onClick={() => handleUpdateStatus('ongoing')}
                className={`status-btn ${competition.status === 'ongoing' ? 'active-ongoing' : ''}`}
                disabled={competition.status === 'completed'}
              >
                🔄 Ongoing
              </button>
              <button 
                onClick={() => handleUpdateStatus('completed')}
                className={`status-btn ${competition.status === 'completed' ? 'active-completed' : ''}`}
                disabled={competition.status === 'completed'}
              >
                ✅ Completed
              </button>
            </>
          ) : (
            <div className="status-locked">
              <FaCheckCircle /> This competition is completed and cannot be changed
            </div>
          )}
        </div>
        <div className="status-legend">
          <span className="legend-item">
            <span className="legend-dot draft-dot"></span> Draft
          </span>
          <span className="legend-item">
            <span className="legend-dot open-dot"></span> Open
          </span>
          <span className="legend-item">
            <span className="legend-dot closed-dot"></span> Closed
          </span>
          <span className="legend-item">
            <span className="legend-dot ongoing-dot"></span> Ongoing
          </span>
          <span className="legend-item">
            <span className="legend-dot completed-dot"></span> Completed
          </span>
        </div>
      </Card>

      {/* Participations List */}
      <div className="participations-section">
        <h2>Participating Schools</h2>
        
        {participations.length === 0 ? (
          <Card className="empty-card">
            <div className="empty-state">
              <FaSchool className="empty-icon" />
              <p>No schools have registered yet</p>
            </div>
          </Card>
        ) : (
          participations.map((part) => {
            const players = teamPlayers[part.id] || [];
            const sport = competition.sport_name || competition.sport;
            
            return (
              <Card key={part.id} className="participation-card">
                <div className="participation-header">
                  <div className="participation-school">
                    <FaSchool className="school-icon" />
                    <h3>{part.school_name || part.school?.name || 'Unknown School'}</h3>
                  </div>
                  <div className="participation-status">
                    <span className={`participation-badge ${getParticipationStatusClass(part.status)}`}>
                      {part.status}
                    </span>
                  </div>
                </div>

                <div className="participation-body">
                  {/* Team Players */}
                  <div className="team-section">
                    <div className="team-header">
                      <span className="team-label">
                        <FaUsers /> Team ({players.length} players)
                      </span>
                      <div className="team-actions">
                        <button 
                          onClick={() => fetchAvailableStudents(part.id)}
                          className="btn btn-sm btn-primary"
                          disabled={part.status === 'approved' || part.status === 'rejected' || competition.status === 'completed'}
                        >
                          <FaUserPlus /> Add Players
                        </button>
                        {part.status === 'pending' && (
                          <button 
                            onClick={() => handleSubmitTeam(part.id)}
                            className="btn btn-sm btn-success"
                            disabled={players.length === 0}
                          >
                            Submit Team
                          </button>
                        )}
                      </div>
                    </div>

                    {players.length === 0 ? (
                      <p className="no-players">No players added yet</p>
                    ) : (
                      <div className="players-grid">
                        {players.map((player) => (
                          <div key={player.id} className="player-card">
                            <div className="player-info">
                              <span className="player-name">{player.student_full_name || player.student}</span>
                              {player.is_captain && (
                                <span className="captain-badge">Captain</span>
                              )}
                            </div>
                            <div className="player-actions">
                              {!player.is_captain && (
                                <button 
                                  onClick={() => handleSetCaptain(player.id)}
                                  className="action-btn captain-btn"
                                  title="Make Captain"
                                >
                                  <FaUserCheck />
                                </button>
                              )}
                              <button 
                                onClick={() => handleRemovePlayer(player.id)}
                                className="action-btn remove-btn"
                                title="Remove Player"
                              >
                                <FaUserMinus />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Participation Actions */}
                  <div className="participation-actions-bottom">
                    {part.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveParticipation(part.id)}
                          className="btn btn-sm btn-success"
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button 
                          onClick={() => handleRejectParticipation(part.id)}
                          className="btn btn-sm btn-danger"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    )}
                    <span className="submitted-date">
                      Submitted: {formatDate(part.submitted_at)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Players Modal */}
      {showAddPlayerModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlayerModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Players to Team</h3>
              <button className="modal-close" onClick={() => setShowAddPlayerModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Select students to add to the team:</p>
              
              {availableStudents.length === 0 ? (
                <p className="no-students-msg">No available students found</p>
              ) : (
                <div className="students-select-grid">
                  {availableStudents.map((student) => (
                    <label key={student.id} className="student-select-item">
                      <input
                        type="checkbox"
                        value={student.id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                      />
                      <span className="student-name">{student.full_name}</span>
                      <span className="student-age">{student.age} years</span>
                    </label>
                  ))}
                </div>
              )}
              
              <p className="selected-count">Selected: {selectedStudents.length} students</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddPlayerModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddPlayers}
                disabled={selectedStudents.length === 0}
              >
                <FaUserPlus /> Add Selected Players
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionManage;