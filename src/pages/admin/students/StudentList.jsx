import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaUserGraduate, FaCheck, FaTimes, FaFilter,
  FaUsers, FaFileExport, FaChevronLeft, FaChevronRight,
  FaMale, FaFemale, FaUser, FaSync, FaTrophy
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [sports, setSports] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchFilters();
  }, [currentPage, genderFilter, sportFilter, schoolFilter]);

  const fetchStudents = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (genderFilter !== 'All') {
        params.gender = genderFilter;
      }
      if (sportFilter !== 'All') {
        params.sport = sportFilter;
      }
      if (schoolFilter !== 'All') {
        params.school = schoolFilter;
      }

      if (forceRefresh) {
        params._ = Date.now();
      }

      const response = await axiosInstance.get('students/', { params });
      console.log('Students response:', response.data);
      
      setStudents(response.data.results || response.data || []);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [schoolsRes, sportsRes] = await Promise.all([
        axiosInstance.get('schools/'),
        axiosInstance.get('sports/')
      ]);
      setSchools(schoolsRes.data.results || schoolsRes.data || []);
      setSports(sportsRes.data.results || sportsRes.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents(true);
  };

  const handleDelete = async (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`students/${selectedStudent.id}/manage/`);
      toast.success('Student deleted successfully');
      setShowDeleteModal(false);
      fetchStudents(true);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('students/export/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Students exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export students');
    }
  };

  const handleRefresh = () => {
    fetchStudents(true);
    toast.info('Data refreshed');
  };

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
    return `${baseUrl}${profilePicture.replace(/^\//, '')}`;
  };

  const getGenderIcon = (gender) => {
    if (gender === 'Male' || gender === 'male') return <FaMale />;
    if (gender === 'Female' || gender === 'female') return <FaFemale />;
    return <FaUser />;
  };

  const getGenderClass = (gender) => {
    return gender === 'Male' || gender === 'male' ? 'gender-male' : 'gender-female';
  };

  const getSportBadgeClass = (sport) => {
    const colors = {
      'Football': 'sport-football',
      'Netball': 'sport-netball',
      'Volleyball': 'sport-volleyball',
      'Basketball': 'sport-basketball',
      'Athletics': 'sport-athletics',
    };
    return colors[sport] || 'sport-other';
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  const getLevelDisplay = (level) => {
    const levels = {
      'primary': 'Primary School',
      'secondary': 'Secondary School',
      'high': 'High School'
    };
    return levels[level] || level;
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
    <div className="student-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">Manage all students in the system</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh data">
            <FaSync /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <FaFileExport /> Export CSV
          </button>
          <Link to="/admin/students/create" className="btn btn-primary">
            <FaPlus /> Add Student
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
                placeholder="Search by name..."
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
              <label>Gender:</label>
              <select 
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
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
          <FaUserGraduate className="stat-icon" />
          <div>
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{students.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaMale className="stat-icon" style={{ color: '#3B82F6' }} />
          <div>
            <span className="stat-label">Male</span>
            <span className="stat-value">{students.filter(s => s.gender === 'Male' || s.gender === 'male').length}</span>
          </div>
        </div>
        <div className="stat-item">
          <FaFemale className="stat-icon" style={{ color: '#EC4899' }} />
          <div>
            <span className="stat-label">Female</span>
            <span className="stat-value">{students.filter(s => s.gender === 'Female' || s.gender === 'female').length}</span>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <Card className="table-card">
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Gender</th>
                <th>School</th>
                <th>Sports</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <FaUserGraduate className="empty-icon" />
                    <p>No students found</p>
                    <p className="empty-subtitle">Try adjusting your filters or add a new student</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const imageUrl = getImageUrl(student.profile_picture);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={student.full_name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span>${student.full_name?.charAt(0) || 'S'}</span>`;
                                }}
                              />
                            ) : (
                              <span>{student.full_name?.charAt(0) || 'S'}</span>
                            )}
                          </div>
                          <div>
                            <div className="student-name">{student.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`gender-badge ${getGenderClass(student.gender)}`}>
                          {getGenderIcon(student.gender)} {student.gender || 'N/A'}
                        </span>
                      </td>
                      <td>{student.school_name || student.school?.name || '-'}</td>
                      <td>
                        <div className="sports-list">
                          {student.sport_assignments && student.sport_assignments.length > 0 ? (
                            student.sport_assignments.slice(0, 2).map((assignment, index) => (
                              <span key={index} className={`sport-badge ${getSportBadgeClass(assignment.sport_name)}`}>
                                {assignment.sport_name}
                              </span>
                            ))
                          ) : (
                            <span className="no-sport">No sports</span>
                          )}
                          {student.sport_assignments && student.sport_assignments.length > 2 && (
                            <span className="sport-more">+{student.sport_assignments.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td>{student.age || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(student.is_active)}`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            to={`/admin/students/${student.id}`} 
                            className="action-btn view-btn"
                            title="View Student"
                          >
                            <FaEye />
                          </Link>
                          <Link 
                            to={`/admin/students/${student.id}/edit`} 
                            className="action-btn edit-btn"
                            title="Edit Student"
                          >
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => handleDelete(student)}
                            className="action-btn delete-btn"
                            title="Delete Student"
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

        {renderPagination()}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Student</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedStudent.full_name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. All associated data will be deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;