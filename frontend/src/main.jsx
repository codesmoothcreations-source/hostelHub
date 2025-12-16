// src/main.jsx - IMPROVED ERROR HANDLING
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import './index.css';

// Disable Sentry errors if they're causing issues
if (window.location.hostname === 'localhost') {
  // Disable console errors for local development
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out specific errors
    const errorMessage = args[0]?.message || args[0] || '';
    if (errorMessage.includes('Sentry') || errorMessage.includes('sentry')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const errorHandler = (event) => {
      console.log('Global error caught:', event.error || event.reason);
      setError(event.error || event.reason);
      setHasError(true);
      
      // Prevent default error handling for certain errors
      if (event.error?.message?.includes('toast is not defined')) {
        event.preventDefault();
        console.log('Toast error suppressed, reloading page...');
        setTimeout(() => window.location.reload(), 1000);
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '100px auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
          Something went wrong
        </h1>
        <p style={{ marginBottom: '20px', color: '#6c757d' }}>
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);