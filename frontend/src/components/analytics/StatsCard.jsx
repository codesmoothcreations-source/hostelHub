// src/components/analytics/StatsCard.jsx
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { FaArrowUp, FaArrowDown, FaFire, FaChartLine, FaUsers, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import styles from './StatsCard.module.css';

const StatsCard = ({ 
  title, 
  value, 
  change = 0, 
  metricType = 'default', 
  dateText, 
  data,
  description,
  showChart = true
}) => {
  const isPositive = change >= 0;
  
  // Default chart data if none provided
  const chartData = data || [
    { pv: 10 }, { pv: 25 }, { pv: 18 }, { pv: 45 }, 
    { pv: 30 }, { pv: 28 }, { pv: 60 }, { pv: 90 }, 
    { pv: 85 }, { pv: 100 }, { pv: 80 }, { pv: 95 }
  ];

  // Icon mapping
  const getMetricIcon = () => {
    switch(metricType) {
      case 'revenue': return <FaMoneyBillWave className={styles.iconRevenue} />;
      case 'occupancy': return <FaUsers className={styles.iconOccupancy} />;
      case 'trending': return <FaFire className={styles.iconTrending} />;
      case 'growth': return <FaChartLine className={styles.iconGrowth} />;
      case 'rating': return <FaStar className={styles.iconRating} />;
      default: return <FaChartLine className={styles.iconDefault} />;
    }
  };

  // Color based on metric type
  const getMetricColor = () => {
    switch(metricType) {
      case 'revenue': return '#00e5ff'; // Electric Cyan
      case 'occupancy': return '#4cd964'; // Green
      case 'trending': return '#ff3b30'; // Red
      case 'growth': return '#ffcc00'; // Yellow
      case 'rating': return '#ff9500'; // Orange
      default: return '#00e5ff'; // Electric Cyan as default
    }
  };

  // Format value
  const formatValue = () => {
    if (metricType === 'revenue') {
      return `$${Number(value).toLocaleString()}`;
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

  const metricColor = getMetricColor();
  const icon = getMetricIcon();

  return (
    <div className={styles.statsCard}>
      {/* Gradient Overlay */}
      <div 
        className={styles.gradientOverlay}
        style={{ 
          background: `linear-gradient(135deg, ${metricColor}20, ${metricColor}05)`
        }}
      ></div>

      {/* Content Section */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{title}</h3>
            {dateText && <p className={styles.date} style={{ color: `${metricColor}bb` }}>
              {dateText}
            </p>}
          </div>
          <div 
            className={styles.iconWrapper}
            style={{ background: `${metricColor}20` }}
          >
            {icon}
          </div>
        </div>

        <div className={styles.valueSection}>
          <h2 className={styles.value}>{formatValue()}</h2>
          {change !== undefined && (
            <div className={`${styles.changeIndicator} ${isPositive ? styles.positive : styles.negative}`}>
              {isPositive ? <FaArrowUp /> : <FaArrowDown />}
              <span>{isPositive ? '+' : ''}{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      {/* Chart Section */}
      {showChart && (
        <div className={styles.chartContainer}>
          <div className={styles.chartGrid}>
            <div className={styles.gridLine}></div>
            <div className={styles.gridLine}></div>
            <div className={styles.gridLine}></div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={metricColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="pv"
                stroke={metricColor}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-${metricType})`}
                animationDuration={1500}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Badge */}
      <div className={styles.statusBadge}>
        <div className={`${styles.trendDot} ${isPositive ? styles.up : styles.down}`}></div>
        <span>{isPositive ? 'Positive' : 'Negative'} Trend</span>
      </div>
    </div>
  );
};

export default StatsCard;