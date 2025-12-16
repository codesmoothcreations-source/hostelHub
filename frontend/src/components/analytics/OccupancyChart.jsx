// src/components/analytics/OccupancyChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./OccupancyChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OccupancyChart = ({ data }) => {
  const generateGradientColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = 210 + (i * 20) % 50; // Blue tones
      const saturation = 70 + (i * 5) % 20;
      const lightness = 40 + (i * 3) % 15;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const generateHoverColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = 190 + (i * 20) % 40; // Lighter blue tones
      const saturation = 80 + (i * 5) % 15;
      const lightness = 50 + (i * 3) % 20;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const backgroundColor = generateGradientColors(data.length);
  const hoverBackgroundColor = generateHoverColors(data.length);
  const borderColor = backgroundColor.map(color => color.replace('%)', '%, 1)'));

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Occupancy Rate',
        data: data.map(item => {
          const occupancy = 100 - ((item.availableRooms / item.initialRooms) * 100);
          return Math.round(occupancy);
        }),
        backgroundColor: backgroundColor.map(color => color.replace('%)', '%, 0.8)')),
        borderColor: borderColor,
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: hoverBackgroundColor.map(color => color.replace('%)', '%, 0.9)')),
        hoverBorderColor: hoverBackgroundColor.map(color => color.replace('%)', '%, 1)')),
        hoverBorderWidth: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
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
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            const hostel = data[context.dataIndex];
            const available = hostel.availableRooms;
            const total = hostel.initialRooms;
            const occupied = total - available;
            
            return [
              `Occupancy: ${context.raw}%`,
              `Rooms: ${occupied}/${total} occupied`,
              `${available} rooms available`
            ];
          },
          labelColor: function(context) {
            return {
              borderColor: hoverBackgroundColor[context.dataIndex],
              backgroundColor: hoverBackgroundColor[context.dataIndex],
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
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Occupancy Rate (%)',
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
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
      onComplete: function(animation) {
        console.log('Chart animation completed');
      }
    },
    elements: {
      bar: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 0,
      }
    }
  };

  // Calculate overall statistics
  const totalOccupancy = data.reduce((sum, item) => {
    const occupancy = 100 - ((item.availableRooms / item.initialRooms) * 100);
    return sum + Math.round(occupancy);
  }, 0);
  
  const averageOccupancy = data.length > 0 ? Math.round(totalOccupancy / data.length) : 0;
  const highestOccupancy = data.length > 0 ? Math.max(...data.map(item => 
    100 - ((item.availableRooms / item.initialRooms) * 100)
  )) : 0;
  const lowestOccupancy = data.length > 0 ? Math.min(...data.map(item => 
    100 - ((item.availableRooms / item.initialRooms) * 100)
  )) : 0;

  // Find best and worst performing hostels
  const getBestPerformingHostel = () => {
    if (data.length === 0) return null;
    return data.reduce((best, current) => {
      const currentOccupancy = 100 - ((current.availableRooms / current.initialRooms) * 100);
      const bestOccupancy = 100 - ((best.availableRooms / best.initialRooms) * 100);
      return currentOccupancy > bestOccupancy ? current : best;
    });
  };

  const getWorstPerformingHostel = () => {
    if (data.length === 0) return null;
    return data.reduce((worst, current) => {
      const currentOccupancy = 100 - ((current.availableRooms / current.initialRooms) * 100);
      const worstOccupancy = 100 - ((worst.availableRooms / worst.initialRooms) * 100);
      return currentOccupancy < worstOccupancy ? current : worst;
    });
  };

  const bestHostel = getBestPerformingHostel();
  const worstHostel = getWorstPerformingHostel();

  return (
    <div className="hostelhub-analytics-chart-card">
      <div className="hostelhub-chart-header">
        <div>
          <h3 className="hostelhub-chart-title">Hostel Occupancy Analytics</h3>
          <p className="hostelhub-chart-subtitle">Real-time occupancy rates across your properties</p>
        </div>
        <div className="hostelhub-chart-legend">
          <div className="hostelhub-legend-item">
            <div className="hostelhub-legend-color" style={{ backgroundColor: '#0077cc' }}></div>
            <span>Occupancy Rate</span>
          </div>
        </div>
      </div>
      
      <div className="hostelhub-occupancy-chart">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="hostelhub-chart-stats">
        <div className="hostelhub-stat-item">
          <div className="hostelhub-stat-value">{averageOccupancy}%</div>
          <div className="hostelhub-stat-label">Average Occupancy</div>
          <div className="hostelhub-stat-trend">
            <span className="hostelhub-trend-up">↑</span>
            <span>2.5% from last month</span>
          </div>
        </div>
        <div className="hostelhub-stat-item">
          <div className="hostelhub-stat-value">{Math.round(highestOccupancy)}%</div>
          <div className="hostelhub-stat-label">Highest</div>
          {bestHostel && (
            <div className="hostelhub-stat-detail">
              {bestHostel.name}
            </div>
          )}
        </div>
        <div className="hostelhub-stat-item">
          <div className="hostelhub-stat-value">{Math.round(lowestOccupancy)}%</div>
          <div className="hostelhub-stat-label">Lowest</div>
          {worstHostel && (
            <div className="hostelhub-stat-detail">
              {worstHostel.name}
            </div>
          )}
        </div>
        <div className="hostelhub-stat-item">
          <div className="hostelhub-stat-value">{data.length}</div>
          <div className="hostelhub-stat-label">Total Properties</div>
          <div className="hostelhub-stat-total-rooms">
            {data.reduce((sum, item) => sum + item.initialRooms, 0)} total rooms
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyChart;