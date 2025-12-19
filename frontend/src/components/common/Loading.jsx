import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ text = 'Searching for hostels...', fullPage = false }) => {
  return (
    <div className={`${styles.container} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.loaderWrapper}>
        {/* Animated Gradient Ring */}
        <div className={styles.spinner}></div>
        
        {/* Center Logo or Icon (Optional) */}
        <div className={styles.innerCircle}>
          <div className={styles.dot}></div>
        </div>
      </div>
      
      <div className={styles.textContainer}>
        <p className={styles.loadingText}>{text}</p>
        <div className={styles.shimmerLine}></div>
      </div>
    </div>
  );
};

export default Loading;