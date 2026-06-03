import { Component } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { logError } from '../utils/logger'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    }
  }

  componentDidCatch(error, errorInfo) {
    const errorMessage = `${error?.message || String(error)}${errorInfo?.componentStack ? ` | Component stack: ${errorInfo.componentStack}` : ''}`
    void logError('component', errorMessage)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box className="error-boundary" role="alert" aria-live="assertive" sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body1" paragraph>
            The notification dashboard encountered an unexpected problem. Refresh the page to try again.
          </Typography>
          <Button variant="contained" color="primary" onClick={this.handleReload}>
            Reload page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
