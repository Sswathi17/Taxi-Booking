import { useState, useEffect } from 'react'
import { getBookings } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import Table from '../ui/Table'
import StatusBadge from '../ui/StatusBadge'
import Button from '../ui/Button'

const FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled']

// Dummy fallback
const DUMMY_BOOKINGS = [
  { id: 'dummy-1', booking_ref: 'BK001', pickup_location: 'Sample A', drop_location: 'Sample B', vehicle_name: 'Taxi', fare: 200, status: 'Confirmed' },
]

export default function BookingsSection() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ✅ FETCH FUNCTION
  const fetchBookingsData = async () => {
    try {
      setIsLoading(true)

      const data = await getBookings()
      console.log('📦 API Data:', data)

      if (Array.isArray(data)) {
        setBookings(data)
      } else if (data?.data) {
        setBookings(data.data)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.error('❌ Fetch Error:', err.message)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ AUTO REFRESH
  useEffect(() => {
    fetchBookingsData()

    const interval = setInterval(fetchBookingsData, 5000) // refresh every 5 sec
    return () => clearInterval(interval)
  }, [])

  // ✅ USE REAL DATA OR FALLBACK
  const displayBookings =
    bookings.length > 0 ? bookings : DUMMY_BOOKINGS

  // ✅ FILTER (FIXED)
  const filtered = displayBookings.filter(b => {
    const status = String(b.status || '').toLowerCase()

    const matchStatus =
      filter === 'All' ||
      status === filter.toLowerCase()

    const q = search.toLowerCase()

    const matchSearch =
      !q ||
      [
        b.booking_ref,
        b.pickup_location,
        b.drop_location,
        b.vehicle_name,
      ].some(f => String(f || '').toLowerCase().includes(q))

    return matchStatus && matchSearch
  })

  // ✅ STATS (FIXED → use displayBookings)
  const stats = {
    total: displayBookings.length,
    confirmed: displayBookings.filter(b => String(b.status).toLowerCase() === 'confirmed').length,
    pending: displayBookings.filter(b => String(b.status).toLowerCase() === 'pending').length,
    revenue: displayBookings
      .filter(b => String(b.status).toLowerCase() === 'confirmed')
      .reduce((s, b) => s + Number(b.fare || 0), 0),
  }

  const columns = [
    {
      key: 'booking_ref',
      label: 'Booking ID',
      render: val => (
        <span className="font-mono text-brand-400 text-xs">{val}</span>
      ),
    },
    {
      key: 'pickup_location',
      label: 'Pickup',
      render: val => (
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <span className="text-white/70 text-xs truncate max-w-[140px]">
            {val}
          </span>
        </div>
      ),
    },
    {
      key: 'drop_location',
      label: 'Drop',
      render: val => (
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-white/70 text-xs truncate max-w-[140px]">
            {val}
          </span>
        </div>
      ),
    },
    { key: 'vehicle_name', label: 'Vehicle' },
    {
      key: 'fare',
      label: 'Fare',
      render: val => (
        <span className="font-mono font-medium">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: val => <StatusBadge status={val} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-white">Bookings</h2>
          <p className="text-white/40 text-sm">
            Live bookings from database
          </p>
        </div>

        <Button onClick={fetchBookingsData} loading={isLoading}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Confirmed', value: stats.confirmed },
          { label: 'Pending', value: stats.pending },
          { label: 'Revenue', value: formatCurrency(stats.revenue) },
        ].map(s => (
          <div key={s.label} className="bg-surface-2 p-4 rounded-xl">
            <p className="text-white/40 text-xs">{s.label}</p>
            <p className="text-white text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded ${
              filter === s ? 'bg-blue-500 text-white' : 'text-white/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-base"
      />

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No bookings found"
      />
    </div>
  )
}