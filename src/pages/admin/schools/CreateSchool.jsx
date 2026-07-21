import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaSchool, FaMapMarkerAlt, FaCity, 
  FaEnvelope, FaPhone, FaSave, FaImage, FaGlobe, FaBuilding
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './SchoolForm.css';

// Validation schema
const schoolSchema = yup.object({
  name: yup.string().required('School name is required'),
  school_id: yup.string().required('School ID is required'),
  region: yup.string().required('Region is required'),
  district: yup.string().required('District is required'),
  school_level: yup.string().required('School level is required'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone_number: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  logo: yup.mixed().nullable(),
});

const CreateSchool = () => {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schoolSchema),
    defaultValues: {
      name: '',
      school_id: '',
      region: '',
      district: '',
      school_level: '',
      email: '',
      phone_number: '',
      address: '',
      logo: null,
    },
  });

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('logo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('school_id', data.school_id);
      formData.append('region', data.region);
      formData.append('district', data.district);
      formData.append('school_level', data.school_level);
      formData.append('email', data.email);
      formData.append('phone_number', data.phone_number);
      formData.append('address', data.address);
      if (data.logo) {
        formData.append('logo', data.logo);
      }

      console.log('📤 Creating school with data:', data);

      const response = await axiosInstance.post('schools/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ School created:', response.data);
      toast.success('🎉 School created successfully!');
      
      setTimeout(() => {
        navigate('/admin/schools');
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating school:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to create school. ';
        
        if (typeof errorData === 'object') {
          const errors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          }
        }
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create school. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="school-form-page">
      <div className="form-header">
        <Link to="/admin/schools" className="btn btn-secondary">
          <FaArrowLeft /> Back
        </Link>
        <div>
          <h1 className="form-title">Create School</h1>
          <p className="form-subtitle">Add a new school to the system (Super Admin)</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* School Name */}
            <div className="form-group form-group-full">
              <label htmlFor="name">
                School Name <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaSchool className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter school name"
                  {...register('name')}
                  className={`form-control ${errors.name ? 'error' : ''}`}
                />
              </div>
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            {/* School ID */}
            <div className="form-group">
              <label htmlFor="school_id">
                School ID <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaBuilding className="input-icon" />
                <input
                  id="school_id"
                  type="text"
                  placeholder="Enter school ID"
                  {...register('school_id')}
                  className={`form-control ${errors.school_id ? 'error' : ''}`}
                />
              </div>
              {errors.school_id && (
                <span className="error-message">{errors.school_id.message}</span>
              )}
            </div>

            {/* Region */}
            <div className="form-group">
              <label htmlFor="region">
                Region <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <select
                  id="region"
                  {...register('region')}
                  className={`form-control ${errors.region ? 'error' : ''}`}
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              {errors.region && (
                <span className="error-message">{errors.region.message}</span>
              )}
            </div>

            {/* District */}
            <div className="form-group">
              <label htmlFor="district">
                District <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCity className="input-icon" />
                <select
                  id="district"
                  {...register('district')}
                  className={`form-control ${errors.district ? 'error' : ''}`}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              {errors.district && (
                <span className="error-message">{errors.district.message}</span>
              )}
            </div>

            {/* School Level */}
            <div className="form-group">
              <label htmlFor="school_level">
                School Level <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaGlobe className="input-icon" />
                <select
                  id="school_level"
                  {...register('school_level')}
                  className={`form-control ${errors.school_level ? 'error' : ''}`}
                >
                  <option value="">Select Level</option>
                  {schoolLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.school_level && (
                <span className="error-message">{errors.school_level.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register('email')}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number">
                Phone Number <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  id="phone_number"
                  type="tel"
                  placeholder="Enter phone number"
                  {...register('phone_number')}
                  className={`form-control ${errors.phone_number ? 'error' : ''}`}
                />
              </div>
              {errors.phone_number && (
                <span className="error-message">{errors.phone_number.message}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-group form-group-full">
              <label htmlFor="address">
                Address <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <textarea
                  id="address"
                  placeholder="Enter school address"
                  {...register('address')}
                  className={`form-control ${errors.address ? 'error' : ''}`}
                  rows="3"
                />
              </div>
              {errors.address && (
                <span className="error-message">{errors.address.message}</span>
              )}
            </div>

            {/* Logo Upload */}
            <div className="form-group form-group-full">
              <label htmlFor="logo">School Logo</label>
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
                          setValue('logo', null);
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
            <Link to="/admin/schools" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create School
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateSchool;