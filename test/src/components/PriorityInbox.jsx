import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import NotificationSkeleton from './NotificationSkeleton'
import NotificationCard from './NotificationCard'

export default function PriorityInbox({ notifications, loading, title = 'Priority Inbox' }) {
  return (
    <Paper className="dashboard-card priority-card" elevation={3} component="article" aria-labelledby="priority-inbox-title">
      <Typography id="priority-inbox-title" variant="h6" component="h2" className="card-heading">
        {title}
      </Typography>
      <Box component="section" className="notification-list priority-section" role="list" aria-label="Priority inbox notifications">
        {loading ? (
          <NotificationSkeleton count={3} />
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} {...notification} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No priority notifications found.
          </Typography>
        )}
      </Box>
    </Paper>
  )
}
