// src/components/analytics/OccupancyChart.jsx
import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaBuilding, FaBed, FaCheckCircle, FaExclamationTriangle, FaChartPie, FaExternalLinkAlt } from 'react-icons/fa';
import styles from './OccupancyChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

const OccupancyChart = ({ data = [] }) => {
  // Logic for color generation based on occupancy intensity
  const chartDatasets = useMemo(() => {
    const scores = data.map(item => Math.round(100 - ((item.availableRooms / item.initialRooms) * 100)));
    
    return {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Occupancy Rate',
        data: scores,
        backgroundColor: scores.map(s => s > 80 ? 'rgba(0, 229, 255, 0.8)' : s > 50 ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 59, 48, 0.4)'),
        borderColor: scores.map(s => s > 80 ? '#00e5ff' : s > 50 ? 'rgba(0, 229, 255, 0.6)' : '#ff3b30'),
        borderWidth: 2,
        borderRadius: 12,
        hoverBackgroundColor: '#00e5ff',
        barPercentage: 0.6,
      }]
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d23',
        padding: 15,
        cornerRadius: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` Occupancy: ${ctx.parsed.y}%`,
          afterLabel: (ctx) => {
            const h = data[ctx.dataIndex];
            return ` Rooms: ${h.initialRooms - h.availableRooms}/${h.initialRooms}`;
          }
        }
      }
    },
    scales: {
      y: { 
        max: 100, 
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#64748b', callback: (v) => v + '%' }
      },
      x: { grid: { display: false }, ticks: { color: '#fff' } }
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    if (!data.length) return { avg: 0, total: 0, occ: 0 };
    const totalRooms = data.reduce((s, i) => s + i.initialRooms, 0);
    const totalAvail = data.reduce((s, i) => s + i.availableRooms, 0);
    const occ = totalRooms - totalAvail;
    return {
      avg: Math.round((occ / totalRooms) * 100),
      total: totalRooms,
      occupied: occ,
      available: totalAvail
    };
  }, [data]);

  return (
    <div className={styles.container}>
      {/* HEADER SECTION */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <div className={styles.iconCircle}><FaBuilding /></div>
          <div>
            <h3 className={styles.mainTitle}>Occupancy Dashboard</h3>
            <p className={styles.subtitle}>Across {data.length} active properties</p>
          </div>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn}>Export PDF</button>
          <button className={styles.primaryBtn}>Manage Rooms</button>
        </div>
      </div>

      {/* TOP METRICS ROW */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>AVG. OCCUPANCY</span>
          <div className={styles.statValue}>{stats.avg}%</div>
          <div className={styles.progressTrack}><div className={styles.progressBar} style={{width: `${stats.avg}%`}}></div></div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>TOTAL ROOMS</span>
          <div className={styles.statValue}>{stats.total}</div>
          <span className={styles.statSub}>Across portfolio</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>AVAILABLE</span>
          <div className={styles.statValue} style={{color: '#4cd964'}}>{stats.available}</div>
          <span className={styles.statSub}>Ready to book</span>
        </div>
      </div>

      {/* MAIN CHART AREA */}
      <div className={styles.chartArea}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTag}>DISTRIBUTION BY PROPERTY</span>
          <div className={styles.legend}>
            <span className={styles.legItem}><i className={styles.dotHigh}></i> High</span>
            <span className={styles.legItem}><i className={styles.dotMid}></i> Mid</span>
            <span className={styles.legItem}><i className={styles.dotLow}></i> Low</span>
          </div>
        </div>
        <div className={styles.canvasWrapper}>
          <Bar data={chartDatasets} options={options} />
        </div>
      </div>

      {/* INSIGHTS FOOTER */}
      <div className={styles.insights}>
        <div className={styles.insightItem}>
          <FaCheckCircle className={styles.checkIcon} />
          <p><strong>Capacity Alert:</strong> 3 properties are at 100% occupancy.</p>
        </div>
        <div className={styles.insightItem}>
          <FaExclamationTriangle className={styles.warnIcon} />
          <p>Performance dip detected in North Wing properties.</p>
        </div>
      </div>
    </div>
  );
};

export default OccupancyChart;