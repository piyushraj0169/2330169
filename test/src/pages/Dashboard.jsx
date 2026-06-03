import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { logInfo, logError } from '../utils/logger'

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
  const isMountedRef = useRef(true)

  const requestType = useMemo(() => (selectedFilter === 'All' ? '' : selectedFilter), [selectedFilter])

  const loadNotifications = useCallback(
    async (filterType, pageNumber) => {
      if (!isMountedRef.current) {
        return
      }

      setLoading(true)
      setNotificationError('')
      setPriorityError('')
      setFallbackWarning('')
      void logInfo('page', 'Initial data loading started')
      try {
        const requests = await Promise.allSettled([
          getNotifications(pageNumber, limit, filterType),
          getPriorityNotifications(filterType),
        ])

        if (!isMountedRef.current) {
          return
        }

        const [allResult, priorityResult] = requests
        // Debug: expose results to browser console for runtime inspection
        // eslint-disable-next-line no-console
        console.debug('[Dashboard] allResult:', allResult)
        // eslint-disable-next-line no-console
        console.debug('[Dashboard] priorityResult:', priorityResult)
        let fallbackMessage = ''
        let hasFailure = false

        if (allResult.status === 'fulfilled') {
          const payload = extractNotifications(allResult.value)
          setNotifications(payload.map(normalizeNotification))
          setTotalPages(extractPageCount(allResult.value, limit))
          if (allResult.value?.__fallback) {
            fallbackMessage = allResult.value.__warning || fallbackMessage
          }
        } else {
          hasFailure = true
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
          hasFailure = true
          setPriorityNotifications([])
          setPriorityError(priorityResult.reason?.message || 'Unable to load priority notifications.')
        }

        setFallbackWarning(fallbackMessage)

        // Debug: show computed counts
        // eslint-disable-next-line no-console
        console.debug('[Dashboard] notifications count:', Array.isArray(allResult?.value?.notifications) ? allResult.value.notifications.length : (Array.isArray(allResult?.value) ? allResult.value.length : 0), 'priority count:', Array.isArray(priorityResult?.value?.notifications) ? priorityResult.value.notifications.length : (Array.isArray(priorityResult?.value) ? priorityResult.value.length : 0))

        if (hasFailure) {
          void logError('page', 'Initial data loading failed')
        } else {
          void logInfo('page', 'Initial data loading completed')
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return
        }
        setNotificationError(error?.message || 'Unexpected error loading notifications.')
        void logError('page', `Initial data loading failed with unexpected error: ${error?.message || 'unknown'}`)
      } finally {
        if (isMountedRef.current) {
          // Debug: ensure loading toggles off
          // eslint-disable-next-line no-console
          console.debug('[Dashboard] finalizing load, setting loading=false')
          setLoading(false)
        }
      }
    },
    [limit],
  )

  useEffect(() => {
    void logInfo('page', 'Dashboard mounted')

    return () => {
      isMountedRef.current = false
      void logInfo('page', 'Dashboard unmounted')
    }
  }, [])

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
