import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFutbol, FaTshirt, FaUsers, FaPlus, FaTrash,
  FaUserGraduate, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import './SchoolTeams.css';

const SchoolTeams = () => {
  const [sports, setSports] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sports
      const sportsRes = await axiosInstance.get('sports/');
      setSports(sportsRes.data);

      // Fetch students
      const studentsRes = await axiosInstance.get('students/school/');
      setStudents(studentsRes.data);

      // Build team members by sport
      const teamMap = {};
      sportsRes.data.forEach(sport => {
        const members = studentsRes.data.filter(student => 
          student.sport_assignments?.some(sa => sa.sport === sport.id)
        );
        teamMap[sport.id] = members;
      });
      setTeamMembers(teamMap);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = (sport) => {
    setSelectedSport(sport);
    
    // Get students not already in this sport
    const currentMembers = teamMembers[sport.id] || [];
    const currentIds = currentMembers.map(m => m.id);
    const available = students.filter(s => !currentIds.includes(s.id));
    
    setAvailableStudents(available);
    setShowAddModal(true);
  };

  const handleAddPlayerToTeam = async (studentId) => {
    try {
      await axiosInstance.post('students/assign/', {
        student: studentId,
        sport: selectedSport.id
      });

      toast.success('Player added to team successfully!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error(error.response?.data?.error || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (assignmentId) => {
    try {
      await axiosInstance.delete(`students/assignments/${assignmentId}/remove/`);
      toast.success('Player removed from team successfully!');
      fetchData();
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="school-teams-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Teams</h1>
          <p className="page-subtitle">Manage your school sports teams</p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="teams-grid">
        {sports.map((sport) => {
          const members = teamMembers[sport.id] || [];
          const maxSquad = sport.max_squad_size;
          const teamSize = sport.team_size;
          const isFull = members.length >= maxSquad;
          const isReady = members.length >= teamSize;

          return (
            <Card key={sport.id} className="team-card">
              <div className="team-card-header">
                <div className="team-icon">
                  {sport.name === 'football' ? <FaFutbol /> : <FaTshirt />}
                </div>
                <div className="team-info">
                  <h3>{sport.name === 'football' ? 'Football' : sport.name === 'netball' ? 'Netball' : 'Volleyball'}</h3>
                  <p className="team-meta">
                    {members.length}/{maxSquad} players
                  </p>
                </div>
                <div className={`team-status ${isReady ? 'ready' : 'pending'}`}>
                  {isReady ? 'Ready' : 'Need More'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="team-progress">
                <div 
                  className={`progress-bar ${isReady ? 'ready' : ''}`}
                  style={{ width: `${(members.length / maxSquad) * 100}%` }}
                ></div>
              </div>

              {/* Squad Size Info */}
              <div className="squad-info">
                <span>Team Size: {teamSize} players</span>
                <span>Max Squad: {maxSquad} players</span>
              </div>

              {/* Team Members */}
              <div className="team-members-list">
                {members.length > 0 ? (
                  members.map((student) => (
                    <div key={student.id} className="team-member-item">
                      <div className="member-avatar">
                        {student.full_name.charAt(0)}
                      </div>
                      <div className="member-info">
                        <p className="member-name">{student.full_name}</p>
                        <p className="member-details">
                          {student.gender === 'male' ? 'Male' : 'Female'} • {student.age} years
                        </p>
                      </div>
                      <div className="member-actions">
                        {student.sport_assignments?.map(sa => {
                          if (sa.sport === sport.id) {
                            return (
                              <button
                                key={sa.id}
                                className="remove-btn"
                                onClick={() => handleRemovePlayer(sa.id)}
                                title="Remove from team"
                              >
                                <FaTrash />
                              </button>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-members">
                    <FaUsers className="empty-icon" />
                    <p>No players in this team yet</p>
                  </div>
                )}
              </div>

              {/* Add Player Button */}
              <div className="team-actions">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleAddPlayer(sport)}
                  disabled={isFull}
                >
                  <FaPlus /> Add Player
                </Button>
                {isFull && (
                  <p className="full-message">Team squad is full</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Player Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add Player to ${selectedSport?.name === 'football' ? 'Football' : selectedSport?.name === 'netball' ? 'Netball' : 'Volleyball'} Team`}
        size="large"
      >
        {availableStudents.length > 0 ? (
          <div className="available-students-list">
            <p className="modal-instruction">Select a student to add to the team:</p>
            {availableStudents.map((student) => (
              <div key={student.id} className="available-student-item">
                <div className="member-avatar">
                  {student.full_name.charAt(0)}
                </div>
                <div className="member-info">
                  <p className="member-name">{student.full_name}</p>
                  <p className="member-details">
                    {student.gender === 'male' ? 'Male' : 'Female'} • {student.age} years
                  </p>
                </div>
                <button
                  className="add-player-btn"
                  onClick={() => handleAddPlayerToTeam(student.id)}
                >
                  <FaPlus /> Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-available-students">
            <FaUserGraduate className="empty-icon" />
            <p>No available students to add. All students are already in this team.</p>
            <Link to="/school/students/create" className="btn btn-primary">
              <FaPlus /> Add New Student
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SchoolTeams;