import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaUserGraduate, FaTrophy, FaFutbol,
  FaCheckCircle, FaClock, FaPlus, FaSchool, FaChartBar,
  FaCalendarAlt, FaTshirt, FaBuilding, FaEye, FaStar
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import axiosInstance from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SchoolDashboard.css';

const SchoolDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('schools/statistics/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404) {
        navigate('/school/register-school');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!stats) {
    return (
      <div className="school-dashboard-empty">
        <FaSchool className="empty-icon" />
        <h2>No School Registered</h2>
        <p>Please register your school to continue.</p>
        <Link to="/school/register-school" className="btn btn-primary">
          <FaPlus /> Register School
        </Link>
      </div>
    );
  }

  const { school_info, student_statistics, competition_statistics, match_results_summary, top_scorers } = stats;

  return (
    <div className="school-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="school-logo">
            {school_info?.logo_url ? (
              <img src={school_info.logo_url} alt={school_info.name} />
            ) : (
              <FaSchool />
            )}
          </div>
          <div>
            <h1 className="dashboard-title">Welcome back!</h1>
            <p className="dashboard-subtitle">
              {school_info?.name} - {school_info?.district}, {school_info?.region}
            </p>
          </div>
        </div>
        <div className="dashboard-header-right">
          <Link to="/school/profile" className="btn btn-secondary">
            <FaBuilding /> School Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={student_statistics?.total_students || 0}
          icon={<FaUsers />}
          color="blue"
          subtitle={`${student_statistics?.gender_breakdown?.male || 0} Male, ${student_statistics?.gender_breakdown?.female || 0} Female`}
        />
        <StatCard
          title="Active Competitions"
          value={competition_statistics?.active_competitions || 0}
          icon={<FaTrophy />}
          color="green"
          subtitle={`${competition_statistics?.approved_participations || 0} Approved`}
        />
        <StatCard
          title="Matches Played"
          value={match_results_summary?.total_matches_played || 0}
          icon={<FaFutbol />}
          color="yellow"
          subtitle={`${match_results_summary?.wins || 0} Wins, ${match_results_summary?.draws || 0} Draws`}
        />
        <StatCard
          title="Win Rate"
          value={`${match_results_summary?.win_rate || 0}%`}
          icon={<FaChartBar />}
          color="purple"
          subtitle={`${match_results_summary?.goals_scored || 0} Goals Scored`}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/school/students" className="quick-action-card">
            <div className="quick-action-icon blue">
              <FaUserGraduate />
            </div>
            <span className="quick-action-label">Manage Students</span>
            <span className="quick-action-desc">Add, edit, view students</span>
          </Link>
          
          <Link to="/school/teams" className="quick-action-card">
            <div className="quick-action-icon green">
              <FaTshirt />
            </div>
            <span className="quick-action-label">Manage Teams</span>
            <span className="quick-action-desc">Create and manage teams</span>
          </Link>
          
          <Link to="/school/competitions" className="quick-action-card">
            <div className="quick-action-icon yellow">
              <FaTrophy />
            </div>
            <span className="quick-action-label">Competitions</span>
            <span className="quick-action-desc">View competitions</span>
          </Link>
          
          <Link to="/school/fixtures" className="quick-action-card">
            <div className="quick-action-icon purple">
              <FaCalendarAlt />
            </div>
            <span className="quick-action-label">Fixtures</span>
            <span className="quick-action-desc">View match fixtures</span>
          </Link>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="recent-section">
        <h3 className="section-title">Recent Matches</h3>
        <Card className="recent-card">
          {match_results_summary?.recent_matches?.length > 0 ? (
            <div className="matches-list">
              {match_results_summary.recent_matches.map((match, index) => (
                <div key={index} className="match-item">
                  <div className="match-result match-result-{match.result.toLowerCase()}">
                    {match.result}
                  </div>
                  <div className="match-info">
                    <p className="match-competition">{match.competition}</p>
                    <p className="match-teams">
                      {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
                    </p>
                    <p className="match-date">{match.completed_at}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaFutbol className="empty-icon" />
              <p>No matches played yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Top Scorers */}
      <div className="top-scorers-section">
        <h3 className="section-title">Top Scorers</h3>
        <Card className="scorers-card">
          {top_scorers?.length > 0 ? (
            <div className="scorers-list">
              {top_scorers.slice(0, 5).map((scorer, index) => (
                <div key={index} className="scorer-item">
                  <div className="scorer-rank">
                    <FaStar />
                  </div>
                  <div className="scorer-info">
                    <p className="scorer-name">{scorer.player_name}</p>
                    <p className="scorer-sport">{scorer.sport}</p>
                  </div>
                  <div className="scorer-goals">
                    <span className="goals-count">{scorer.total_goals}</span>
                    <span className="goals-label">Goals</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaStar className="empty-icon" />
              <p>No top scorers yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SchoolDashboard;