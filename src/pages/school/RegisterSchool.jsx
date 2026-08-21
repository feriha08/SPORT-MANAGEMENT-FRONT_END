import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSchool, FaMapMarkerAlt, FaCity, FaEnvelope, 
  FaPhone, FaSave, FaArrowLeft, FaImage,
  FaGlobe, FaBuilding
} from 'react-icons/fa';
import axiosInstance from '../../api/axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './RegisterSchool.css';

const RegisterSchool = () => {
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasSchool, setHasSchool] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    school_id: '',
    region: '',
    district: '',
    school_level: '',
    email: '',
    phone_number: '',
    address: '',
    logo: null
  });

  // Check if school already exists
  useEffect(() => {
    checkExistingSchool();
  }, []);

  const checkExistingSchool = async () => {
    try {
      const response = await axiosInstance.get('schools/profile/');
      if (response.data) {
        // School already exists - show message but stay on page
        setHasSchool(true);
        toast.info('You already have a registered school. You can view it in School Profile.');
      }
    } catch (error) {
      // 404 means no school - good, show register form
      if (error.response?.status !== 404) {
        console.error('Error checking school:', error);
      }
    } finally {
      setCheckingExisting(false);
    }
  };

  const regions = [
    'Unguja North', 'Unguja South', 'Unguja Urban West',
    'Pemba North', 'Pemba South', 'Tumbatu'
  ];

  const districts = [
    'Zanzibar City', 'Mkoani', 'Chake Chake', 'Wete',
    'Kaskazini', 'Kusini', 'Micheweni', 'Kojani'
  ];

  const schoolLevels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'high', label: 'High School' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (hasSchool) {
      toast.error('You already have a registered school!');
      return;
    }
    
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('school_id', formData.school_id);
      formDataObj.append('region', formData.region);
      formDataObj.append('district', formData.district);
      formDataObj.append('school_level', formData.school_level);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone_number', formData.phone_number);
      formDataObj.append('address', formData.address);
      if (formData.logo) {
        formDataObj.append('logo', formData.logo);
      }

      const response = await axiosInstance.post('schools/register/', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('🎉 School registered successfully! Waiting for approval.');
      
      setTimeout(() => {
        navigate('/school/profile');
      }, 1500);
    } catch (error) {
      console.error('Error registering school:', error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.school_id) toast.error(`School ID: ${data.school_id[0]}`);
        else if (data.email) toast.error(`Email: ${data.email[0]}`);
        else if (data.error) toast.error(data.error);
        else toast.error('Failed to register school');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="register-school-page">
      <div className="form-header">
        <button onClick={() => navigate('/school/dashboard')} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="form-title">Register School</h1>
          <p className="form-subtitle">Register your school to participate in competitions</p>
        </div>
      </div>

      {hasSchool && (
        <div className="alert alert-warning">
          <FaBuilding className="alert-icon" />
          <div>
            <strong>You already have a registered school!</strong>
            <p>You cannot register another school. Please view your school profile.</p>
          </div>
          <button onClick={() => navigate('/school/profile')} className="btn btn-primary btn-sm">
            View School Profile
          </button>
        </div>
      )}

      <Card className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>School Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter school name"
                className="form-control"
                required
                disabled={hasSchool}
              />
            </div>

            <div className="form-group">
              <label>School ID *</label>
              <input
                type="text"
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                placeholder="Enter school ID"
                className="form-control"
                required
                disabled={hasSchool}
              />
            </div>

            <div className="form-group">
              <label>Region *</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="form-control"
                required
                disabled={hasSchool}
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="form-control"
                required
                disabled={hasSchool}
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>School Level *</label>
              <select
                name="school_level"
                value={formData.school_level}
                onChange={handleChange}
                className="form-control"
                required
                disabled={hasSchool}
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
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-control"
                required
                disabled={hasSchool}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="form-control"
                required
                disabled={hasSchool}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter school address"
                className="form-control"
                rows="3"
                required
                disabled={hasSchool}
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
                          setFormData({ ...formData, logo: null });
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
                        disabled={hasSchool}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" loading={loading} disabled={hasSchool}>
              <FaSave /> Register School
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterSchool;