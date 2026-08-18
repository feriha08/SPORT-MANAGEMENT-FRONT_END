import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSchool, FaMapMarkerAlt, FaCity, 
  FaEnvelope, FaPhone, FaGlobe, FaBuilding,
  FaUsers, FaTrophy, FaEdit, FaTrash, FaCheck, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './SchoolDetail.css';

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const schoolLevels = {
    'primary': 'Primary School',
    'secondary': 'Secondary School',
    'high': 'High School'
  };

  useEffect(() => {
    fetchSchool();
  }, [id]);

  const fetchSchool = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`schools/${id}/`);
      setSchool(response.data);
    } catch (error) {
      console.error('Error fetching school:', error);
      toast.error('Failed to load school details');
      navigate('/admin/schools');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await axiosInstance.put(`schools/${id}/activate/`, {
        is_active: !school.is_active
      });
      toast.success(`School ${school.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchSchool();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to toggle school status');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`schools/${id}/delete/`);
      toast.success('School deleted successfully');
      setShowDeleteModal(false);
      navigate('/admin/schools');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete school');
    }
  };

  const getImageUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
    return `${baseUrl}${logo.replace(/^\//, '')}`;
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!school) {
    return (
      <div className="school-detail-error">
        <h2>School not found</h2>
        <Link to="/admin/schools" className="btn btn-primary">
          <FaArrowLeft /> Back to Schools
        </Link>
      </div>
    );
  }

  const logoUrl = getImageUrl(school.logo);

  return (
    <div className="school-detail-page">
      {/* Header */}
      <div className="detail-header">
        <Link to="/admin/schools" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div className="detail-header-actions">
          <button 
            onClick={handleToggleStatus}
            className={`btn ${school.is_active ? 'btn-warning' : 'btn-success'}`}
          >
            {school.is_active ? <FaTimes /> : <FaCheck />} 
            {school.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <Link to={`/admin/schools/${id}/edit`} className="btn btn-primary">
            <FaEdit /> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* School Info */}
      <Card className="school-detail-card">
        <div className="school-detail-header">
          <div className="school-detail-logo">
            {logoUrl ? (
              <img src={logoUrl} alt={school.name} />
            ) : (
              <div className="school-detail-logo-placeholder">
                <FaSchool />
              </div>
            )}
          </div>
          <div className="school-detail-info">
            <h1 className="school-detail-name">{school.name}</h1>
            <p className="school-detail-id">ID: {school.school_id}</p>
            <div className="school-detail-status">
              <span className={`status-badge ${school.is_active ? 'status-active' : 'status-inactive'}`}>
                {school.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`level-badge ${school.school_level}`}>
                {schoolLevels[school.school_level] || school.school_level}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="detail-grid">
        <Card className="detail-card">
          <h3>School Information</h3>
          <div className="detail-item">
            <FaBuilding className="detail-icon" />
            <div>
              <label>School ID</label>
              <p>{school.school_id}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <div>
              <label>Region</label>
              <p>{school.region || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaCity className="detail-icon" />
            <div>
              <label>District</label>
              <p>{school.district || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaGlobe className="detail-icon" />
            <div>
              <label>School Level</label>
              <p>{schoolLevels[school.school_level] || school.school_level || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="detail-card">
          <h3>Contact Information</h3>
          <div className="detail-item">
            <FaEnvelope className="detail-icon" />
            <div>
              <label>Email</label>
              <p>{school.email || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaPhone className="detail-icon" />
            <div>
              <label>Phone Number</label>
              <p>{school.phone_number || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <div>
              <label>Address</label>
              <p>{school.address || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="detail-card detail-card-full">
          <h3>Statistics</h3>
          <div className="detail-stats">
            <div className="detail-stat">
              <FaUsers className="detail-stat-icon" />
              <div>
                <label>Students</label>
                <p>{school.student_count || 0}</p>
              </div>
            </div>
            <div className="detail-stat">
              <FaTrophy className="detail-stat-icon" />
              <div>
                <label>Competitions</label>
                <p>{school.competition_count || 0}</p>
              </div>
            </div>
            <div className="detail-stat">
              <FaSchool className="detail-stat-icon" />
              <div>
                <label>Status</label>
                <p>{school.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete School</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{school.name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. All associated data will be deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDetail;