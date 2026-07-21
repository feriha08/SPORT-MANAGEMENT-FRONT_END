import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaUsersCog, 
  FaTrophy, 
  FaFileAlt, 
  FaCalendarAlt,
  FaUserPlus,
  FaSchool,
  FaChartBar
} from 'react-icons/fa';
import Card from '../../../components/common/Card';
import './QuickActions.css';

const QuickActions = () => {
  const actions = [
    {
      title: 'Create Competition',
      icon: <FaTrophy />,
      link: '/admin/competitions/create',
      color: 'yellow'
    },
    {
      title: 'Generate Fixtures',
      icon: <FaCalendarAlt />,
      link: '/admin/fixtures/generate',
      color: 'blue'
    },
    {
      title: 'Manage Users',
      icon: <FaUsersCog />,
      link: '/admin/users',
      color: 'green'
    },
    {
      title: 'View Reports',
      icon: <FaFileAlt />,
      link: '/admin/reports',
      color: 'purple'
    },
    {
      title: 'Create User',
      icon: <FaUserPlus />,
      link: '/admin/users/create',
      color: 'blue'
    },
    {
      title: 'View Statistics',
      icon: <FaChartBar />,
      link: '/admin/reports',
      color: 'red'
    }
  ];

  return (
    <Card title="Quick Actions" className="quick-actions-card">
      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <Link 
            key={index}
            to={action.link}
            className={`quick-action-btn quick-action-${action.color}`}
          >
            <span className="quick-action-icon">{action.icon}</span>
            <span className="quick-action-title">{action.title}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;