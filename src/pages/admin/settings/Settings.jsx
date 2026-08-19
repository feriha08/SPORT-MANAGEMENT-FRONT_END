import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaLock, FaSave, FaPhone, 
  FaCamera, FaTrash, FaUserCog
} from 'react-icons/fa';
import axiosInstance from '../../../api/axios';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        username: user.username || ''
      });
      if (user.profile_picture) {
        setProfilePreview(user.profile_picture);
      }
    }
  }, [user]);

  // ===== PROFILE UPDATE =====
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put(`accounts/${user.id}/`, {
        full_name: profileData.full_name,
        email: profileData.email,
        phone_number: profileData.phone_number || '',
      });
      
      toast.success('Profile updated successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROFILE PICTURE UPDATE =====
  const handleProfilePictureUpdate = async () => {
    if (!profilePicture) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', profilePicture);
      
      const response = await axiosInstance.put(`accounts/${user.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Profile picture updated successfully!');
      if (response.data?.profile_picture) {
        setProfilePreview(response.data.profile_picture);
      }
      setProfilePicture(null);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Profile picture update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  // ===== PASSWORD CHANGE =====
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.current_password) {
      toast.error('Current password is required');
      return;
    }
    
    if (!passwordData.new_password) {
      toast.error('New password is required');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('accounts/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setTimeout(() => {
        toast.info('Please login again with your new password');
        logout();
        window.location.href = '/login';
      }, 1500);
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROFILE PICTURE HANDLERS =====
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview(null);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'password', label: 'Password', icon: <FaLock /> },
  ];

  if (!user) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-user">
            <div className="settings-avatar">
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" />
              ) : (
                <span>{user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="settings-user-info">
              <p className="settings-user-name">{user?.full_name || user?.username}</p>
              <p className="settings-user-role">{user?.role || 'User'}</p>
            </div>
          </div>

          <nav className="settings-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-nav-icon">{tab.icon}</span>
                <span className="settings-nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-nav-footer">
            <button className="settings-logout-btn" onClick={logout}>
              <FaUserCog /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaUser /> Profile Settings
              </h3>
              <p className="settings-card-subtitle">
                Update your personal information
              </p>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                {/* Profile Picture */}
                <div className="form-group">
                  <label>Profile Picture</label>
                  <div className="profile-picture-upload">
                    <div className="profile-picture-preview">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" />
                      ) : (
                        <div className="profile-picture-placeholder">
                          <FaUser />
                        </div>
                      )}
                    </div>
                    <div className="profile-picture-actions">
                      <label className="btn btn-secondary btn-sm">
                        <FaCamera /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {profilePreview && (
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm"
                          onClick={removeProfilePicture}
                        >
                          <FaTrash /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {profilePicture && (
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={handleProfilePictureUpdate}
                      style={{ marginTop: '10px' }}
                    >
                      <FaSave /> Save Profile Picture
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      className="form-control"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      value={profileData.username}
                      className="form-control"
                      disabled
                    />
                    <span className="input-disabled-hint">Username cannot be changed</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="form-control"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                      className="form-control"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </form>
            </Card>
          )}

          {/* ===== PASSWORD TAB ===== */}
          {activeTab === 'password' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaLock /> Change Password
              </h3>
              <p className="settings-card-subtitle">
                Update your password to keep your account secure
              </p>

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="form-control"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="form-control"
                      placeholder="Enter new password (min 8 characters)"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="form-control"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Changing...
                    </>
                  ) : (
                    <>
                      <FaSave /> Change Password
                    </>
                  )}
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;