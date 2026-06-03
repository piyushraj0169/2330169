import { useCallback, useEffect, useMemo, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import NotificationCard from '../components/NotificationCard'
import FilterBar from '../components/FilterBar'
import PaginationControls from '../components/PaginationControls'
import NotificationSkeleton from '../components/NotificationSkeleton'
import PriorityInbox from '../components/PriorityInbox'
import EmptyState from '../components/EmptyState'
import { getNotifications, getPriorityNotifications } from '../services/notificationService'
import {
  extractNotifications,
  extractPageCount,
  getTopPriorityNotifications,
  normalizeNotification,
} from '../utils/notificationUtils'

export default function Dashboard() {
  const [notifications, setNotifications] = useState([])
  const [priorityNotifications, setPriorityNotifications] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notificationError, setNotificationError] = useState('')
  const [priorityError, setPriorityError] = useState('')
  const [fallbackWarning, setFallbackWarning] = useState('')

  const requestType = useMemo(() => (selectedFilter === 'All' ? '' : selectedFilter), [selectedFilter])

  const loadNotifications = useCallback(
    async (filterType, pageNumber) => {
      setLoading(true)
      setNotificationError('')
      setPriorityError('')
      setFallbackWarning('')

      const requests = await Promise.allSettled([
        getNotifications(pageNumber, limit, filterType),
        getPriorityNotifications(filterType),
      ])

      const [allResult, priorityResult] = requests
      let fallbackMessage = ''

      if (allResult.status === 'fulfilled') {
        const payload = extractNotifications(allResult.value)
        setNotifications(payload.map(normalizeNotification))
        setTotalPages(extractPageCount(allResult.value, limit))
        if (allResult.value?.__fallback) {
          fallbackMessage = allResult.value.__warning || fallbackMessage
        }
      } else {
        setNotifications([])
        setTotalPages(0)
        setNotificationError(allResult.reason?.message || 'Unable to load paginated notifications.')
      }

      if (priorityResult.status === 'fulfilled') {
        const payload = extractNotifications(priorityResult.value).map(normalizeNotification)
        setPriorityNotifications(getTopPriorityNotifications(payload))
        if (priorityResult.value?.__fallback) {
          fallbackMessage = fallbackMessage || priorityResult.value.__warning
        }
      } else {
        setPriorityNotifications([])
        setPriorityError(priorityResult.reason?.message || 'Unable to load priority notifications.')
      }

      setFallbackWarning(fallbackMessage)
      setLoading(false)
    },
    [limit],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotifications(requestType, page)
  }, [loadNotifications, requestType, page])

  const hasNotifications = notifications.length > 0
  const hasPriorityItems = priorityNotifications.length > 0

  const handleFilterChange = useCallback((event) => {
    setSelectedFilter(event.target.value)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((_, nextPage) => {
    setPage(nextPage)
  }, [])

  return (
    <Container maxWidth="lg" component="main" className="dashboard-container">
      <Box className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Campus Notifications
        </Typography>
        <Typography variant="subtitle1" component="p" className="page-description">
          Filter notifications, browse pages, and monitor the highest-priority inbox in real time.
        </Typography>
      </Box>

      <FilterBar selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />


      {!loading && notificationError && (
        <Alert severity="error" className="alert-message">
          {notificationError}
        </Alert>
      )}

      {!loading && priorityError && (
        <Alert severity="warning" className="alert-message">
          {priorityError}
        </Alert>
      )}

      {!loading && fallbackWarning && (
        <Alert severity="warning" className="alert-message">
          {fallbackWarning}
        </Alert>
      )}

      <Grid container spacing={3} component="section" aria-label="Notification dashboard sections">
        <Grid item xs={12} md={5}>
          <PriorityInbox notifications={priorityNotifications} loading={loading} />
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper className="dashboard-card all-card" elevation={3} component="article" aria-labelledby="all-title">
            <Typography id="all-title" variant="h6" component="h2" className="card-heading">
              All Notifications
            </Typography>
            <Box component="section" className="notification-list all-section" role="list" aria-label="All notifications">
              {loading ? (
                <NotificationSkeleton count={4} />
              ) : hasNotifications ? (
                notifications.map((notification) => (
                  <NotificationCard key={notification.id} {...notification} />
                ))
              ) : (
                <EmptyState
                  icon="📭"
                  heading="No notifications found"
                  description="Try changing the selected filter."
                  buttonLabel={selectedFilter !== 'All' ? 'Reset filter' : ''}
                  onButtonClick={
                    selectedFilter !== 'All'
                      ? () => {
                          setSelectedFilter('All')
                          setPage(1)
                        }
                      : undefined
                  }
                />
              )}
            </Box>
            {!loading && (
              <PaginationControls
                page={page}
                count={totalPages}
                pageSize={limit}
                onPageChange={handlePageChange}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
