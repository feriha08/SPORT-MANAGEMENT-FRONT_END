import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaClock, FaFutbol, FaTrophy,
  FaUsers, FaCheckCircle, FaHourglassHalf, FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import axiosInstance from '../../api/axios';
import './Referee.css';

const RefereeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayMatches: 0,
    upcomingAssignments: 0,
    matchesOfficiated: 0,
    totalGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [todayMatches, setTodayMatches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch matches assigned to this referee
      const matchesRes = await axiosInstance.get('matches/');
      const matches = matchesRes.data || [];
      
      // Filter matches for this referee
      const refereeMatches = matches.filter(m => m.referee === user?.id || m.referee_name === user?.username);
      
      // Today's matches
      const today = new Date().toDateString();
      const todayMatchesList = refereeMatches.filter(m => {
        const matchDate = new Date(m.match_date);
        return matchDate.toDateString() === today;
      });

      setTodayMatches(todayMatchesList);
      
      setStats({
        todayMatches: todayMatchesList.length,
        upcomingAssignments: refereeMatches.filter(m => m.status === 'Scheduled').length,
        matchesOfficiated: refereeMatches.filter(m => m.status === 'Finished').length,
        totalGoals: refereeMatches.reduce((sum, m) => sum + (m.home_score || 0) + (m.away_score || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="referee-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Referee Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.full_name || user?.username || 'Referee'}!
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Today's Matches</p>
            <p className="stat-card-value">{stats.todayMatches}</p>
          </div>
        </div>

        <div className="stat-card stat-card-yellow">
          <div className="stat-card-icon">
            <FaHourglassHalf />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Upcoming Assignments</p>
            <p className="stat-card-value">{stats.upcomingAssignments}</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Matches Officiated</p>
            <p className="stat-card-value">{stats.matchesOfficiated}</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-card-icon">
            <FaFutbol />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Goals</p>
            <p className="stat-card-value">{stats.totalGoals}</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="schedule-section">
        <h3>Today's Schedule</h3>
        {todayMatches.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <p>No matches scheduled for today</p>
          </div>
        ) : (
          <div className="schedule-list">
            {todayMatches.map((match, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">
                  <FaClock />
                  <span>{match.match_time || 'TBD'}</span>
                </div>
                <div className="schedule-match">
                  <span className="team-name">{match.home_team || 'TBD'}</span>
                  <span className="vs-text">vs</span>
                  <span className="team-name">{match.away_team || 'TBD'}</span>
                </div>
                <div className="schedule-actions">
                  <button className="btn btn-sm btn-primary">
                    Submit Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RefereeDashboard;