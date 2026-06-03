import authService from '../services/authService'

const LOG_ENDPOINT = 'http://4.224.186.213/evaluation-service/logs'
const ALLOWED_STACKS = new Set(['frontend'])
const ALLOWED_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal'])
const ALLOWED_PACKAGES = new Set([
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
])

function validateLogPayload(stack, level, packageName, message) {
  if (!ALLOWED_STACKS.has(stack)) {
    console.warn('[Affordmed Logger] Invalid stack value:', stack)
    return false
  }

  if (!ALLOWED_LEVELS.has(level)) {
    console.warn('[Affordmed Logger] Invalid level value:', level)
    return false
  }

  if (!ALLOWED_PACKAGES.has(packageName)) {
    console.warn('[Affordmed Logger] Invalid package value:', packageName)
    return false
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    console.warn('[Affordmed Logger] Invalid message value:', message)
    return false
  }

  return true
}

async function Log(stack, level, packageName, message) {
  try {
    if (!validateLogPayload(stack, level, packageName, message)) {
      return false
    }

    const token = await authService.getAccessToken().catch((error) => {
      console.warn('[Affordmed Logger] Unable to obtain auth token.', error)
      return null
    })

    const headers = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message,
      }),
      keepalive: true,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.warn('[Affordmed Logger] Log request failed:', response.status, response.statusText, body)
      return false
    }

    return true
  } catch (error) {
    console.warn('[Affordmed Logger] Unexpected logging error:', error)
    return false
  }
}

async function logDebug(packageName, message) {
  return Log('frontend', 'debug', packageName, message)
}

async function logInfo(packageName, message) {
  return Log('frontend', 'info', packageName, message)
}

async function logWarn(packageName, message) {
  return Log('frontend', 'warn', packageName, message)
}

async function logError(packageName, message) {
  return Log('frontend', 'error', packageName, message)
}

async function logFatal(packageName, message) {
  return Log('frontend', 'fatal', packageName, message)
}

export { Log, logDebug, logInfo, logWarn, logError, logFatal }
