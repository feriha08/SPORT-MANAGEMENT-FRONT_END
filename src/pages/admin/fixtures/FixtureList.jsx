import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaCheckCircle, FaHourglassHalf, FaTimesCircle,
  FaChevronLeft, FaChevronRight, FaTrophy,
  FaUsers, FaFileAlt, FaMagic, FaSitemap,
  FaHome, FaSchool, FaUserGraduate, FaFutbol
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './FixtureList.css';

const FixtureList = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [competitionFilter, setCompetitionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchFixtures();
    fetchCompetitions();
  }, [currentPage, stageFilter, competitionFilter]);

  const fetchFixtures = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (stageFilter !== 'All') {
        params.stage = stageFilter;
      }
      if (competitionFilter !== 'All') {
        params.competition = competitionFilter;
      }

      const response = await axiosInstance.get('fixtures/', { params });
      console.log('Fixtures response:', response.data);
      
      setFixtures(response.data.results || response.data || []);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      // Sample data if API fails
      setFixtures([
        {
          id: 1,
          home_team: 'Zanzibar High School',
          away_team: 'Stone Town Secondary',
          competition_name: 'Zanzibar Cup 2026',
          stage: 'Quarter Final',
          venue: 'Amaan Stadium',
          match_date: '2026-07-20',
          match_time: '14:00:00',
          referee_name: 'Ali Juma'
        },
        {
          id: 2,
          home_team: 'Mombasa Academy',
          away_team: 'Darajani School',
          competition_name: 'Zanzibar Cup 2026',
          stage: 'Quarter Final',
          venue: 'Kikwajuni Ground',
          match_date: '2026-07-20',
          match_time: '16:00:00',
          referee_name: 'Fatma Said'
        },
        {
          id: 3,
          home_team: 'Malindi School',
          away_team: 'Mtoni Secondary',
          competition_name: 'Zanzibar Cup 2026',
          stage: 'Semi Final',
          venue: 'Amaan Stadium',
          match_date: '2026-07-25',
          match_time: '14:00:00',
          referee_name: 'Hassan Omar'
        },
        {
          id: 4,
          home_team: 'Zanzibar High School',
          away_team: 'Mombasa Academy',
          competition_name: 'Zanzibar Cup 2026',
          stage: 'Final',
          venue: 'Amaan Stadium',
          match_date: '2026-07-30',
          match_time: '16:00:00',
          referee_name: 'Ali Juma'
        }
      ]);
      toast.info('Showing sample fixtures. Connect to backend for real data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await axiosInstance.get('competitions/');
      setCompetitions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFixtures();
  };

  const handleDelete = async (fixture) => {
    setSelectedFixture(fixture);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`fixtures/${selectedFixture.id}/manage/`);
      toast.success('Fixture deleted successfully');
      setShowDeleteModal(false);
      fetchFixtures();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete fixture');
    }
  };

  const handleGenerateFixtures = () => {
    setShowGenerateModal(true);
  };

  const confirmGenerateFixtures = async () => {
    if (!selectedCompetition) {
      toast.error('Please select a competition');
      return;
    }

    setGenerating(true);
    try {
      const response = await axiosInstance.post(`fixtures/generate/${selectedCompetition}/`);
      toast.success(`Generated ${response.data.count || 0} fixtures successfully`);
      setShowGenerateModal(false);
      setSelectedCompetition('');
      fetchFixtures();
    } catch (error) {
      console.error('Generate fixtures error:', error);
      toast.error('Failed to generate fixtures. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getStageClass = (stage) => {
    const classes = {
      'Quarter Final': 'stage-quarter',
      'Quarter-Final': 'stage-quarter',
      'Semi Final': 'stage-semi',
      'Semi-Final': 'stage-semi',
      'Final': 'stage-final',
      'Group Stage': 'stage-group',
    };
    return classes[stage] || 'stage-other';
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
    <div className="fixture-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fixture Management</h1>
          <p className="page-subtitle">Manage all fixtures and generate match schedules</p>
        </div>
        <div className="header-actions">
          <button onClick={handleGenerateFixtures} className="btn btn-success">
            <FaMagic /> Generate Fixtures
          </button>
          <Link to="/admin/fixtures/create" className="btn btn-primary">
            <FaPlus /> Create Fixture
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
                placeholder="Search fixtures..."
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
              <label>Stage:</label>
              <select 
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Stages</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final">Semi Final</option>
                <option value="Final">Final</option>
                <option value="Group Stage">Group Stage</option>
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
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <FaCalendarAlt className="stat-icon" />
          <div>
            <span className="stat-label">Total Fixtures</span>
            <span className="stat-value">{fixtures.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaSitemap className="stat-icon" style={{ color: '#8B5CF6' }} />
          <div>
            <span className="stat-label">Quarter Finals</span>
            <span className="stat-value">{fixtures.filter(f => f.stage === 'Quarter Final' || f.stage === 'Quarter-Final').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaTrophy className="stat-icon" style={{ color: '#F59E0B' }} />
          <div>
            <span className="stat-label">Semi Finals</span>
            <span className="stat-value">{fixtures.filter(f => f.stage === 'Semi Final' || f.stage === 'Semi-Final').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaTrophy className="stat-icon" style={{ color: '#EF4444' }} />
          <div>
            <span className="stat-label">Finals</span>
            <span className="stat-value">{fixtures.filter(f => f.stage === 'Final').length}</span>
          </div>
        </div>
      </div>

      {/* Fixture Table */}
      <Card className="table-card">
        <div className="table-responsive">
          <table className="fixture-table">
            <thead>
              <tr>
                <th>Fixture</th>
                <th>Competition</th>
                <th>Stage</th>
                <th>Venue</th>
                <th>Date & Time</th>
                <th>Referee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <p>No fixtures found</p>
                    <p className="empty-subtitle">
                      Try adjusting your filters or generate fixtures for a competition
                    </p>
                  </td>
                </tr>
              ) : (
                fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td>
                      <div className="fixture-teams">
                        <span className="team-name">{fixture.home_team || 'TBD'}</span>
                        <span className="vs-text">vs</span>
                        <span className="team-name">{fixture.away_team || 'TBD'}</span>
                      </div>
                    </td>
                    <td>{fixture.competition_name || fixture.competition?.name || '-'}</td>
                    <td>
                      <span className={`stage-badge ${getStageClass(fixture.stage)}`}>
                        {fixture.stage || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="venue-cell">
                        <FaMapMarkerAlt /> {fixture.venue || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="date-time-cell">
                        <div>{formatDate(fixture.match_date)}</div>
                        <div className="time">{formatTime(fixture.match_time)}</div>
                      </div>
                    </td>
                    <td>{fixture.referee_name || fixture.referee?.username || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/admin/fixtures/${fixture.id}`} 
                          className="action-btn view-btn"
                          title="View Fixture"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/admin/fixtures/${fixture.id}/edit`} 
                          className="action-btn edit-btn"
                          title="Edit Fixture"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleDelete(fixture)}
                          className="action-btn delete-btn"
                          title="Delete Fixture"
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

      {/* Generate Fixtures Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaMagic /> Generate Fixtures</h3>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Select a competition to automatically generate knockout fixtures.</p>
              <div className="form-group">
                <label>Select Competition</label>
                <select 
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Competition --</option>
                  {competitions.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} ({comp.sport} - {comp.status || 'Draft'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="generate-info">
                <p><strong>Note:</strong> This will generate fixtures for all stages of the knockout tournament.</p>
                <p>Generated fixtures can be edited later if needed.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={confirmGenerateFixtures}
                disabled={generating || !selectedCompetition}
              >
                {generating ? 'Generating...' : 'Generate Fixtures'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFixture && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Fixture</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this fixture?</p>
              <p><strong>{selectedFixture.home_team} vs {selectedFixture.away_team}</strong></p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Fixture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixtureList;