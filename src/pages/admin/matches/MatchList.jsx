import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaCheckCircle, FaHourglassHalf, FaTimesCircle,
  FaChevronLeft, FaChevronRight, FaTrophy,
  FaUsers, FaFileAlt, FaSync, FaFutbol
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './MatchList.css';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [competitionFilter, setCompetitionFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [resultData, setResultData] = useState({
    home_score: '',
    away_score: '',
  });

  useEffect(() => {
    fetchMatches();
    fetchFilters();
  }, [currentPage, statusFilter, competitionFilter, schoolFilter]);

  const fetchMatches = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (competitionFilter !== 'All') {
        params.competition = competitionFilter;
      }
      if (schoolFilter !== 'All') {
        params.school = schoolFilter;
      }

      if (forceRefresh) {
        params._ = Date.now();
      }

      const response = await axiosInstance.get('matches/', { params });
      console.log('Matches response:', response.data);
      
      setMatches(response.data.results || response.data || []);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [competitionsRes, schoolsRes] = await Promise.all([
        axiosInstance.get('competitions/'),
        axiosInstance.get('schools/')
      ]);
      setCompetitions(competitionsRes.data.results || competitionsRes.data || []);
      setSchools(schoolsRes.data.results || schoolsRes.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMatches(true);
  };

  const handleDelete = async (match) => {
    setSelectedMatch(match);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`matches/${selectedMatch.id}/manage/`);
      toast.success('Match deleted successfully');
      setShowDeleteModal(false);
      fetchMatches(true);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete match');
    }
  };

  const handleSubmitResult = async (match) => {
    setSelectedMatch(match);
    setResultData({
      home_score: match.home_score || '',
      away_score: match.away_score || '',
    });
    setShowResultModal(true);
  };

  const confirmSubmitResult = async () => {
    try {
      await axiosInstance.put(`matches/${selectedMatch.id}/result/`, {
        home_score: parseInt(resultData.home_score),
        away_score: parseInt(resultData.away_score),
        status: 'Finished'
      });
      toast.success('Match result submitted successfully');
      setShowResultModal(false);
      fetchMatches(true);
    } catch (error) {
      console.error('Submit result error:', error);
      toast.error('Failed to submit match result');
    }
  };

  const handleRefresh = () => {
    fetchMatches(true);
    toast.info('Data refreshed');
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Scheduled': <FaClock />,
      'Ongoing': <FaHourglassHalf />,
      'Finished': <FaCheckCircle />,
      'Cancelled': <FaTimesCircle />
    };
    return icons[status] || <FaClock />;
  };

  const getStatusClass = (status) => {
    const classes = {
      'Scheduled': 'status-scheduled',
      'Ongoing': 'status-ongoing',
      'Finished': 'status-finished',
      'Cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-scheduled';
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <FaChevronLeft /> Prev
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next <FaChevronRight />
        </button>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="match-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Match Management</h1>
          <p className="page-subtitle">Manage all matches and fixtures</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <Link to="/admin/matches/create" className="btn btn-primary">
            <FaPlus /> Create Match
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </div>
          </form>

          <div className="filter-group">
            <div className="filter-item">
              <label>Status:</label>
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Finished">Finished</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Competition:</label>
              <select 
                value={competitionFilter}
                onChange={(e) => {
                  setCompetitionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Competitions</option>
                {competitions.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>School:</label>
              <select 
                value={schoolFilter}
                onChange={(e) => {
                  setSchoolFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <FaFutbol className="stat-icon" />
          <div>
            <span className="stat-label">Total Matches</span>
            <span className="stat-value">{matches.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaClock className="stat-icon" style={{ color: '#3B82F6' }} />
          <div>
            <span className="stat-label">Scheduled</span>
            <span className="stat-value">{matches.filter(m => m.status === 'Scheduled').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaHourglassHalf className="stat-icon" style={{ color: '#F59E0B' }} />
          <div>
            <span className="stat-label">Ongoing</span>
            <span className="stat-value">{matches.filter(m => m.status === 'Ongoing').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaCheckCircle className="stat-icon" style={{ color: '#10B981' }} />
          <div>
            <span className="stat-label">Finished</span>
            <span className="stat-value">{matches.filter(m => m.status === 'Finished').length}</span>
          </div>
        </div>
      </div>

      {/* Match Table */}
      <Card className="table-card">
        <div className="table-responsive">
          <table className="match-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Competition</th>
                <th>Stage</th>
                <th>Venue</th>
                <th>Date & Time</th>
                <th>Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <FaFutbol className="empty-icon" />
                    <p>No matches found</p>
                    <p className="empty-subtitle">Try adjusting your filters or create a new match</p>
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id}>
                    <td>
                      <div className="match-teams">
                        <span className="team-name">{match.home_team || 'TBD'}</span>
                        <span className="vs-text">vs</span>
                        <span className="team-name">{match.away_team || 'TBD'}</span>
                      </div>
                    </td>
                    <td>{match.competition_name || match.competition?.name || '-'}</td>
                    <td>
                      <span className="stage-badge">{match.stage || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="venue-cell">
                        <FaMapMarkerAlt /> {match.venue || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="date-time-cell">
                        <div>{formatDate(match.match_date)}</div>
                        <div className="time">{formatTime(match.match_time)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="score-display">
                        <span className="score-home">{match.home_score || '0'}</span>
                        <span className="score-dash">-</span>
                        <span className="score-away">{match.away_score || '0'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(match.status)}`}>
                        {getStatusIcon(match.status)} {match.status || 'Scheduled'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/matches/${match.id}`} 
                          className="action-btn view-btn"
                          title="View Match"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/admin/matches/${match.id}/edit`} 
                          className="action-btn edit-btn"
                          title="Edit Match"
                        >
                          <FaEdit />
                        </Link>
                        {match.status !== 'Finished' && (
                          <button 
                            onClick={() => handleSubmitResult(match)}
                            className="action-btn result-btn"
                            title="Submit Result"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(match)}
                          className="action-btn delete-btn"
                          title="Delete Match"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Match</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this match?</p>
              <p><strong>{selectedMatch.home_team} vs {selectedMatch.away_team}</strong></p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Result Modal */}
      {showResultModal && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Match Result</h3>
              <button className="modal-close" onClick={() => setShowResultModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="match-info">
                <strong>{selectedMatch.home_team}</strong> vs <strong>{selectedMatch.away_team}</strong>
              </p>
              <div className="result-form">
                <div className="result-group">
                  <label>Home Score</label>
                  <input
                    type="number"
                    className="form-control"
                    value={resultData.home_score}
                    onChange={(e) => setResultData({...resultData, home_score: e.target.value})}
                    min="0"
                  />
                </div>
                <div className="result-group">
                  <label>Away Score</label>
                  <input
                    type="number"
                    className="form-control"
                    value={resultData.away_score}
                    onChange={(e) => setResultData({...resultData, away_score: e.target.value})}
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResultModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={confirmSubmitResult}>
                Submit Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;