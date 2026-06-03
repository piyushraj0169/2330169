import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Header component uses Material UI AppBar and Toolbar for a polished top navigation.
export default function Header() {
  return (
    <AppBar position="static" className="app-bar" component="header" role="banner">
      <Toolbar className="toolbar">
        <Box className="brand" aria-label="Campus notification dashboard logo and title">
          <Typography variant="h6" component="p" className="brand-title">
            Campus Notifications
          </Typography>
          <Typography variant="body2" component="p" className="brand-subtitle">
            Real-time alerts and campus updates in one dashboard.
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
