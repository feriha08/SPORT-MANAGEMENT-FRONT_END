import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSchool, FaMapMarkerAlt, FaCity, FaEnvelope, 
  FaPhone, FaEdit, FaSave, FaImage,
  FaGlobe, FaBuilding, FaUsers, FaTrophy
} from 'react-icons/fa';
import axiosInstance from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SchoolForm.css';

const SchoolProfile = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const navigate = useNavigate();

  const schoolLevels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'high', label: 'High School' }
  ];

  const regions = [
    'Unguja North', 'Unguja South', 'Unguja Urban West',
    'Pemba North', 'Pemba South', 'Tumbatu'
  ];

  const districts = [
    'Zanzibar City', 'Mkoani', 'Chake Chake', 'Wete',
    'Kaskazini', 'Kusini', 'Micheweni', 'Kojani'
  ];

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      const response = await axiosInstance.get('schools/profile/');
      setSchool(response.data);
      setFormData(response.data);
      if (response.data.logo) {
        setLogoPreview(response.data.logo);
      }
    } catch (error) {
      console.error('Error fetching school profile:', error);
      if (error.response?.status === 404) {
        toast.info('School not registered yet. Please register your school.');
        navigate('/school/register');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this profile.');
        navigate('/school/dashboard');
      } else {
        toast.error('Failed to load school profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      updateData.append('school_id', formData.school_id);
      updateData.append('region', formData.region);
      updateData.append('district', formData.district);
      updateData.append('school_level', formData.school_level);
      updateData.append('email', formData.email);
      updateData.append('phone_number', formData.phone_number);
      updateData.append('address', formData.address);
      if (logoFile) {
        updateData.append('logo', logoFile);
      }

      const response = await axiosInstance.put('schools/profile/', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSchool(response.data);
      setEditing(false);
      toast.success('School profile updated successfully!');
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!school) {
    return (
      <div className="school-profile-empty">
        <h2>No School Registered</h2>
        <p>Please register your school to continue.</p>
        <button onClick={() => navigate('/school/register')} className="btn btn-primary">
          Register School
        </button>
      </div>
    );
  }

  return (
    <div className="school-profile-page">
      <div className="profile-header">
        <h1 className="profile-title">School Profile</h1>
        <button 
          onClick={() => setEditing(!editing)} 
          className="btn btn-secondary"
        >
          {editing ? 'Cancel' : <><FaEdit /> Edit</>}
        </button>
      </div>

      <Card className="profile-card">
        {editing ? (
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label>School Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>School ID</label>
                <input
                  type="text"
                  name="school_id"
                  value={formData.school_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Region</label>
                <select
                  name="region"
                  value={formData.region || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>District</label>
                <select
                  name="district"
                  value={formData.district || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>School Level</label>
                <select
                  name="school_level"
                  value={formData.school_level || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Level</option>
                  {schoolLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label>School Logo</label>
                <div className="file-upload-wrapper">
                  <div className="file-upload-area">
                    {logoPreview ? (
                      <div className="logo-preview">
                        <img src={logoPreview} alt="School Logo" />
                        <button
                          type="button"
                          className="remove-logo"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="file-upload-label">
                        <FaImage className="upload-icon" />
                        <span>Click to upload school logo</span>
                        <span className="upload-hint">PNG, JPG up to 2MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="file-input"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSave /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="profile-logo">
              {logoPreview ? (
                <img src={logoPreview} alt={school.name} />
              ) : (
                <div className="logo-placeholder">
                  <FaSchool />
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>{school.name}</h2>
              <p className="school-id">ID: {school.school_id}</p>
              <div className="profile-details">
                <div className="detail-item">
                  <FaMapMarkerAlt />
                  <span>{school.region}</span>
                </div>
                <div className="detail-item">
                  <FaCity />
                  <span>{school.district}</span>
                </div>
                <div className="detail-item">
                  <FaGlobe />
                  <span>
                    {schoolLevels.find(l => l.value === school.school_level)?.label || school.school_level}
                  </span>
                </div>
                <div className="detail-item">
                  <FaEnvelope />
                  <span>{school.email}</span>
                </div>
                <div className="detail-item">
                  <FaPhone />
                  <span>{school.phone_number}</span>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt />
                  <span>{school.address}</span>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat">
                  <FaUsers />
                  <span>{school.student_count || 0} Students</span>
                </div>
                <div className="stat">
                  <FaTrophy />
                  <span>{school.competition_count || 0} Competitions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SchoolProfile;