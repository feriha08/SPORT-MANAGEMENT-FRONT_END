import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUser, FaCalendarAlt,
  FaSchool, FaUsers, FaTrophy, FaEdit, FaTrash,
  FaMale, FaFemale, FaUserGraduate, FaFutbol, FaMedal,
  FaCheckCircle, FaStar, FaCrown
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`students/${id}/`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student details');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`students/${id}/manage/`);
      toast.success('Student deleted successfully');
      setShowDeleteModal(false);
      navigate('/admin/students');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete student');
    }
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
    if (gender === 'male') return <FaMale />;
    if (gender === 'female') return <FaFemale />;
    return <FaUser />;
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'male') return 'Male';
    if (gender === 'female') return 'Female';
    return gender || 'N/A';
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!student) {
    return (
      <div className="student-detail-error">
        <h2>Student not found</h2>
        <Link to="/admin/students" className="btn btn-primary">
          <FaArrowLeft /> Back to Students
        </Link>
      </div>
    );
  }

  const profileUrl = getImageUrl(student.profile_picture);

  return (
    <div className="student-detail-page">
      {/* Header */}
      <div className="detail-header">
        <Link to="/admin/students" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="detail-header-actions">
          <Link to={`/admin/students/${id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Student Profile */}
      <Card className="student-detail-card">
        <div className="student-detail-header">
          <div className="student-detail-avatar">
            {profileUrl ? (
              <img src={profileUrl} alt={student.full_name} />
            ) : (
              <div className="student-detail-avatar-placeholder">
                {student.full_name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
          <div className="student-detail-info">
            <h1 className="student-detail-name">{student.full_name}</h1>
            <div className="student-detail-meta">
              <span className="detail-meta-item">
                {getGenderIcon(student.gender)} {getGenderDisplay(student.gender)}
              </span>
              <span className="detail-meta-item">
                <FaCalendarAlt /> {student.age || 'N/A'} years old
              </span>
              <span className="detail-meta-item">
                <FaSchool /> {student.school_name || student.school?.name || 'N/A'}
              </span>
            </div>
            <div className="student-detail-status">
              <span className={`status-badge ${student.is_active ? 'status-active' : 'status-inactive'}`}>
                {student.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="detail-grid">
        {/* Personal Information */}
        <Card className="detail-card">
          <h3>Personal Information</h3>
          <div className="detail-item">
            <FaUser className="detail-icon" />
            <div>
              <label>Full Name</label>
              <p>{student.full_name}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <div>
              <label>Date of Birth</label>
              <p>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaUserGraduate className="detail-icon" />
            <div>
              <label>Age</label>
              <p>{student.age || 'N/A'} years</p>
            </div>
          </div>
        </Card>

        {/* School & Sports */}
        <Card className="detail-card">
          <h3>School & Sports</h3>
          <div className="detail-item">
            <FaSchool className="detail-icon" />
            <div>
              <label>School</label>
              <p>{student.school_name || student.school?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaTrophy className="detail-icon" />
            <div>
              <label>Sports</label>
              {student.sport_assignments && student.sport_assignments.length > 0 ? (
                <div className="sports-list-detail">
                  {student.sport_assignments.map((sport, index) => (
                    <span key={index} className="sport-tag">
                      {sport.sport_name || sport.sport}
                      {sport.position && ` (${sport.position})`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-data">No sports assigned</p>
              )}
            </div>
          </div>
          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <div>
              <label>Status</label>
              <p>
                <span className={`status-badge ${student.is_active ? 'status-active' : 'status-inactive'}`}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="detail-card detail-card-full">
          <h3>Statistics</h3>
          <div className="detail-stats">
            <div className="detail-stat">
              <FaFutbol className="detail-stat-icon" />
              <div>
                <label>Matches Played</label>
                <p>{student.career_statistics?.matches_played || 0}</p>
              </div>
            </div>
            <div className="detail-stat">
              <FaMedal className="detail-stat-icon" />
              <div>
                <label>Goals Scored</label>
                <p>
                  {(student.career_statistics?.football?.goals_scored || 0) + 
                   (student.career_statistics?.netball?.goals_scored || 0)}
                </p>
              </div>
            </div>
            <div className="detail-stat">
              <FaTrophy className="detail-stat-icon" />
              <div>
                <label>Competitions</label>
                <p>{student.competition_history?.length || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        {student.achievements && student.achievements.length > 0 && (
          <Card className="detail-card detail-card-full">
            <h3>Achievements</h3>
            <div className="achievements-grid">
              {student.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div>
                    <p className="achievement-title">{achievement.title}</p>
                    <p className="achievement-desc">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Student</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{student.full_name}</strong>?</p>
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

export default StudentDetail;