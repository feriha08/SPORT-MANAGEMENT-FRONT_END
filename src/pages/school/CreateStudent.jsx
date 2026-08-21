import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserGraduate, FaSave, FaArrowLeft, FaImage,
  FaMars, FaVenus, FaCalendar, FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './StudentForm.css';

const CreateStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    profile_picture: null,
    selectedSports: [],
    is_active: true  // Default active
  });
  const [profilePreview, setProfilePreview] = useState(null);

  // Fetch available sports
  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await axiosInstance.get('sports/');
      setSports(response.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
      toast.error('Failed to load sports');
    } finally {
      setLoadingSports(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profile_picture: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSportToggle = (sportId) => {
    setFormData(prev => {
      const isSelected = prev.selectedSports.includes(sportId);
      return {
        ...prev,
        selectedSports: isSelected 
          ? prev.selectedSports.filter(id => id !== sportId)
          : [...prev.selectedSports, sportId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('full_name', formData.full_name);
      formDataObj.append('gender', formData.gender);
      formDataObj.append('date_of_birth', formData.date_of_birth);
      formDataObj.append('is_active', true);  // ADD THIS
      
      if (formData.profile_picture) {
        formDataObj.append('profile_picture', formData.profile_picture);
      }
      
      // Add sports as JSON string
      if (formData.selectedSports.length > 0) {
        formDataObj.append('sports', JSON.stringify(formData.selectedSports));
      }

      const response = await axiosInstance.post('students/create/', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Student created successfully!');
      navigate('/school/students');
    } catch (error) {
      console.error('Error creating student:', error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.full_name) toast.error(data.full_name[0]);
        else if (data.gender) toast.error(data.gender[0]);
        else if (data.date_of_birth) toast.error(data.date_of_birth[0]);
        else if (data.error) toast.error(data.error);
        else toast.error('Failed to create student');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingSports) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="student-form-page">
      <div className="form-header">
        <button onClick={() => navigate('/school/students')} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </button>
        <div>
          <h1 className="form-title">Add Student</h1>
          <p className="form-subtitle">Register a new student in your school</p>
        </div>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group form-group-full">
              <label htmlFor="full_name">
                <FaUserGraduate className="form-icon" />
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter student full name"
                className="form-control"
                required
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">
                <FaUsers className="form-icon" />
                Gender *
              </label>
              <div className="gender-select">
                <button
                  type="button"
                  className={`gender-option male ${formData.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <FaMars /> Male
                </button>
                <button
                  type="button"
                  className={`gender-option female ${formData.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <FaVenus /> Female
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="date_of_birth">
                <FaCalendar className="form-icon" />
                Date of Birth *
              </label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Profile Picture */}
            <div className="form-group form-group-full">
              <label htmlFor="profile_picture">
                <FaImage className="form-icon" />
                Profile Picture
              </label>
              <div className="file-upload-wrapper">
                <div className="file-upload-area">
                  {profilePreview ? (
                    <div className="profile-preview">
                      <img src={profilePreview} alt="Profile Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setProfilePreview(null);
                          setFormData({ ...formData, profile_picture: null });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <FaImage className="upload-icon" />
                      <span>Click to upload profile picture</span>
                      <span className="upload-hint">PNG, JPG up to 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="file-input"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Sports Selection */}
            <div className="form-group form-group-full">
              <label>
                <FaUsers className="form-icon" />
                Sports (Optional)
              </label>
              <div className="sports-selection">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    className={`sport-option ${formData.selectedSports.includes(sport.id) ? 'selected' : ''}`}
                    onClick={() => handleSportToggle(sport.id)}
                  >
                    {sport.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" loading={loading}>
              <FaSave /> Save Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateStudent;