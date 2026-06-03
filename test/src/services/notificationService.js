import axios from 'axios'

const API_BASE_URL = 'http://4.224.186.213/evaluation-service/notifications'
const API_AUTH_TOKEN = import.meta.env.VITE_NOTIFICATION_API_TOKEN || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(API_AUTH_TOKEN ? { Authorization: `Bearer ${API_AUTH_TOKEN}` } : {}),
  },
})

const FALLBACK_NOTIFICATIONS = [
  {
    id: 'fallback-1',
    notification_type: 'Placement',
    message: 'Mock placement update: on-campus session starts at 10 AM.',
    timestamp: '2026-06-03T10:00:00Z',
  },
  {
    id: 'fallback-2',
    notification_type: 'Result',
    message: 'Mock result published: your application status has changed.',
    timestamp: '2026-06-03T08:15:00Z',
  },
  {
    id: 'fallback-3',
    notification_type: 'Event',
    message: 'Mock event notice: career fair begins in the student center.',
    timestamp: '2026-06-02T14:30:00Z',
  },
  {
    id: 'fallback-4',
    notification_type: 'Event',
    message: 'Mock event reminder: networking workshop registration closes tonight.',
    timestamp: '2026-06-02T08:00:00Z',
  },
]

function buildQueryParams(page, limit, type) {
  const params = {}

  if (page != null) {
    params.page = page
  }

  if (limit != null) {
    params.limit = limit
  }

  if (type) {
    params.notification_type = type
  }

  return params
}

function convertAxiosError(error) {
  return error?.response?.data?.message || error.message || 'Failed to fetch notifications.'
}

function buildFallbackResponse(type, limit) {
  const items = FALLBACK_NOTIFICATIONS.filter((notification) => {
    return type ? notification.notification_type === type : true
  })

  return {
    notifications: items.slice(0, limit),
    meta: {
      total: items.length,
      total_pages: Math.max(1, Math.ceil(items.length / limit)),
    },
    __fallback: true,
    __warning: 'Notification API request failed; displaying sample notifications instead.',
  }
}

/**
 * Fetch notifications from the API with optional paging and type filtering.
 * Falls back to mock data when the API requires authorization.
 */
export async function getNotifications(page = 1, limit = 10, type = '') {
  try {
    const response = await apiClient.get('', {
      params: buildQueryParams(page, limit, type),
    })

    return response.data
  } catch (error) {
    const status = error?.response?.status
    if (status === 401) {
      return buildFallbackResponse(type, limit)
    }
    throw new Error(`Notification fetch error: ${convertAxiosError(error)}`, {
      cause: error,
    })
  }
}

/**
 * Fetch the top priority notifications for the dashboard.
 * Uses mock data when the API returns authorization errors.
 */
export async function getPriorityNotifications(type = '') {
  try {
    const response = await apiClient.get('', {
      params: buildQueryParams(1, 10, type),
    })

    return response.data
  } catch (error) {
    const status = error?.response?.status
    if (status === 401) {
      return buildFallbackResponse(type, 10)
    }
    throw new Error(`Priority notification fetch error: ${convertAxiosError(error)}`, {
      cause: error,
    })
  }
}
