import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../api/reviews'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const ReviewPage = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  
  // Fetch reviews on component mount and page change
  useEffect(() => {
    fetchReviews();
  }, [currentPage, hostelId]);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getHostelReviews(hostelId, {
        page: currentPage,
        limit: 10,
      });
      
      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.pages);
        setTotalReviews(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await reviewsAPI.createReview({
        hostelId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      
      if (response.success) {
        toast.success('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews(); // Refresh reviews list
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRatingClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };
  
  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => handleRatingClick(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            disabled={!interactive && submitting}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {renderStars(parseFloat(calculateAverageRating()))}
              <span className="ml-2 text-2xl font-bold text-gray-900">
                {calculateAverageRating()}
              </span>
              <span className="ml-1 text-gray-600">/5</span>
            </div>
            <span className="ml-4 text-gray-600">• {totalReviews} reviews</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
              
              <form onSubmit={handleSubmitReview}>
                {/* Rating Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-3">
                    Your Rating
                  </label>
                  <div className="mb-2">
                    {renderStars(reviewForm.rating, true)}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
                
                {/* Comment Textarea */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this hostel..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                    required
                    maxLength={500}
                    disabled={submitting}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewForm.comment.length}/500 characters
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                    submitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Review'}
                </button>
                
                {/* Requirements Note */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>✓ You must have booked and stayed at this hostel</p>
                  <p>✓ You can only submit one review per hostel</p>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2">
            {loading ? (
              // Loading Skeleton
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600">Be the first to share your experience!</p>
              </div>
            ) : (
              // Reviews List
              <>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {review.user.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {review.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                            <div className="flex items-center mt-1">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;