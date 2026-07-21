import React from 'react';
import './StatCard.css';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  subtitle = '',
  trend = null,
  trendLabel = ''
}) => {
  const trendClass = trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : '';

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <div className="stat-card-left">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
        <div className="stat-card-icon">
          {icon}
        </div>
      </div>
      {trend !== null && (
        <div className="stat-card-footer">
          <span className={`stat-trend ${trendClass}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="stat-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;