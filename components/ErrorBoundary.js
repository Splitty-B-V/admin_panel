import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Special handling for Sendbird errors
    if (error?.message?.includes('no ack') || error?.message?.includes('SendBird')) {
      console.log('Sendbird connection error detected, attempting recovery...')
      
      // Try to disconnect any existing connections
      if (window.sb) {
        try {
          window.sb.disconnect()
        } catch (e) {
          console.log('Could not disconnect:', e)
        }
      }
      
      // Reset error state after a delay to allow retry
      setTimeout(() => {
        this.setState({ hasError: false, error: null })
      }, 3000)
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for Sendbird errors
      if (this.state.error?.message?.includes('SendBird') || this.state.error?.message?.includes('no ack')) {
        return (
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Verbinding herstellen...</p>
            </div>
          </div>
        )
      }
      
      // Generic error fallback
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Er is iets misgegaan</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary