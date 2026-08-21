import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaUserGraduate, FaMale, FaFemale, FaUsers,
  FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './SchoolStudents.css';

const SchoolStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const response = await axiosInstance.get('students/school/');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Failed to load students');
      } else {
        toast.error('Failed to load students');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search filter
    if (search && !student.full_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Gender filter
    if (filterGender && student.gender !== filterGender) {
      return false;
    }
    
    return true;
  });

  // Handle delete
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`students/${studentToDelete.id}/manage/`);
      toast.success('Student deleted successfully!');
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'male').length;
  const femaleStudents = students.filter(s => s.gender === 'female').length;

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="school-students-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Students Management</h1>
          <p className="page-subtitle">Manage all students in your school</p>
        </div>
        <Link to="/school/students/create" className="btn btn-primary">
          <FaPlus /> Add Student
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="students-stats-grid">
        <div className="student-stat-card">
          <div className="student-stat-icon blue">
            <FaUsers />
          </div>
          <div className="student-stat-content">
            <p className="student-stat-label">Total Students</p>
            <p className="student-stat-value">{totalStudents}</p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon green">
            <FaMale />
          </div>
          <div className="student-stat-content">
            <p className="student-stat-label">Male Students</p>
            <p className="student-stat-value">{maleStudents}</p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon purple">
            <FaFemale />
          </div>
          <div className="student-stat-content">
            <p className="student-stat-label">Female Students</p>
            <p className="student-stat-value">{femaleStudents}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search students by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterGender === '' ? 'active' : ''}`}
              onClick={() => setFilterGender('')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filterGender === 'male' ? 'active' : ''}`}
              onClick={() => setFilterGender('male')}
            >
              Male
            </button>
            <button 
              className={`filter-btn ${filterGender === 'female' ? 'active' : ''}`}
              onClick={() => setFilterGender('female')}
            >
              Female
            </button>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="students-table-card">
        {filteredStudents.length > 0 ? (
          <div className="table-responsive">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Sports</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="student-name">{student.full_name}</p>
                          <p className="student-id">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`gender-badge ${student.gender}`}>
                        {student.gender === 'male' ? 'Male' : 'Female'}
                      </span>
                    </td>
                    <td>{student.age} years</td>
                    <td>
                      <div className="sports-tags">
                        {student.sport_assignments?.length > 0 ? (
                          student.sport_assignments.slice(0, 2).map((sa, idx) => (
                            <span key={idx} className="sport-tag">
                              {sa.sport_name}
                            </span>
                          ))
                        ) : (
                          <span className="no-sports">No sports</span>
                        )}
                        {student.sport_assignments?.length > 2 && (
                          <span className="sport-tag more">
                            +{student.sport_assignments.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => navigate(`/school/students/${student.id}`)}
                          title="View Student"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="action-btn edit"
                          onClick={() => navigate(`/school/students/${student.id}/edit`)}
                          title="Edit Student"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(student)}
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FaUserGraduate className="empty-icon" />
            <h3>No Students Found</h3>
            <p>{search || filterGender ? 'No students match your filters.' : 'Add your first student to get started.'}</p>
            {!search && !filterGender && (
              <Link to="/school/students/create" className="btn btn-primary">
                <FaPlus /> Add Student
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        size="small"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteConfirm}
              loading={deleting}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{studentToDelete?.full_name}</strong>?</p>
        <p style={{ color: 'var(--error)', fontSize: '14px', marginTop: '8px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default SchoolStudents;