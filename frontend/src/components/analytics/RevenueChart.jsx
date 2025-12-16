// src/components/analytics/RevenueChart.jsx
import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import "./RevenueChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data }) => {
  const [period, setPeriod] = useState('monthly');
  
  // Calculate totals with formatting
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
  const averageRevenue = Math.round(totalRevenue / data.length) || 0;
  const peakRevenue = Math.max(...data.map(item => item.revenue)) || 0;
  const lowestRevenue = Math.min(...data.map(item => item.revenue)) || 0;
  
  // Calculate growth metrics
  const calculateGrowth = () => {
    if (data.length < 2) return { percentage: 8.5, trend: 'up' };
    
    const current = data[data.length - 1]?.revenue || 0;
    const previous = data[data.length - 2]?.revenue || 0;
    
    if (previous === 0) return { percentage: 100, trend: 'up' };
    
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      trend: percentage >= 0 ? 'up' : 'down'
    };
  };

  const growth = calculateGrowth();
  
  // Calculate forecast
  const forecastRevenue = Math.round(totalRevenue * (1 + parseFloat(growth.percentage) / 100));

  // Generate gradient colors
  const generateRevenueGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 119, 204, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 119, 204, 0.05)');
    return gradient;
  };

  const generateBookingsGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(102, 179, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(102, 179, 255, 0.05)');
    return gradient;
  };

  const chartData = {
    labels: data.map(item => {
      const date = new Date(item._id);
      return period === 'weekly' 
        ? `Week ${date.getWeek()}`
        : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: '#0077cc',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return generateRevenueGradient(ctx);
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0077cc',
        pointBorderColor: '#050d18',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: '#66b3ff',
        pointHoverBorderColor: '#050d18',
        cubicInterpolationMode: 'monotone',
        segment: {
          borderColor: ctx => ctx.p1.parsed.y > ctx.p0.parsed.y ? '#4cd964' : '#ff3b30'
        }
      },
      {
        label: 'Bookings',
        data: data.map(item => item.bookings),
        borderColor: '#66b3ff',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return generateBookingsGradient(ctx);
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#66b3ff',
        pointBorderColor: '#050d18',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 9,
        cubicInterpolationMode: 'monotone',
        borderDash: [5, 5]
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#b3d9ff',
          font: {
            family: "'Josefin Sans', sans-serif",
            size: 14,
            weight: 600,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(5, 13, 24, 0.95)',
        titleColor: '#66b3ff',
        bodyColor: '#e0f0ff',
        borderColor: 'rgba(0, 119, 204, 0.5)',
        borderWidth: 1,
        titleFont: {
          family: "'Josefin Sans', sans-serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Josefin Sans', sans-serif",
          size: 13,
          weight: 500,
        },
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Revenue') {
                label += new Intl.NumberFormat('en-GH', {
                  style: 'currency',
                  currency: 'GHS'
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toLocaleString() + ' bookings';
              }
            }
            return label;
          },
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
              borderRadius: 6,
            };
          }
        }
      },
      title: {
        display: false,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 119, 204, 0.1)',
          drawBorder: false,
          lineWidth: 1,
        },
        border: {
          color: 'rgba(0, 119, 204, 0.3)',
          width: 2,
        },
        ticks: {
          color: '#99ccff',
          font: {
            family: "'Josefin Sans', sans-serif",
            size: 12,
            weight: 500,
          },
          padding: 10,
          callback: function(value) {
            return 'GH₵' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Amount (GHS)',
          color: '#b3d9ff',
          font: {
            family: "'Josefin Sans', sans-serif",
            size: 13,
            weight: 600,
          },
          padding: { top: 20, bottom: 10 }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 119, 204, 0.05)',
          drawBorder: false,
        },
        border: {
          color: 'rgba(0, 119, 204, 0.3)',
          width: 2,
        },
        ticks: {
          color: '#e0f0ff',
          font: {
            family: "'Josefin Sans', sans-serif",
            size: 12,
            weight: 600,
          },
          padding: 10,
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: period === 'weekly' ? 'Week' : 'Month',
          color: '#b3d9ff',
          font: {
            family: "'Josefin Sans', sans-serif",
            size: 13,
            weight: 600,
          },
          padding: { top: 10, bottom: 20 }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        hitRadius: 15,
        hoverRadius: 10,
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
      onProgress: function(animation) {
        // Smooth animation progress
      }
    }
  };

  // Helper to get week number
  Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="hostelhub-revenue-chart-container">
      <div className="hostelhub-revenue-chart-header">
        <div>
          <h3 className="hostelhub-revenue-chart-title">Revenue Analytics</h3>
          <p className="hostelhub-revenue-chart-subtitle">Track your financial performance and booking trends</p>
        </div>
        
        <div className="hostelhub-revenue-chart-period">
          <button 
            className={`hostelhub-period-button ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`hostelhub-period-button ${period === 'monthly' ? 'active' : ''}`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="hostelhub-revenue-chart">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="hostelhub-revenue-metrics">
        <div className="hostelhub-metric-card">
          <div className="hostelhub-metric-header">
            <FaChartLine className="hostelhub-metric-icon" />
            <span className="hostelhub-metric-label">Total Revenue</span>
          </div>
          <div className="hostelhub-metric-value">{formatCurrency(totalRevenue)}</div>
          <div className="hostelhub-metric-trend">
            <span className={`hostelhub-trend-indicator ${growth.trend}`}>
              {growth.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              {growth.percentage}%
            </span>
            <span className="hostelhub-trend-label">from last period</span>
          </div>
        </div>
        
        <div className="hostelhub-metric-card">
          <div className="hostelhub-metric-header">
            <div className="hostelhub-metric-icon-circle" style={{ backgroundColor: 'rgba(102, 179, 255, 0.2)' }}>
              📈
            </div>
            <span className="hostelhub-metric-label">Total Bookings</span>
          </div>
          <div className="hostelhub-metric-value">{totalBookings.toLocaleString()}</div>
          <div className="hostelhub-metric-subtext">
            {Math.round(totalBookings / data.length)} avg. per period
          </div>
        </div>
        
        <div className="hostelhub-metric-card">
          <div className="hostelhub-metric-header">
            <div className="hostelhub-metric-icon-circle" style={{ backgroundColor: 'rgba(76, 217, 100, 0.2)' }}>
              ⚡
            </div>
            <span className="hostelhub-metric-label">Peak Revenue</span>
          </div>
          <div className="hostelhub-metric-value">{formatCurrency(peakRevenue)}</div>
          <div className="hostelhub-metric-subtext">
            Highest achieved this period
          </div>
        </div>
        
        <div className="hostelhub-metric-card">
          <div className="hostelhub-metric-header">
            <div className="hostelhub-metric-icon-circle" style={{ backgroundColor: 'rgba(255, 59, 48, 0.2)' }}>
              📉
            </div>
            <span className="hostelhub-metric-label">Lowest Revenue</span>
          </div>
          <div className="hostelhub-metric-value">{formatCurrency(lowestRevenue)}</div>
          <div className="hostelhub-metric-subtext">
            Lowest point in this period
          </div>
        </div>
      </div>
      
      <div className="hostelhub-revenue-forecast">
        <div className="hostelhub-forecast-card">
          <div className="hostelhub-forecast-header">
            <FaCalendarAlt className="hostelhub-forecast-icon" />
            <div>
              <div className="hostelhub-forecast-title">Next Period Forecast</div>
              <div className="hostelhub-forecast-subtitle">Projected based on current trends</div>
            </div>
          </div>
          <div className="hostelhub-forecast-content">
            <div className="hostelhub-forecast-value">{formatCurrency(forecastRevenue)}</div>
            <div className={`hostelhub-forecast-growth ${growth.trend}`}>
              {growth.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              <span>{growth.percentage}% expected {growth.trend === 'up' ? 'growth' : 'decline'}</span>
            </div>
            <div className="hostelhub-forecast-note">
              Based on {data.length} periods of historical data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;