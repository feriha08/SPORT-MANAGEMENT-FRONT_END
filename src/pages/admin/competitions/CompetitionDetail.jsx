import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaTrophy, FaCalendarAlt, FaClock, FaUsers,
  FaSchool, FaFutbol, FaVenusMars, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaPlus,
  FaEye, FaUserCheck, FaUserTimes, FaSync
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './CompetitionDetail.css';

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCompetitionData();
  }, [id]);

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      const [compRes, partsRes] = await Promise.all([
        axiosInstance.get(`competitions/${id}/`),
        axiosInstance.get(`competitions/${id}/participations/`)
      ]);
      
      setCompetition(compRes.data);
      setParticipations(partsRes.data || []);
    } catch (error) {
      console.error('Error fetching competition:', error);
      toast.error('Failed to load competition details');
      navigate('/admin/competitions');
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

  const handleUpdateStatus = async (status) => {
    try {
      await axiosInstance.put(`competitions/${id}/manage/`, { status });
      toast.success(`Competition status updated to ${status}`);
      fetchCompetitionData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update competition status');
    }
  };

  const handleApproveParticipation = async (participationId) => {
    try {
      await axiosInstance.put(`competitions/participations/${participationId}/status/`, {
        status: 'approved'
      });
      toast.success('Participation approved successfully');
      fetchCompetitionData();
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
      fetchCompetitionData();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject participation');
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

  const getStatusIcon = (status) => {
    const icons = {
      'draft': <FaHourglassHalf />,
      'open': <FaClock />,
      'closed': <FaTimesCircle />,
      'ongoing': <FaClock />,
      'completed': <FaCheckCircle />
    };
    return icons[status] || <FaHourglassHalf />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = () => {
    if (!competition) return false;
    const deadline = new Date(competition.registration_deadline);
    return competition.status === 'open' && new Date() < deadline;
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!competition) {
    return (
      <div className="competition-detail-error">
        <h2>Competition not found</h2>
        <Link to="/admin/competitions" className="btn btn-primary">
          <FaArrowLeft /> Back to Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="competition-detail-page">
      {/* Header */}
      <div className="detail-header">
        <Link to="/admin/competitions" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="detail-header-actions">
          <Link to={`/admin/competitions/${id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit
          </Link>
          <Link to={`/admin/fixtures/generate?competition=${id}`} className="btn btn-success">
            <FaPlus /> Generate Fixtures
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Competition Info */}
      <Card className="competition-detail-card">
        <div className="competition-detail-header">
          <div className="competition-detail-icon">
            <FaTrophy />
          </div>
          <div className="competition-detail-info">
            <h1 className="competition-detail-name">{competition.name}</h1>
            <div className="competition-detail-meta">
              <span className={`status-badge ${getStatusBadgeClass(competition.status)}`}>
                {getStatusIcon(competition.status)} {competition.status || 'Draft'}
              </span>
              <span className="detail-meta-item">
                <FaFutbol /> {competition.sport_name || competition.sport}
              </span>
              <span className="detail-meta-item">
                <FaVenusMars /> {competition.gender}
              </span>
              <span className="detail-meta-item">
                <FaCalendarAlt /> {competition.season}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="detail-grid">
        <Card className="detail-card">
          <h3>Competition Details</h3>
          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <div>
              <label>Registration Deadline</label>
              <p>{formatDate(competition.registration_deadline)}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <div>
              <label>Maximum Age</label>
              <p>{competition.max_age} years</p>
            </div>
          </div>
          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <div>
              <label>Participating Schools</label>
              <p>{participations.length}</p>
            </div>
          </div>
          {isRegistrationOpen() && (
            <div className="registration-open-banner">
              <FaClock /> Registration Open!
            </div>
          )}
        </Card>

        <Card className="detail-card">
          <h3>Status & Actions</h3>
          <div className="status-actions">
            <button 
              onClick={() => handleUpdateStatus('open')}
              className={`btn btn-sm ${competition.status === 'open' ? 'btn-primary' : 'btn-outline'}`}
              disabled={competition.status === 'open'}
            >
              Open Registration
            </button>
            <button 
              onClick={() => handleUpdateStatus('closed')}
              className={`btn btn-sm ${competition.status === 'closed' ? 'btn-primary' : 'btn-outline'}`}
              disabled={competition.status === 'closed'}
            >
              Close Registration
            </button>
            <button 
              onClick={() => handleUpdateStatus('ongoing')}
              className={`btn btn-sm ${competition.status === 'ongoing' ? 'btn-primary' : 'btn-outline'}`}
              disabled={competition.status === 'ongoing'}
            >
              Start Competition
            </button>
            <button 
              onClick={() => handleUpdateStatus('completed')}
              className={`btn btn-sm ${competition.status === 'completed' ? 'btn-primary' : 'btn-outline'}`}
              disabled={competition.status === 'completed'}
            >
              Mark Complete
            </button>
          </div>
        </Card>
      </div>

      {/* Participations */}
      <Card className="participations-card">
        <div className="participations-header">
          <h3>Participating Schools</h3>
          <span className="participations-count">{participations.length} schools</span>
        </div>
        
        {participations.length === 0 ? (
          <div className="empty-state">
            <FaSchool className="empty-icon" />
            <p>No schools have registered yet</p>
          </div>
        ) : (
          <div className="participations-table-wrap">
            <table className="participations-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((part) => (
                  <tr key={part.id}>
                    <td>
                      <div className="school-cell">
                        <FaSchool className="school-icon" />
                        <span>{part.school_name || part.school?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`participation-badge ${getParticipationStatusClass(part.status)}`}>
                        {part.status}
                      </span>
                    </td>
                    <td>{formatDate(part.submitted_at)}</td>
                    <td>
                      <div className="participation-actions">
                        {part.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveParticipation(part.id)}
                              className="action-btn approve-btn"
                              title="Approve"
                            >
                              <FaCheckCircle />
                            </button>
                            <button 
                              onClick={() => handleRejectParticipation(part.id)}
                              className="action-btn reject-btn"
                              title="Reject"
                            >
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        <Link 
                          to={`/admin/competitions/${id}/participations/${part.id}`}
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Competition</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{competition.name}</strong>?</p>
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

export default CompetitionDetail;