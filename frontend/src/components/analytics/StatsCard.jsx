// src/components/analytics/StatsCard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown, FaFire, FaChartLine, FaUsers, FaMoneyBillWave, FaStar, FaPercentage } from 'react-icons/fa';
import "./StatsCard.css";

const StatsCard = ({ title, value, icon, change, metricType, previousValue, description }) => {
  const isPositive = change >= 0;
  
  // Icon mapping for different metric types
  const getMetricIcon = () => {
    switch(metricType) {
      case 'revenue': 
        return <FaMoneyBillWave className="hostelhub-icon-revenue" />;
      case 'occupancy': 
        return <FaUsers className="hostelhub-icon-occupancy" />;
      case 'trending': 
        return <FaFire className="hostelhub-icon-trending" />;
      case 'growth': 
        return <FaChartLine className="hostelhub-icon-growth" />;
      case 'rating':
        return <FaStar className="hostelhub-icon-rating" />;
      default: 
        return icon || <FaChartLine className="hostelhub-icon-default" />;
    }
  };
  
  // Get appropriate gradient based on metric type
  const getMetricGradient = () => {
    switch(metricType) {
      case 'revenue': 
        return 'linear-gradient(135deg, rgba(76, 217, 100, 0.9), rgba(76, 217, 100, 0.5))';
      case 'occupancy': 
        return 'linear-gradient(135deg, rgba(0, 119, 204, 0.9), rgba(0, 119, 204, 0.5))';
      case 'trending': 
        return 'linear-gradient(135deg, rgba(255, 59, 48, 0.9), rgba(255, 59, 48, 0.5))';
      case 'growth': 
        return 'linear-gradient(135deg, rgba(255, 204, 0, 0.9), rgba(255, 204, 0, 0.5))';
      case 'rating':
        return 'linear-gradient(135deg, rgba(255, 149, 0, 0.9), rgba(255, 149, 0, 0.5))';
      default: 
        return 'linear-gradient(135deg, rgba(102, 179, 255, 0.9), rgba(102, 179, 255, 0.5))';
    }
  };
  
  // Get card background color
  const getCardBackground = () => {
    switch(metricType) {
      case 'revenue': 
        return 'rgba(76, 217, 100, 0.08)';
      case 'occupancy': 
        return 'rgba(0, 119, 204, 0.08)';
      case 'trending': 
        return 'rgba(255, 59, 48, 0.08)';
      case 'growth': 
        return 'rgba(255, 204, 0, 0.08)';
      case 'rating':
        return 'rgba(255, 149, 0, 0.08)';
      default: 
        return 'rgba(102, 179, 255, 0.08)';
    }
  };
  
  // Format value based on type
  const formatValue = () => {
    if (metricType === 'revenue') {
      return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (metricType === 'percentage' || metricType === 'occupancy') {
      return `${Number(value).toLocaleString()}%`;
    }
    if (metricType === 'rating') {
      return Number(value).toFixed(1);
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };
  
  // Calculate absolute change
  const getAbsoluteChange = () => {
    if (previousValue && typeof value === 'number' && typeof previousValue === 'number') {
      const absoluteChange = value - previousValue;
      
      if (metricType === 'revenue') {
        return new Intl.NumberFormat('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Math.abs(absoluteChange));
      }
      
      if (metricType === 'percentage' || metricType === 'occupancy') {
        return `${Math.abs(absoluteChange).toFixed(1)}%`;
      }
      
      return Math.abs(absoluteChange).toLocaleString();
    }
    return null;
  };

  // Get status text based on change
  const getStatusText = () => {
    if (Math.abs(change) >= 15) {
      return isPositive ? 'Excellent' : 'Needs Attention';
    } else if (Math.abs(change) >= 5) {
      return isPositive ? 'Good' : 'Watch';
    } else {
      return isPositive ? 'Stable' : 'Declining';
    }
  };

  // Generate sparkline data
  const generateSparklineData = () => {
    const base = 50;
    const variation = 40;
    return Array.from({ length: 7 }, (_, i) => {
      const randomFactor = Math.sin(i * 0.8) * variation;
      const value = base + randomFactor + (isPositive ? 10 : -10);
      return Math.max(10, Math.min(95, value));
    });
  };

  const sparklineData = generateSparklineData();

  return (
    <div 
      className="hostelhub-stats-card" 
      data-metric-type={metricType}
      style={{ background: getCardBackground() }}
    >
      {/* Gradient overlay */}
      <div 
        className="hostelhub-stats-gradient-overlay"
        style={{ background: getMetricGradient() }}
      ></div>
      
      {/* Animated particles */}
      <div className="hostelhub-stats-particles">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="hostelhub-particle"
            style={{
              background: getMetricGradient(),
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
      
      <div className="hostelhub-stats-header">
        <div className="hostelhub-stats-title-wrapper">
          <h3 className="hostelhub-stats-title">{title}</h3>
          <div className="hostelhub-stats-trend-indicator">
            <div className={`hostelhub-trend-dot ${isPositive ? 'hostelhub-trend-up' : 'hostelhub-trend-down'}`}></div>
            <span className="hostelhub-trend-label">
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="hostelhub-stats-icon-wrapper">
          <div className="hostelhub-stats-icon" style={{ background: getMetricGradient() }}>
            {getMetricIcon()}
          </div>
          {metricType && (
            <div className="hostelhub-stats-badge">
              {metricType.charAt(0).toUpperCase() + metricType.slice(1)}
            </div>
          )}
        </div>
      </div>
      
      {description && (
        <div className="hostelhub-stats-description">
          {description}
        </div>
      )}
      
      <div className="hostelhub-stats-content">
        <div className="hostelhub-stats-value">
          {formatValue()}
          {metricType === 'rating' && (
            <span className="hostelhub-rating-outof">/5</span>
          )}
        </div>
        
        <div className="hostelhub-stats-progress">
          <div className="hostelhub-progress-bar">
            <div 
              className={`hostelhub-progress-fill ${isPositive ? 'hostelhub-progress-positive' : 'hostelhub-progress-negative'}`}
              style={{ 
                width: `${Math.min(Math.abs(change) * 2, 100)}%`,
                background: getMetricGradient()
              }}
            ></div>
          </div>
          <div className="hostelhub-progress-label">
            <span>Monthly Growth</span>
            <span className="hostelhub-growth-percent">
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="hostelhub-stats-footer">
        <div className="hostelhub-stats-change">
          <span className={`hostelhub-change-indicator ${isPositive ? 'hostelhub-change-positive' : 'hostelhub-change-negative'}`}>
            {isPositive ? (
              <FaArrowUp className="hostelhub-change-icon" />
            ) : (
              <FaArrowDown className="hostelhub-change-icon" />
            )}
            <span className="hostelhub-change-percent">
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
          </span>
          
          {getAbsoluteChange() && (
            <span className="hostelhub-change-absolute">
              {isPositive ? '+' : '-'}{getAbsoluteChange()} vs last period
            </span>
          )}
          
          <span className="hostelhub-change-text">
            compared to previous period
          </span>
        </div>
        
        <div className="hostelhub-stats-sparkline">
          <div className="hostelhub-sparkline-dots">
            {sparklineData.map((height, index) => (
              <div 
                key={index} 
                className="hostelhub-sparkline-dot" 
                style={{
                  height: `${height}%`,
                  background: getMetricGradient(),
                  opacity: 0.7 - (index * 0.07)
                }}
              ></div>
            ))}
          </div>
          <div className="hostelhub-sparkline-line">
            {sparklineData.map((height, index, arr) => {
              if (index === arr.length - 1) return null;
              const nextHeight = arr[index + 1];
              return (
                <div
                  key={`line-${index}`}
                  className="hostelhub-sparkline-connector"
                  style={{
                    background: `linear-gradient(to right, 
                      ${isPositive ? '#4cd964' : '#ff3b30'}, 
                      ${isPositive ? '#34d399' : '#f87171'})`,
                    height: '2px',
                    position: 'absolute',
                    left: `${index * 14.28}%`,
                    top: '50%',
                    width: '14.28%',
                    transform: `translateY(${(height + nextHeight) / 4 - 50}%) rotate(${
                      Math.atan2(nextHeight - height, 14.28) * (180 / Math.PI)
                    }deg)`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="hostelhub-stats-hover"></div>
    </div>
  );
};

export default StatsCard;