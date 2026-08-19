import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaTrophy, FaCalendarAlt, FaUsers, FaClock,
  FaCheckCircle, FaHourglassHalf, FaTimesCircle,
  FaChevronLeft, FaChevronRight, FaFilter,
  FaFutbol, FaVolleyballBall, FaBasketballBall,
  FaSync  // ADD THIS
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './CompetitionList.css';

const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sports, setSports] = useState([]);

  useEffect(() => {
    fetchCompetitions();
    fetchSports();
  }, [currentPage, statusFilter, sportFilter, genderFilter]);

  const fetchCompetitions = async (forceRefresh = false) => {
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
      if (sportFilter !== 'All') {
        params.sport = sportFilter;
      }
      if (genderFilter !== 'All') {
        params.gender = genderFilter;
      }

      if (forceRefresh) {
        params._ = Date.now();
      }

      const response = await axiosInstance.get('competitions/', { params });
      console.log('Competitions response:', response.data);
      
      setCompetitions(response.data.results || response.data || []);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await axiosInstance.get('sports/');
      setSports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const handleRefresh = () => {
    fetchCompetitions(true);
    toast.info('Data refreshed');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompetitions();
  };

  const handleDelete = async (competition) => {
    setSelectedCompetition(competition);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`competitions/${selectedCompetition.id}/manage/`);
      toast.success('Competition deleted successfully');
      setShowDeleteModal(false);
      fetchCompetitions();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete competition');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Draft': <FaClock />,
      'Open': <FaHourglassHalf />,
      'Ongoing': <FaClock />,
      'Completed': <FaCheckCircle />,
      'Closed': <FaTimesCircle />
    };
    return icons[status] || <FaClock />;
  };

  const getStatusClass = (status) => {
    const classes = {
      'Draft': 'status-draft',
      'Open': 'status-open',
      'Ongoing': 'status-ongoing',
      'Completed': 'status-completed',
      'Closed': 'status-closed'
    };
    return classes[status] || 'status-draft';
  };

  const getSportIcon = (sport) => {
    const icons = {
      'Football': <FaFutbol />,
      'Volleyball': <FaVolleyballBall />,
      'Basketball': <FaBasketballBall />,
    };
    return icons[sport] || <FaTrophy />;
  };

  const getSportClass = (sport) => {
    const classes = {
      'Football': 'sport-football',
      'Volleyball': 'sport-volleyball',
      'Basketball': 'sport-basketball',
    };
    return classes[sport] || 'sport-other';
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

  const isRegistrationOpen = (competition) => {
    if (!competition.registration_deadline) return false;
    const deadline = new Date(competition.registration_deadline);
    return new Date() < deadline && competition.status === 'Open';
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
    <div className="competition-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Competition Management</h1>
          <p className="page-subtitle">Manage all sports competitions</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <Link to="/admin/competitions/create" className="btn btn-primary">
            <FaPlus /> Create Competition
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
                placeholder="Search competitions..."
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
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Closed">Closed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Sport:</label>
              <select 
                value={sportFilter}
                onChange={(e) => {
                  setSportFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Sports</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.name}>{sport.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Gender:</label>
              <select 
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <FaTrophy className="stat-icon" />
          <div>
            <span className="stat-label">Total</span>
            <span className="stat-value">{competitions.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaHourglassHalf className="stat-icon" style={{ color: '#F59E0B' }} />
          <div>
            <span className="stat-label">Open</span>
            <span className="stat-value">{competitions.filter(c => c.status === 'Open').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaClock className="stat-icon" style={{ color: '#3B82F6' }} />
          <div>
            <span className="stat-label">Ongoing</span>
            <span className="stat-value">{competitions.filter(c => c.status === 'Ongoing').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaCheckCircle className="stat-icon" style={{ color: '#10B981' }} />
          <div>
            <span className="stat-label">Completed</span>
            <span className="stat-value">{competitions.filter(c => c.status === 'Completed').length}</span>
          </div>
        </div>
      </div>

      {/* Competition Grid */}
      <div className="competitions-grid">
        {competitions.length === 0 ? (
          <div className="empty-state">
            <FaTrophy className="empty-icon" />
            <h3>No Competitions Found</h3>
            <p>Try adjusting your filters or create a new competition</p>
          </div>
        ) : (
          competitions.map((competition) => (
            <div key={competition.id} className="competition-card">
              <div className="competition-card-header">
                <div className="competition-icon">
                  {getSportIcon(competition.sport)}
                </div>
                <div className="competition-status">
                  <span className={`status-badge ${getStatusClass(competition.status)}`}>
                    {getStatusIcon(competition.status)} {competition.status || 'Draft'}
                  </span>
                </div>
              </div>
              
              <div className="competition-card-body">
                <h3 className="competition-name">{competition.name}</h3>
                <div className="competition-meta">
                  <span className={`sport-badge ${getSportClass(competition.sport)}`}>
                    {getSportIcon(competition.sport)} {competition.sport || 'N/A'}
                  </span>
                  <span className="competition-gender">
                    {competition.gender || 'Mixed'}
                  </span>
                </div>
                <div className="competition-details">
                  <div className="detail">
                    <FaCalendarAlt />
                    <span>{formatDate(competition.registration_deadline)}</span>
                  </div>
                  <div className="detail">
                    <FaUsers />
                    <span>{competition.participating_schools || 0} Schools</span>
                  </div>
                </div>
                {isRegistrationOpen(competition) && (
                  <div className="registration-open">
                    <FaClock /> Registration Open
                  </div>
                )}
              </div>
              
              <div className="competition-card-footer">
                <Link 
                  to={`/admin/competitions/${competition.id}`} 
                  className="btn btn-sm btn-primary"
                >
                  <FaEye /> View
                </Link>
                <Link 
                  to={`/admin/competitions/${competition.id}/edit`} 
                  className="btn btn-sm btn-secondary"
                >
                  <FaEdit /> Edit
                </Link>
                <Link 
                  to={`/admin/competitions/${competition.id}/manage`} 
                  className="btn btn-sm btn-info"
                >
                  <FaUsers /> Manage
                </Link>
                <button 
                  onClick={() => handleDelete(competition)}
                  className="btn btn-sm btn-danger"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {renderPagination()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompetition && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Competition</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedCompetition.name}</strong>?</p>
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

export default CompetitionList;