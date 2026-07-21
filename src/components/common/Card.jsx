import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title = '',
  subtitle = '',
  icon = null,
  className = '',
  hoverable = true,
  padding = '24px'
}) => {
  return (
    <div className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`} style={{ padding }}>
      {(title || subtitle || icon) && (
        <div className="card-header">
          {icon && <div className="card-icon">{icon}</div>}
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;