import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaCalendarAlt, FaSchool,
  FaTrophy, FaFutbol, FaMedal, FaStar,
  FaArrowLeft, FaUsers, FaCheckCircle, FaPhone
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`students/${id}/`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Student not found</h2>
        <Link to="/students" className="btn btn-primary">
          <FaArrowLeft /> Back to Students
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'sports', label: 'Sports', icon: <FaTrophy /> },
    { id: 'statistics', label: 'Statistics', icon: <FaMedal /> },
    { id: 'achievements', label: 'Achievements', icon: <FaStar /> }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', background: '#F1F5F9', minHeight: '100vh' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/students" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          background: '#FFFFFF',
          borderRadius: '8px',
          textDecoration: 'none',
          color: '#0F172A',
          fontWeight: '500',
          fontSize: '14px',
          border: '1px solid #E2E8F0'
        }}>
          <FaArrowLeft /> Back to Students
        </Link>
      </div>

      {/* Profile Card */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #1B4D8B 0%, #3A7BD5 100%)',
          padding: '40px 40px 0 40px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '120px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid #FFFFFF',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: '700',
            color: '#1B4D8B',
            overflow: 'hidden',
            position: 'absolute',
            bottom: '-60px'
          }}>
            {student.full_name?.charAt(0) || 'S'}
          </div>
        </div>
        <div style={{ padding: '70px 32px 32px 32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: '0' }}>
            {student.full_name}
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: '4px 0 12px 0' }}>
            @{student.username}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B' }}>
              <FaSchool style={{ color: '#1B4D8B' }} /> {student.school_name || 'N/A'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B' }}>
              <FaCalendarAlt style={{ color: '#1B4D8B' }} /> {student.age || 'N/A'} years old
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B' }}>
              <FaUsers style={{ color: '#1B4D8B' }} /> {student.gender || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '24px',
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #E2E8F0'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === tab.id ? '#1B4D8B' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {activeTab === 'overview' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: '0 0 16px 0' }}>
              About {student.full_name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Full Name</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>{student.full_name}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Username</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>@{student.username}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Email</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>{student.email || 'N/A'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Gender</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>{student.gender || 'N/A'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>Age</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>{student.age || 'N/A'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>School</label>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#0F172A', margin: '4px 0 0 0' }}>{student.school_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sports' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: '0 0 16px 0' }}>Sports & Positions</h3>
            {student.sports && student.sports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {student.sports.map((sport, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      <FaTrophy />
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', color: '#0F172A', margin: '0' }}>{sport.name || sport}</p>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Position: {sport.position || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No sports assigned</p>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: '0 0 16px 0' }}>Career Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500', margin: '0 0 4px 0' }}>Matches Played</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: '0' }}>{student.matches_played || 0}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500', margin: '0 0 4px 0' }}>Goals Scored</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: '0' }}>{student.goals_scored || 0}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500', margin: '0 0 4px 0' }}>Cards Received</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: '0' }}>{student.cards_received || 0}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500', margin: '0 0 4px 0' }}>Sets Won</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', margin: '0' }}>{student.sets_won || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: '0 0 16px 0' }}>Achievements & Badges</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <FaCheckCircle style={{ fontSize: '24px', color: '#F59E0B' }} />
                <div>
                  <p style={{ fontWeight: '500', color: '#0F172A', margin: '0' }}>Competition Experience</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Participated in 5+ competitions</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <FaStar style={{ fontSize: '24px', color: '#F59E0B' }} />
                <div>
                  <p style={{ fontWeight: '500', color: '#0F172A', margin: '0' }}>Goal Scorer</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Scored 10+ goals in career</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <FaTrophy style={{ fontSize: '24px', color: '#F59E0B' }} />
                <div>
                  <p style={{ fontWeight: '500', color: '#0F172A', margin: '0' }}>Team Captain</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Led team in 3+ matches</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <FaMedal style={{ fontSize: '24px', color: '#94A3B8' }} />
                <div>
                  <p style={{ fontWeight: '500', color: '#0F172A', margin: '0' }}>Experienced Player</p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Played 20+ matches</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;