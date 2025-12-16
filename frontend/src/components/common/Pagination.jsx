// src/components/common/Pagination.jsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Calculate which page numbers to show
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

  if (totalPages <= 1) return null;

  return (
    <div className="hostelhub-pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="hostelhub-pagination-button hostelhub-pagination-prev"
      >
        <FaChevronLeft />
        Previous
      </button>
      
      <div className="hostelhub-page-numbers">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`hostelhub-page-button ${1 === currentPage ? 'hostelhub-page-active' : ''}`}
            >
              1
            </button>
            {startPage > 2 && <span className="hostelhub-page-ellipsis">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`hostelhub-page-button ${number === currentPage ? 'hostelhub-page-active' : ''}`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="hostelhub-page-ellipsis">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`hostelhub-page-button ${totalPages === currentPage ? 'hostelhub-page-active' : ''}`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="hostelhub-pagination-button hostelhub-pagination-next"
      >
        Next
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;