const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Core API request helper
 */
async function apiRequest(endpoint, options = {}) {
  const session = localStorage.getItem('admin_session')
  let token = null

  if (session) {
    try {
      const parsed = JSON.parse(session)
      token = parsed?.token || parsed?.data?.token || null
      if (!token && parsed?.admin && parsed?.token) token = parsed.token
      if (!token && parsed?.data?.admin && parsed?.data?.token) token = parsed.data.token
    } catch (err) {
      token = null
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? options.body : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.error('API ERROR:', data)

    if (response.status === 401) {
      localStorage.removeItem('admin_session')
      // optional: page reload to force login
      // window.location.href = '/admin/login'
      throw new Error(data?.error || 'Unauthorized')
    }

    throw new Error(data?.message || `API Error: ${response.status}`)
  }

  return data
}

//
// ================= AUTH =================
//
export async function adminLogin(credentials) {
  const res = await apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  const token = res?.data?.token
  const admin = res?.data?.admin
  const session = token ? { ...admin, token } : null

  if (session) {
    localStorage.setItem('admin_session', JSON.stringify(session))
  }

  return session
}

//
// ================= BOOKINGS =================
//
export async function getBookings() {
  const res = await apiRequest('/bookings')
  // Handle paginated response { success, data: [...], pagination: {...} }
  const bookings = res?.data || []
  return Array.isArray(bookings) ? bookings : []
}

export async function createBooking(bookingData) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  })
}

//
// ================= VEHICLES =================
//
export async function getVehicles() {
  const res = await apiRequest('/vehicles')
  const vehicles = res?.data || res || []
  return Array.isArray(vehicles) ? vehicles : []
}

export async function addVehicle(vehicleData) {
  const res = await apiRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  })
  return res?.data?.vehicle || null
}

export async function updateVehicle(id, vehicleData) {
  const res = await apiRequest(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData),
  })
  return res?.data?.vehicle || null
}

export async function deleteVehicle(id) {
  return apiRequest(`/vehicles/${id}`, {
    method: 'DELETE',
  })
}

//
// ================= FARE ESTIMATE =================
//
export async function getFareEstimate({ pickup, drop }) {
  const distance_km = Math.floor(5 + Math.random() * 25)

  const vehicles = await getVehicles()

  const response = await apiRequest(
    `/bookings/estimate?distance_km=${distance_km}`
  )

  const estimates =
    response?.data?.estimates || response?.estimates || {}

  const vehicleOptions = vehicles.map((v) => {
    const baseFare =
      typeof v.base_fare === 'string'
        ? parseFloat(v.base_fare)
        : v.base_fare

    const perKmRate =
      typeof v.per_km_rate === 'string'
        ? parseFloat(v.per_km_rate)
        : v.per_km_rate

    const fareEstimate = estimates?.[v.type] || baseFare
    const fare = Math.round(fareEstimate + distance_km * perKmRate)

    return {
      id: v.id,
      name: v.name,
      type: v.type,
      capacity: v.capacity,
      fare,
      eta: `${Math.floor(3 + Math.random() * 10)} min`,
    }
  })

  return {
    vehicles: vehicleOptions,
    distance: distance_km,
    pickup,
    drop,
  }
}