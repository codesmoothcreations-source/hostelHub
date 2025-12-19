import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }

  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className={styles.paginationWrapper} aria-label="Pagination">
      <div className={styles.paginationContainer}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.navButton}
        >
          <FaChevronLeft />
          <span>Prev</span>
        </button>

        {/* Page Numbers */}
        <div className={styles.numberGroup}>
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={styles.pageButton}
              >
                1
              </button>
              {startPage > 2 && <span className={styles.ellipsis}>...</span>}
            </>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`${styles.pageButton} ${number === currentPage ? styles.active : ''}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className={styles.pageButton}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.navButton}
        >
          <span>Next</span>
          <FaChevronRight />
        </button>
      </div>
      
      {/* Mobile Page Indicator */}
      <div className={styles.mobileIndicator}>
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;