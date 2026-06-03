import { logInfo } from './logger'

const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1,
}

const DEFAULT_NOTIFICATION_TYPE = 'Event'
const DEFAULT_NOTIFICATION_MESSAGE = 'No message provided.'

export function extractNotifications(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload?.notifications && Array.isArray(payload.notifications)) {
    return payload.notifications
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items
  }

  return []
}

export function extractPageCount(payload, limit) {
  const pagination = payload?.meta || payload?.pagination || {}
  const totalPages = pagination.total_pages || pagination.totalPages || pagination.pages

  if (typeof totalPages === 'number') {
    return totalPages
  }

  const totalCount = pagination.total || pagination.total_count || pagination.count
  if (typeof totalCount === 'number') {
    if (totalCount === 0 || limit <= 0) {
      return 0
    }
    return Math.max(1, Math.ceil(totalCount / limit))
  }

  return 0
}

export function normalizeNotification(notification) {
  const type = notification.notification_type || notification.type || DEFAULT_NOTIFICATION_TYPE
  const message = notification.message || notification.description || DEFAULT_NOTIFICATION_MESSAGE
  const timestamp = notification.timestamp || notification.created_at || notification.date || ''

  return {
    id: notification.id ?? notification._id ?? `${type}-${timestamp}`,
    type,
    message,
    timestamp,
  }
}

function parseNotificationTimestamp(notification) {
  const parsed = Date.parse(notification.timestamp)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function getTopPriorityNotifications(notifications = []) {
  void logInfo('utils', 'Priority calculation started')

  if (!Array.isArray(notifications) || notifications.length === 0) {
    void logInfo('utils', 'Top 10 notifications generated')
    return []
  }

  const normalizedNotifications = notifications.reduce((accumulator, notification) => {
    const notificationId = notification.id || `${notification.type}-${notification.timestamp}`
    const existing = accumulator.get(notificationId)

    if (!existing) {
      accumulator.set(notificationId, notification)
      return accumulator
    }

    const existingTimestamp = parseNotificationTimestamp(existing)
    const currentTimestamp = parseNotificationTimestamp(notification)

    if (currentTimestamp > existingTimestamp) {
      accumulator.set(notificationId, notification)
    }

    return accumulator
  }, new Map())

  const result = Array.from(normalizedNotifications.values())
    .sort((left, right) => {
      const leftRank = PRIORITY_ORDER[left.type] || 0
      const rightRank = PRIORITY_ORDER[right.type] || 0

      if (leftRank !== rightRank) {
        return rightRank - leftRank
      }

      return parseNotificationTimestamp(right) - parseNotificationTimestamp(left)
    })
    .slice(0, 10)

  void logInfo('utils', 'Top 10 notifications generated')
  return result
}

/**
 * Example usage:
 *
 * const notifications = [
 *   { id: '1', type: 'Result', timestamp: '2026-06-03T12:00:00Z' },
 *   { id: '2', type: 'Placement', timestamp: '2026-06-03T10:00:00Z' },
 *   { id: '3', type: 'Event', timestamp: '2026-06-03T15:00:00Z' },
 *   { id: '4', type: 'Placement', timestamp: '2026-06-03T11:00:00Z' },
 *   { id: '2', type: 'Placement', timestamp: '2026-06-03T10:00:00Z' },
 * ]
 *
 * getTopPriorityNotifications(notifications)
 * // Expected output order:
 * // 1. id '4' (Placement, 11:00)
 * // 2. id '2' (Placement, 10:00) - duplicate id preserved once
 * // 3. id '1' (Result, 12:00)
 * // 4. id '3' (Event, 15:00)
 */
