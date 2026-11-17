import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, subtitle, icon: Icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      {(change !== undefined || subtitle) && (
        <div className="stat-footer">
          {change !== undefined && (
            <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {change}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
