import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaSchool, FaCheck, FaTimes, FaMapMarkerAlt,
  FaUsers, FaTrophy, FaChevronLeft, FaChevronRight,
  FaTh, FaList, FaSync
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './SchoolList.css';

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [regions, setRegions] = useState([]);

  const schoolLevels = {
    'primary': 'Primary School',
    'secondary': 'Secondary School',
    'high': 'High School'
  };

  // Helper function to get image URL
  const getImageUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
    return `${baseUrl}${logo.replace(/^\//, '')}`;
  };

  useEffect(() => {
    fetchSchools();
  }, [currentPage, regionFilter, levelFilter, statusFilter]);

  const fetchSchools = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (regionFilter !== 'All') {
        params.region = regionFilter;
      }
      if (levelFilter !== 'All') {
        params.school_level = levelFilter;
      }
      if (statusFilter !== 'All') {
        params.is_active = statusFilter === 'Active';
      }

      if (forceRefresh) {
        params._ = Date.now();
      }

      // Use admin endpoint to get all schools (including inactive)
      const response = await axiosInstance.get('schools/admin/', { params });
      console.log('Schools response:', response.data);
      
      const schoolsData = response.data.results || response.data || [];
      setSchools(schoolsData);
      
      // Extract unique regions
      const uniqueRegions = [...new Set(schoolsData.map(s => s.region).filter(Boolean))];
      setRegions(uniqueRegions);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSchools(true);
  };

  const handleDelete = async (school) => {
    setSelectedSchool(school);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`schools/${selectedSchool.id}/delete/`);
      toast.success('School deleted successfully');
      setShowDeleteModal(false);
      fetchSchools(true);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete school');
    }
  };

  const handleToggleStatus = async (school) => {
    try {
      await axiosInstance.put(`schools/${school.id}/activate/`, {
        is_active: !school.is_active
      });
      toast.success(`School ${school.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchSchools(true);
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle school status');
    }
  };

  const handleRefresh = () => {
    fetchSchools(true);
    toast.info('Data refreshed');
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  const getLevelBadgeClass = (level) => {
    const levelMap = {
      'primary': 'level-primary',
      'secondary': 'level-secondary',
      'high': 'level-high',
    };
    return levelMap[level] || 'level-other';
  };

  const getLevelDisplay = (level) => {
    return schoolLevels[level] || level;
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
    <div className="school-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">School Management</h1>
          <p className="page-subtitle">Manage all schools in the system</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <Link to="/admin/schools/create" className="btn btn-primary">
            <FaPlus /> Create School
          </Link>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList />
            </button>
          </div>
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
                placeholder="Search by name or school ID..."
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
              <label>Region:</label>
              <select 
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Level:</label>
              <select 
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Levels</option>
                <option value="primary">Primary School</option>
                <option value="secondary">Secondary School</option>
                <option value="high">High School</option>
              </select>
            </div>

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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <FaSchool className="stat-icon" />
          <div>
            <span className="stat-label">Total Schools</span>
            <span className="stat-value">{schools.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaCheck className="stat-icon" style={{ color: 'var(--success)' }} />
          <div>
            <span className="stat-label">Active</span>
            <span className="stat-value">{schools.filter(s => s.is_active).length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaTimes className="stat-icon" style={{ color: 'var(--error)' }} />
          <div>
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{schools.filter(s => !s.is_active).length}</span>
          </div>
        </div>
      </div>

      {/* School Grid/List */}
      {viewMode === 'grid' ? (
        <div className="schools-grid">
          {schools.length === 0 ? (
            <div className="empty-state">
              <FaSchool className="empty-icon" />
              <h3>No Schools Found</h3>
              <p>Try adjusting your filters or create a new school</p>
              <Link to="/admin/schools/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <FaPlus /> Create School
              </Link>
            </div>
          ) : (
            schools.map((school) => {
              const logoUrl = getImageUrl(school.logo);
              return (
                <div key={school.id} className="school-card">
                  <div className="school-card-header">
                    <div className="school-logo">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={school.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="logo-placeholder"><svg class="logo-placeholder-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 11-6-11-6zm0 11.5L3.5 9.5 12 5l8.5 4.5L12 14.5z"/><path d="M12 22l-11-6v-2.5l11 6 11-6V16l-11 6z"/></svg></span>`;
                          }}
                        />
                      ) : (
                        <FaSchool className="logo-placeholder" />
                      )}
                    </div>
                    <div className="school-card-status">
                      <span className={`status-badge ${getStatusBadgeClass(school.is_active)}`}>
                        {school.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="school-card-body">
                    <h3 className="school-name">{school.name}</h3>
                    <p className="school-id-text">ID: {school.school_id || school.id}</p>
                    <div className="school-details">
                      <span className="school-detail">
                        <FaMapMarkerAlt /> {school.region || 'N/A'}
                      </span>
                      <span className={`level-badge ${getLevelBadgeClass(school.school_level)}`}>
                        {getLevelDisplay(school.school_level)}
                      </span>
                    </div>
                    <div className="school-stats">
                      <div className="stat">
                        <FaUsers />
                        <span>{school.student_count || 0} Students</span>
                      </div>
                      <div className="stat">
                        <FaTrophy />
                        <span>{school.competition_count || 0} Competitions</span>
                      </div>
                    </div>
                  </div>
                  <div className="school-card-footer">
                    <Link to={`/admin/schools/${school.id}`} className="btn btn-sm btn-primary">
                      <FaEye /> View
                    </Link>
                    <Link to={`/admin/schools/${school.id}/edit`} className="btn btn-sm btn-secondary">
                      <FaEdit /> Edit
                    </Link>
                    <button 
                      onClick={() => handleToggleStatus(school)}
                      className={`btn btn-sm ${school.is_active ? 'btn-warning' : 'btn-success'}`}
                    >
                      {school.is_active ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button 
                      onClick={() => handleDelete(school)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <Card className="table-card">
          <div className="table-responsive">
            <table className="school-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <FaSchool className="empty-icon" />
                      <p>No schools found</p>
                      <Link to="/admin/schools/create" className="btn btn-primary" style={{ marginTop: '12px' }}>
                        <FaPlus /> Create School
                      </Link>
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const logoUrl = getImageUrl(school.logo);
                    return (
                      <tr key={school.id}>
                        <td>
                          <div className="school-cell">
                            <div className="school-logo-small">
                              {logoUrl ? (
                                <img 
                                  src={logoUrl} 
                                  alt={school.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<svg class="school-logo-small-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 11-6-11-6zm0 11.5L3.5 9.5 12 5l8.5 4.5L12 14.5z"/><path d="M12 22l-11-6v-2.5l11 6 11-6V16l-11 6z"/></svg>`;
                                  }}
                                />
                              ) : (
                                <FaSchool />
                              )}
                            </div>
                            <div>
                              <div className="school-name">{school.name}</div>
                              <div className="school-id">ID: {school.school_id || school.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{school.region || '-'}</td>
                        <td>{school.district || '-'}</td>
                        <td>
                          <span className={`level-badge ${getLevelBadgeClass(school.school_level)}`}>
                            {getLevelDisplay(school.school_level)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(school.is_active)}`}>
                            {school.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{school.student_count || 0}</td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/admin/schools/${school.id}`} 
                              className="action-btn view-btn"
                              title="View School"
                            >
                              <FaEye />
                            </Link>
                            <Link 
                              to={`/admin/schools/${school.id}/edit`} 
                              className="action-btn edit-btn"
                              title="Edit School"
                            >
                              <FaEdit />
                            </Link>
                            <button 
                              onClick={() => handleToggleStatus(school)}
                              className={`action-btn ${school.is_active ? 'deactivate-btn' : 'activate-btn'}`}
                              title={school.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {school.is_active ? <FaTimes /> : <FaCheck />}
                            </button>
                            <button 
                              onClick={() => handleDelete(school)}
                              className="action-btn delete-btn"
                              title="Delete School"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {renderPagination()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSchool && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete School</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedSchool.name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. All associated data will be deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolList;