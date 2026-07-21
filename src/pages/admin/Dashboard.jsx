import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaSchool, FaUserGraduate, FaTrophy, 
  FaCalendarAlt, FaFutbol, FaPlus, FaFileAlt,
  FaUserCog, FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import axiosInstance from '../../api/axios';
import './Admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    totalStudents: 0,
    totalCompetitions: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, schoolsRes, studentsRes, competitionsRes, matchesRes] = await Promise.all([
        axiosInstance.get('accounts/list/'),
        axiosInstance.get('schools/'),
        axiosInstance.get('students/'),
        axiosInstance.get('competitions/'),
        axiosInstance.get('matches/')
      ]);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalSchools: schoolsRes.data?.length || 0,
        totalStudents: studentsRes.data?.length || 0,
        totalCompetitions: competitionsRes.data?.length || 0,
        totalMatches: matchesRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.full_name || user?.username || 'Admin'}!
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary">
            <FaPlus /> Create Competition
          </button>
          <button className="btn btn-outline">
            <FaFileAlt /> Generate Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {/* Card 1 - Blue */}
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon">
            <FaUsers />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Users</p>
            <p className="stat-card-value">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Card 2 - Green */}
        <div className="stat-card stat-card-green">
          <div className="stat-card-icon">
            <FaSchool />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Schools</p>
            <p className="stat-card-value">{stats.totalSchools}</p>
          </div>
        </div>

        {/* Card 3 - Purple */}
        <div className="stat-card stat-card-purple">
          <div className="stat-card-icon">
            <FaUserGraduate />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Students</p>
            <p className="stat-card-value">{stats.totalStudents}</p>
          </div>
        </div>

        {/* Card 4 - Yellow */}
        <div className="stat-card stat-card-yellow">
          <div className="stat-card-icon">
            <FaTrophy />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Competitions</p>
            <p className="stat-card-value">{stats.totalCompetitions}</p>
          </div>
        </div>

        {/* Card 5 - Red */}
        <div className="stat-card stat-card-red">
          <div className="stat-card-icon">
            <FaFutbol />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Matches</p>
            <p className="stat-card-value">{stats.totalMatches}</p>
          </div>
        </div>

        {/* Card 6 - Orange */}
        <div className="stat-card stat-card-orange">
          <div className="stat-card-icon">
            <FaBuilding />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Active Schools</p>
            <p className="stat-card-value">{stats.totalSchools}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <div className="quick-action-item">
            <div className="quick-action-icon blue"><FaTrophy /></div>
            <span>Create Competition</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon green"><FaCalendarAlt /></div>
            <span>Generate Fixtures</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon purple"><FaUserCog /></div>
            <span>Manage Users</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon orange"><FaFileAlt /></div>
            <span>View Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;