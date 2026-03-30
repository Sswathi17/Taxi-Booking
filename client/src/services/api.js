// ✅ FIXED BASE URL (VERY IMPORTANT)
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ||
    'https://taxi-booking-ilns.onrender.com'

/**
 * Core API request helper
 */
async function apiRequest(endpoint, options = {}) {
  const session = localStorage.getItem('admin_session')
  let token = null

  if (session) {
    try {
      const parsed = JSON.parse(session)
      token =
        parsed?.token ||
        parsed?.data?.token ||
        null

      if (!token && parsed?.admin && parsed?.token) {
        token = parsed.token
      }

      if (!token && parsed?.data?.admin && parsed?.data?.token) {
        token = parsed.data.token
      }
    } catch (err) {
      token = null
    }
  }

  try {
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
        throw new Error(data?.error || 'Unauthorized')
      }

      throw new Error(data?.message || `API Error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('NETWORK ERROR:', error.message)
    throw new Error('Server not reachable. Please try again.')
  }
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
  return Array.isArray(res?.data) ? res.data : []
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
  return Array.isArray(res?.data) ? res.data : []
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
    const baseFare = Number(v.base_fare)
    const perKmRate = Number(v.per_km_rate)

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
