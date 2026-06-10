import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#f8fafc' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>Something went wrong.</h2>
          <p style={{ maxWidth: '600px', color: '#94a3b8', marginBottom: '2rem' }}>
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
