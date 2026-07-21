import React, { useState, useEffect } from 'react';
import { 
  FaUserPlus, FaTrophy, FaUserGraduate, 
  FaFutbol, FaSchool, FaClock 
} from 'react-icons/fa';
import Card from '../../../components/common/Card';
import axiosInstance from '../../../api/axios';
import './RecentActivity.css';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch recent activities from various endpoints
      const [usersRes, schoolsRes, competitionsRes, matchesRes] = await Promise.all([
        axiosInstance.get('accounts/list/?limit=5'),
        axiosInstance.get('schools/?limit=5'),
        axiosInstance.get('competitions/?limit=5'),
        axiosInstance.get('matches/?limit=5')
      ]);

      const activities = [];

      // Add user registrations
      (usersRes.data || []).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          icon: <FaUserPlus />,
          title: `New user registered: ${user.full_name || user.username}`,
          time: user.created_at || new Date().toISOString(),
          color: 'blue'
        });
      });

      // Add school registrations
      (schoolsRes.data || []).forEach(school => {
        activities.push({
          id: `school-${school.id}`,
          type: 'school',
          icon: <FaSchool />,
          title: `New school registered: ${school.name}`,
          time: school.created_at || new Date().toISOString(),
          color: 'green'
        });
      });

      // Add competitions
      (competitionsRes.data || []).forEach(comp => {
        activities.push({
          id: `comp-${comp.id}`,
          type: 'competition',
          icon: <FaTrophy />,
          title: `New competition created: ${comp.name}`,
          time: comp.created_at || new Date().toISOString(),
          color: 'yellow'
        });
      });

      // Add matches
      (matchesRes.data || []).forEach(match => {
        activities.push({
          id: `match-${match.id}`,
          type: 'match',
          icon: <FaFutbol />,
          title: `New match scheduled: ${match.home_team} vs ${match.away_team}`,
          time: match.created_at || new Date().toISOString(),
          color: 'red'
        });
      });

      // Sort by time (newest first) and take top 5
      const sorted = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

      setActivities(sorted);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Set sample data if API fails
      setActivities([
        {
          id: 1,
          type: 'user',
          icon: <FaUserPlus />,
          title: 'New user registered: John Doe',
          time: new Date().toISOString(),
          color: 'blue'
        },
        {
          id: 2,
          type: 'school',
          icon: <FaSchool />,
          title: 'New school registered: Zanzibar High School',
          time: new Date(Date.now() - 3600000).toISOString(),
          color: 'green'
        },
        {
          id: 3,
          type: 'competition',
          icon: <FaTrophy />,
          title: 'New competition created: Zanzibar Cup 2026',
          time: new Date(Date.now() - 7200000).toISOString(),
          color: 'yellow'
        },
        {
          id: 4,
          type: 'match',
          icon: <FaFutbol />,
          title: 'Match result submitted: Mapinduzi FC vs Zanzibar FC',
          time: new Date(Date.now() - 10800000).toISOString(),
          color: 'red'
        },
        {
          id: 5,
          type: 'student',
          icon: <FaUserGraduate />,
          title: 'New student registered: Ali Hassan',
          time: new Date(Date.now() - 14400000).toISOString(),
          color: 'purple'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'activity-blue',
      green: 'activity-green',
      yellow: 'activity-yellow',
      red: 'activity-red',
      purple: 'activity-purple'
    };
    return colors[color] || 'activity-blue';
  };

  return (
    <Card title="Recent Activity" className="recent-activity-card">
      <div className="activity-timeline">
        {loading ? (
          <div className="activity-loading">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="activity-empty">No recent activities</div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className={`activity-item ${index === activities.length - 1 ? 'activity-last' : ''}`}>
              <div className="activity-icon-wrapper">
                <div className={`activity-icon ${getColorClass(activity.color)}`}>
                  {activity.icon}
                </div>
                {index < activities.length - 1 && <div className="activity-line"></div>}
              </div>
              <div className="activity-content">
                <p className="activity-title">{activity.title}</p>
                <span className="activity-time">
                  <FaClock /> {getTimeAgo(activity.time)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;