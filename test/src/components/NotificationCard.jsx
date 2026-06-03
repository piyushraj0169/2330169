import { memo, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const CHIP_COLOR_BY_TYPE = {
  Placement: 'success',
  Result: 'warning',
  Event: 'info',
}

const DEFAULT_NOTIFICATION_TYPE = 'Event'

function formatTimestamp(timestamp) {
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.valueOf())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function NotificationCard({ type = DEFAULT_NOTIFICATION_TYPE, message = 'No message provided.', timestamp = '' }) {
  const normalizedType = type || DEFAULT_NOTIFICATION_TYPE
  const timestampValue = useMemo(() => formatTimestamp(timestamp), [timestamp])
  const chipColor = CHIP_COLOR_BY_TYPE[normalizedType] || 'default'
  const dateTime = useMemo(() => {
    const parsed = new Date(timestamp)
    return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString()
  }, [timestamp])

  return (
    <Card className="notification-card" elevation={2} component="article" role="listitem">
      <CardContent>
        <div className="notification-card-header">
          <Chip
            label={normalizedType}
            color={chipColor}
            size="small"
            className="notification-chip"
            aria-label={`Notification type ${normalizedType}`}
          />
          <Typography component="time" dateTime={dateTime} variant="caption" color="text.secondary">
            {timestampValue}
          </Typography>
        </div>
        <Typography variant="body1" component="p" className="notification-message">
          {message}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default memo(NotificationCard)
