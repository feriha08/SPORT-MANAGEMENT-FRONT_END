import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaUserGraduate,
  FaMars, FaVenus, FaCalendar, FaUsers, FaTrophy,
  FaFutbol, FaStar, FaMedal, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './StudentDetail.css';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`students/${id}/`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student details');
      navigate('/school/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!student) {
    return null;
  }

  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/').replace('/api/', '').replace(/\/$/, '');
  const profileUrl = student.profile_picture 
    ? (student.profile_picture.startsWith('http') ? student.profile_picture : `${BASE_URL}${student.profile_picture}`)
    : null;

  return (
    <div className="student-detail-page">
      <div className="page-header">
        <button onClick={() => navigate('/school/students')} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </button>
        <div className="page-header-actions">
          <Link to={`/school/students/${student.id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit
          </Link>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="student-profile-card">
        <div className="student-profile-header">
          <div className="student-profile-avatar">
            {profileUrl ? (
              <img src={profileUrl} alt={student.full_name} />
            ) : (
              <FaUserGraduate />
            )}
          </div>
          <div className="student-profile-info">
            <h2>{student.full_name}</h2>
            <p className="student-school">{student.school_name}</p>
            <div className="student-profile-meta">
              <span className={`gender-badge ${student.gender}`}>
                {student.gender === 'male' ? <FaMars /> : <FaVenus />}
                {student.gender === 'male' ? 'Male' : 'Female'}
              </span>
              <span className="age-badge">
                <FaCalendar /> {student.age} years
              </span>
              <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                {student.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Sports */}
        <div className="student-section">
          <h3 className="section-title">
            <FaUsers /> Sports
          </h3>
          <div className="student-sports">
            {student.sport_assignments?.length > 0 ? (
              student.sport_assignments.map((sa) => (
                <div key={sa.id} className="student-sport-card">
                  <span className="sport-name">{sa.sport_name}</span>
                  {sa.position && (
                    <span className="position-label">{sa.position}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="no-data">No sports assigned</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        {student.achievements?.length > 0 && (
          <div className="student-section">
            <h3 className="section-title">
              <FaTrophy /> Achievements
            </h3>
            <div className="achievements-list">
              {student.achievements.map((achievement, idx) => (
                <div key={idx} className="achievement-item">
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div>
                    <p className="achievement-title">{achievement.title}</p>
                    <p className="achievement-desc">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {student.recent_matches?.length > 0 && (
          <div className="student-section">
            <h3 className="section-title">
              <FaFutbol /> Recent Matches
            </h3>
            <div className="recent-matches-list">
              {student.recent_matches.map((match, idx) => (
                <div key={idx} className="recent-match-item">
                  <div className="match-result">
                    {match.result === 'Win' ? 'W' : match.result === 'Loss' ? 'L' : 'D'}
                  </div>
                  <div className="match-info">
                    <p className="match-competition">{match.competition}</p>
                    <p className="match-teams">
                      {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDetail;