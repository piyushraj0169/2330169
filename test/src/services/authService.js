const AUTH_ENDPOINT = 'http://4.224.186.213/evaluation-service/auth'
const SESSION_KEY = 'affordmed_access_token_data'

const authPayload = {
  email: import.meta.env.VITE_AFFORDMED_EMAIL || '',
  name: import.meta.env.VITE_AFFORDMED_NAME || '',
  rollNo: import.meta.env.VITE_AFFORDMED_ROLLNO || '',
  accessCode: import.meta.env.VITE_AFFORDMED_ACCESSCODE || '',
  clientID: import.meta.env.VITE_AFFORDMED_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_AFFORDMED_CLIENT_SECRET || '',
}

let tokenCache = null

function getSessionData() {
  if (tokenCache) {
    return tokenCache
  }

  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    if (parsed?.token) {
      tokenCache = parsed
      return tokenCache
    }
  } catch {
    return null
  }

  return null
}

function saveSessionData(token, expiresAt) {
  tokenCache = { token, expiresAt }

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(tokenCache))
  } catch {
    // If sessionStorage is unavailable, keep the token in memory only.
  }
}

function clearSessionData() {
  tokenCache = null

  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // no-op
  }
}

function getTokenExpiration(responseData) {
  const expiresIn = Number(responseData?.expiresIn ?? responseData?.expires_in ?? responseData?.ttl ?? 900)
  if (Number.isNaN(expiresIn) || expiresIn <= 0) {
    return Date.now() + 15 * 60 * 1000
  }
  return Date.now() + expiresIn * 1000
}

function hasAuthConfig() {
  return Object.values(authPayload).every((value) => typeof value === 'string' && value.trim().length > 0)
}

async function requestAuthToken() {
  if (!hasAuthConfig()) {
    throw new Error('Affordmed auth configuration is missing. Please set the required VITE_* environment variables.')
  }

  const response = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authPayload),
  })

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    throw new Error(`Affordmed auth failed: ${response.status} ${response.statusText} ${bodyText}`)
  }

  const data = await response.json()
  const token = data?.accessToken || data?.token || data?.bearerToken || data?.data?.accessToken || data?.data?.token

  if (!token || typeof token !== 'string') {
    throw new Error('Affordmed auth endpoint returned an invalid token payload.')
  }

  const expiresAt = getTokenExpiration(data)
  saveSessionData(token, expiresAt)

  return token
}

function isTokenValid(tokenData) {
  return Boolean(tokenData?.token) && Number(tokenData?.expiresAt) > Date.now()
}

async function getAccessToken() {
  const stored = getSessionData()
  if (isTokenValid(stored)) {
    return stored.token
  }

  return requestAuthToken()
}

async function refreshAccessToken() {
  clearSessionData()
  return requestAuthToken()
}

export default {
  getAccessToken,
  refreshAccessToken,
  clearSessionData,
}
