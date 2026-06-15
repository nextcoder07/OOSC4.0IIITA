import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    // Clear the retry flag on successful load
    sessionStorage.removeItem('chunk_failed_reload');
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // Automatically reload once for chunk load errors (happens when a new version is deployed)
    const isChunkLoadError = error.name === 'ChunkLoadError' || 
                             (error.message && (
                               error.message.includes('dynamically imported module') || 
                               error.message.includes('Failed to fetch') ||
                               error.message.includes('Loading chunk')
                             ));
                             
    if (isChunkLoadError) {
      if (!sessionStorage.getItem('chunk_failed_reload')) {
        sessionStorage.setItem('chunk_failed_reload', 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text-on-dark)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-error)' }}>Something went wrong.</h2>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted-strong)', marginBottom: '2rem' }}>
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '0.75rem 1.5rem', background: 'var(--color-brand-blue-strong)', color: 'var(--color-text-snow)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
