import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaLock, FaBell, 
  FaPalette, FaGlobe, FaSave, FaEdit,
  FaCheckCircle, FaMoon, FaSun, FaLanguage,
  FaShieldAlt, FaUserCog
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
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    match_alerts: true,
    competition_updates: true,
    system_announcements: true
  });
  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    sidebar_collapsed: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put('accounts/me/', {
        full_name: profileData.full_name,
        email: profileData.email,
        phone_number: profileData.phone_number
      });
      toast.success('Profile updated successfully!');
      console.log('Profile updated:', response.data);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
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
      await axiosInstance.post('accounts/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // API call to update notification settings
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeUpdate = async () => {
    setLoading(true);
    try {
      // API call to update theme settings
      toast.success('Theme updated successfully!');
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'password', label: 'Password', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'theme', label: 'Theme', icon: <FaPalette /> },
    { id: 'general', label: 'General', icon: <FaGlobe /> }
  ];

  if (!user) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-user">
            <div className="settings-avatar">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaUser /> Profile Settings
              </h3>
              <p className="settings-card-subtitle">
                Update your personal information
              </p>

              <form onSubmit={handleProfileUpdate} className="settings-form">
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
                    <FaEnvelope className="input-icon" />
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

          {/* Password Tab */}
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

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaBell /> Notification Settings
              </h3>
              <p className="settings-card-subtitle">
                Manage how you receive notifications
              </p>

              <div className="settings-form">
                <div className="notification-item">
                  <div className="notification-info">
                    <FaEnvelope className="notification-icon" />
                    <div>
                      <p className="notification-title">Email Notifications</p>
                      <p className="notification-desc">Receive notifications via email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        email_notifications: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <FaBell className="notification-icon" />
                    <div>
                      <p className="notification-title">Match Alerts</p>
                      <p className="notification-desc">Get alerts for upcoming matches</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.match_alerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        match_alerts: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <FaTrophy className="notification-icon" />
                    <div>
                      <p className="notification-title">Competition Updates</p>
                      <p className="notification-desc">Get updates about competitions</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.competition_updates}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        competition_updates: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <FaShieldAlt className="notification-icon" />
                    <div>
                      <p className="notification-title">System Announcements</p>
                      <p className="notification-desc">Receive important system announcements</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.system_announcements}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        system_announcements: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <button className="btn btn-primary" onClick={handleNotificationUpdate} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Notification Settings
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaPalette /> Theme Settings
              </h3>
              <p className="settings-card-subtitle">
                Customize the look and feel of your dashboard
              </p>

              <div className="settings-form">
                <div className="theme-options">
                  <div 
                    className={`theme-option ${themeSettings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => setThemeSettings({...themeSettings, theme: 'light'})}
                  >
                    <div className="theme-preview light-theme">
                      <div className="theme-preview-header"></div>
                      <div className="theme-preview-body"></div>
                    </div>
                    <p><FaSun /> Light</p>
                  </div>

                  <div 
                    className={`theme-option ${themeSettings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setThemeSettings({...themeSettings, theme: 'dark'})}
                  >
                    <div className="theme-preview dark-theme">
                      <div className="theme-preview-header"></div>
                      <div className="theme-preview-body"></div>
                    </div>
                    <p><FaMoon /> Dark</p>
                  </div>

                  <div 
                    className={`theme-option ${themeSettings.theme === 'system' ? 'active' : ''}`}
                    onClick={() => setThemeSettings({...themeSettings, theme: 'system'})}
                  >
                    <div className="theme-preview system-theme">
                      <div className="theme-preview-header"></div>
                      <div className="theme-preview-body"></div>
                    </div>
                    <p><FaGlobe /> System</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sidebar Behavior</label>
                  <div className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={themeSettings.sidebar_collapsed}
                      onChange={(e) => setThemeSettings({
                        ...themeSettings,
                        sidebar_collapsed: e.target.checked
                      })}
                    />
                    <span>Collapse sidebar by default</span>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleThemeUpdate} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Theme Settings
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <Card className="settings-card">
              <h3 className="settings-card-title">
                <FaGlobe /> General Settings
              </h3>
              <p className="settings-card-subtitle">
                System-wide settings and preferences
              </p>

              <div className="settings-form">
                <div className="form-group">
                  <label>System Name</label>
                  <div className="input-wrapper">
                    <FaGlobe className="input-icon" />
                    <input
                      type="text"
                      value="SS&MS"
                      className="form-control"
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Default Language</label>
                  <div className="input-wrapper">
                    <FaLanguage className="input-icon" />
                    <select className="form-control">
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Zone</label>
                  <div className="input-wrapper">
                    <FaGlobe className="input-icon" />
                    <select className="form-control">
                      <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option>
                      <option value="Africa/Nairobi">Africa/Nairobi</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save General Settings
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;