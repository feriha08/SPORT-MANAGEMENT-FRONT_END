import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserGraduate, FaTrophy, FaFutbol,
  FaCheckCircle, FaClock, FaPlus, FaSchool
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import axiosInstance from '../../api/axios';
import './School.css';

const SchoolDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    sportsOffered: 0,
    activeCompetitions: 0,
    pendingApprovals: 0,
    matchesPlayed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch school data
      const schoolRes = await axiosInstance.get('schools/profile/');
      const school = schoolRes.data;
      
      // Fetch students
      const studentsRes = await axiosInstance.get('students/school/');
      const students = studentsRes.data || [];
      
      // Fetch competitions
      const competitionsRes = await axiosInstance.get('competitions/my-competitions/');
      const competitions = competitionsRes.data || [];
      
      // Fetch matches
      const matchesRes = await axiosInstance.get('matches/');
      const matches = matchesRes.data || [];

      const maleStudents = students.filter(s => s.gender === 'Male').length;
      const femaleStudents = students.filter(s => s.gender === 'Female').length;

      setStats({
        totalStudents: students.length,
        maleStudents: maleStudents,
        femaleStudents: femaleStudents,
        sportsOffered: school?.sports?.length || 0,
        activeCompetitions: competitions.filter(c => c.status === 'Ongoing' || c.status === 'Open').length,
        pendingApprovals: competitions.filter(c => c.status === 'Pending').length,
        matchesPlayed: matches.filter(m => m.status === 'Finished').length
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
    <div className="school-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">School Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.full_name || user?.username || 'School Admin'}!
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon">
            <FaUsers />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Total Students</p>
            <p className="stat-card-value">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-icon">
            <FaUserGraduate />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Male Students</p>
            <p className="stat-card-value">{stats.maleStudents}</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-card-icon">
            <FaUserGraduate />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Female Students</p>
            <p className="stat-card-value">{stats.femaleStudents}</p>
          </div>
        </div>

        <div className="stat-card stat-card-yellow">
          <div className="stat-card-icon">
            <FaTrophy />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Sports Offered</p>
            <p className="stat-card-value">{stats.sportsOffered}</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-card-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Active Competitions</p>
            <p className="stat-card-value">{stats.activeCompetitions}</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-icon">
            <FaFutbol />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-title">Matches Played</p>
            <p className="stat-card-value">{stats.matchesPlayed}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <div className="quick-action-item">
            <div className="quick-action-icon blue"><FaPlus /></div>
            <span>Register Student</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon green"><FaTrophy /></div>
            <span>Assign Sport</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon purple"><FaTrophy /></div>
            <span>Register Competition</span>
          </div>
          <div className="quick-action-item">
            <div className="quick-action-icon orange"><FaSchool /></div>
            <span>View School Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;