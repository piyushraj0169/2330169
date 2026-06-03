import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

export default function NotificationSkeleton({ count = 3 }) {
  return (
    <div className="notification-list" role="status" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <Card className="notification-skeleton" elevation={0} key={`notification-skeleton-${index}`}>
          <CardContent>
            <div className="notification-skeleton-row">
              <Skeleton variant="rounded" width={96} height={24} />
              <Skeleton variant="rounded" width={80} height={20} />
            </div>
            <Skeleton variant="rounded" width="100%" height={56} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
