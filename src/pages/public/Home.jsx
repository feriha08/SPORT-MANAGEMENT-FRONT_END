import { FaTrophy, FaUsers, FaSchool, FaCalendarAlt } from 'react-icons/fa';
import './home.css';

const PublicDashboard = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <FaTrophy className="hero-icon" />
          <h1>SS&MS</h1>
          <h2>Sports School & Management System</h2>
          <p>Manage school sports competitions efficiently and effectively</p>
          <div className="hero-buttons">
            <a href="/login" className="btn btn-primary">Get Started</a>
            <a href="/competitions" className="btn btn-secondary">View Competitions</a>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why SS&MS?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaSchool className="feature-icon" />
              <h3>School Management</h3>
              <p>Register and manage schools participating in sports competitions</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Student Registration</h3>
              <p>Register students and assign them to different sports</p>
            </div>
            <div className="feature-card">
              <FaCalendarAlt className="feature-icon" />
              <h3>Competition Management</h3>
              <p>Create and manage sports competitions with ease</p>
            </div>
            <div className="feature-card">
              <FaTrophy className="feature-icon" />
              <h3>Results & Rankings</h3>
              <p>Track match results and view top performers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;