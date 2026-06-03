import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function EmptyState({
  icon = '📭',
  heading,
  description,
  buttonLabel,
  onButtonClick,
}) {
  return (
    <Box className="empty-state" role="status" aria-live="polite">
      <Box className="empty-state-icon" aria-hidden="true">
        {icon}
      </Box>
      <Typography variant="h6" component="h2" className="empty-state-heading">
        {heading}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="empty-state-description">
        {description}
      </Typography>
      {buttonLabel && onButtonClick && (
        <Button variant="contained" color="primary" onClick={onButtonClick} className="empty-state-button">
          {buttonLabel}
        </Button>
      )}
    </Box>
  )
}
