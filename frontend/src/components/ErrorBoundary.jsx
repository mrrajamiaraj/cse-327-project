import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorContainer}>
          <div style={errorCard}>
            <div style={errorIcon}>⚠️</div>
            <div style={errorTitle}>Something went wrong</div>
            <div style={errorMessage}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </div>
            <div style={errorActions}>
              <button 
                onClick={() => window.location.reload()} 
                style={refreshButton}
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.history.back()} 
                style={backButton}
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre style={errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* Styles */
const errorContainer = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const errorCard = {
  background: "#fff",
  borderRadius: 16,
  padding: 32,
  maxWidth: 400,
  width: "100%",
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
};

const errorIcon = {
  fontSize: "3rem",
  marginBottom: 16
};

const errorTitle = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 12
};

const errorMessage = {
  fontSize: "0.9rem",
  color: "#666",
  lineHeight: 1.5,
  marginBottom: 24
};

const errorActions = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  marginBottom: 20
};

const refreshButton = {
  padding: "12px 24px",
  background: "#ff7a00",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const backButton = {
  padding: "12px 24px",
  background: "transparent",
  color: "#666",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const errorDetails = {
  textAlign: "left",
  marginTop: 20,
  padding: 16,
  background: "#f8f9fa",
  borderRadius: 8,
  fontSize: "0.7rem"
};

const errorStack = {
  whiteSpace: "pre-wrap",
  fontSize: "0.7rem",
  color: "#666",
  maxHeight: 200,
  overflow: "auto"
};

export default ErrorBoundary;