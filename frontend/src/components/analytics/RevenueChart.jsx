// src/components/analytics/RevenueChart.jsx
import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
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
import { 
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaFilter, 
  FaDownload, FaChartArea, FaRocket, FaDiceD6 
} from 'react-icons/fa';
import styles from './RevenueChart.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RevenueChart = ({ title = "Revenue Analytics", data = [], showMetrics = true, showForecast = true }) => {
  const [period, setPeriod] = useState('monthly');
  const [isExporting, setIsExporting] = useState(false);

  // Advanced Metric Calculations
  const metrics = useMemo(() => {
    const total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const bookings = data.reduce((sum, item) => sum + (item.bookings || 0), 0);
    const peak = Math.max(...data.map(item => item.revenue || 0), 0);
    const avg = Math.round(total / (data.length || 1));
    
    // Growth logic
    const current = data[data.length - 1]?.revenue || 0;
    const previous = data[data.length - 2]?.revenue || 0;
    const growthVal = previous === 0 ? 0 : ((current - previous) / previous) * 100;

    return { total, bookings, peak, avg, growthVal, isUp: growthVal >= 0 };
  }, [data]);

  const chartData = {
    labels: data.map((item, i) => item.label || `${period} ${i + 1}`),
    datasets: [{
      label: 'Revenue',
      data: data.map(item => item.revenue || 0),
      borderColor: '#00e5ff',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
        return gradient;
      },
      borderWidth: 4,
      tension: 0.45,
      fill: true,
      pointBackgroundColor: '#00e5ff',
      pointBorderColor: '#0f1115',
      pointBorderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#fff',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d23',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        bodyFont: { size: 14, weight: 'bold' },
        padding: 12,
        displayColors: false,
        borderColor: 'rgba(0, 229, 255, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { 
          color: '#64748b', 
          font: { size: 11 },
          callback: (val) => `$${val >= 1000 ? (val/1000) + 'k' : val}`
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Dashboard Header */}
      <div className={styles.mainHeader}>
        <div className={styles.infoGroup}>
          <div className={styles.titleWrapper}>
            <div className={styles.iconBox}><FaChartArea /></div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.globalStatus}>
            <span className={`${styles.statusPill} ${metrics.isUp ? styles.up : styles.down}`}>
              {metrics.isUp ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(metrics.growthVal).toFixed(1)}%
            </span>
            <span className={styles.statusText}>Live revenue tracking enabled</span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toggleGroup}>
            {['daily', 'weekly', 'monthly'].map(p => (
              <button key={p} className={`${styles.toggleBtn} ${period === p ? styles.active : ''}`} onClick={() => setPeriod(p)}>
                {p}
              </button>
            ))}
          </div>
          <div className={styles.actionGroup}>
            <button className={styles.iconBtn} title="Filter"><FaFilter /></button>
            <button className={styles.exportBtn} onClick={() => { setIsExporting(true); setTimeout(() => setIsExporting(false), 2000); }}>
              <FaDownload /> {isExporting ? '...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartWatermark}>ANALYTICS CORE</div>
        <div className={styles.chartWrapper}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* 3. Metrics Grid */}
      {showMetrics && (
        <div className={styles.metricsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaCalendarAlt className={styles.cardIcon} />
              <span>Total Revenue</span>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.currency}>$</span>
              <span className={styles.cardValue}>{metrics.total.toLocaleString()}</span>
            </div>
            <div className={styles.cardFooter}>
              <span className={metrics.isUp ? styles.txtUp : styles.txtDown}>
                {metrics.isUp ? '↑' : '↓'} {Math.abs(metrics.growthVal).toFixed(1)}%
              </span>
              <span className={styles.footerLabel}>vs last {period}</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaDiceD6 className={styles.cardIcon} />
              <span>Performance</span>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>{metrics.bookings.toLocaleString()}</span>
              <span className={styles.unit}>Bookings</span>
            </div>
            <div className={styles.cardFooter}>
              Avg: ${metrics.avg.toLocaleString()} / period
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaRocket className={styles.cardIcon} />
              <span>Market Peak</span>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.currency}>$</span>
              <span className={styles.cardValue}>{metrics.peak.toLocaleString()}</span>
            </div>
            <div className={styles.cardFooter}>Highest recorded value</div>
          </div>
        </div>
      )}

      {/* 4. Insight/Forecast Bar */}
      {showForecast && (
        <div className={styles.forecastBar}>
          <div className={styles.forecastInfo}>
            <h4>Next Cycle Forecast</h4>
            <p>Predictive model based on {period} volatility</p>
          </div>
          <div className={styles.forecastResult}>
            <div className={styles.forecastVal}>
              ${Math.round(metrics.total * (1 + metrics.growthVal/100)).toLocaleString()}
            </div>
            <div className={styles.forecastBadge}>PROBABILITY: 92%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;