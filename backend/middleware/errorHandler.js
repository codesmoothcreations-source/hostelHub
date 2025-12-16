import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?._id || 'anonymous'
  });
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = `Validation Error: ${errors.join('. ')}`;
    err.statusCode = 400;
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `Duplicate field value: ${field}. Please use another value`;
    err.statusCode = 400;
  }
  
  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    err.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again';
    err.statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    err.message = 'Your token has expired. Please log in again';
    err.statusCode = 401;
  }
  
  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production error response
  else {
    res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

export default errorHandler;