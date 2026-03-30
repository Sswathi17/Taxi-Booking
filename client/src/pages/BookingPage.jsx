import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import FareEstimateForm from '../components/booking/FareEstimateForm'
import VehicleSelector from '../components/booking/VehicleSelector'
import { useBooking } from '../context/BookingContext'
import { createBooking, getBookings } from '../services/api'
import { useAsync } from '../hooks'
import Table from '../components/ui/Table'
import StatusBadge from '../components/ui/StatusBadge'
import { formatCurrency } from '../utils/helpers'

export default function BookingPage() {
  const navigate = useNavigate()
  const { booking, updateBooking } = useBooking()
  const [showVehicles, setShowVehicles] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const { loading: bookingLoading, execute } = useAsync()
  const [recentBookings, setRecentBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Dummy bookings fallback
  const DUMMY_BOOKINGS = [
    { id: 'dummy-1', booking_ref: 'BK001', pickup_location: 'Downtown', drop_location: 'Airport', vehicle_name: 'Sedan', fare: 450, status: 'confirmed' },
    { id: 'dummy-2', booking_ref: 'BK002', pickup_location: 'Mall', drop_location: 'Hotel', vehicle_name: 'SUV', fare: 320, status: 'pending' },
    { id: 'dummy-3', booking_ref: 'BK003', pickup_location: 'Office', drop_location: 'Home', vehicle_name: 'Hatchback', fare: 180, status: 'confirmed' },
  ]

  // Fetch recent bookings
  const fetchRecentBookings = async () => {
    try {
      setBookingsLoading(true)
      const data = await getBookings()
      if (Array.isArray(data)) {
        setRecentBookings(data.slice(0, 5)) // Show only recent 5
      } else if (data?.data) {
        setRecentBookings(data.data.slice(0, 5))
      } else {
        setRecentBookings([])
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err.message)
      setRecentBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentBookings()
  }, [])

  const handleEstimateReady = () => {
    setShowVehicles(true)
    setSelectedVehicle(null)
    setTimeout(() => document.getElementById('vehicles-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // Display bookings (real or dummy)
  const displayBookings = recentBookings.length > 0 ? recentBookings : DUMMY_BOOKINGS

  const bookingColumns = [
    {
      key: 'booking_ref',
      label: 'Booking ID',
      render: val => (
        <span className="font-mono text-brand-400 text-xs">{val}</span>
      ),
    },
    {
      key: 'pickup_location',
      label: 'From',
      render: val => (
        <span className="text-white/70 text-xs truncate max-w-[120px]">{val}</span>
      ),
    },
    {
      key: 'drop_location',
      label: 'To',
      render: val => (
        <span className="text-white/70 text-xs truncate max-w-[120px]">{val}</span>
      ),
    },
    { key: 'vehicle_name', label: 'Vehicle', render: val => <span className="text-xs">{val}</span> },
    {
      key: 'fare',
      label: 'Fare',
      render: val => (
        <span className="font-mono font-medium text-xs">
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

  const handleBookNow = async () => {
  if (!selectedVehicle) return;

  const payload = {
    customer_name: booking.name || "Test User",
    customer_phone: booking.phone || "9999999999",
    customer_email: booking.email || "test@example.com",

    vehicle_id: selectedVehicle.id,

    pickup_location: booking.pickup,
    pickup_lat: booking.pickupLat,
    pickup_lng: booking.pickupLng,

    drop_location: booking.drop,
    drop_lat: booking.dropLat,
    drop_lng: booking.dropLng,

    distance_km: booking.distance || booking.fareEstimate?.distance,

    notes: "",
  };

  const result = await execute(() => createBooking(payload));

  if (result) {
    updateBooking({ confirmedBooking: result.data.booking, selectedVehicle });
    navigate('/booking-confirmation');
  }
};

  return (
    <div className="min-h-screen bg-surface-0 dot-grid">
      <Navbar />
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Hero text */}
            <div className="flex flex-col gap-6 pt-4">
              <div className="inline-flex items-center gap-2 w-fit bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-brand-400 text-xs font-mono font-medium uppercase tracking-wider">Premium Rides</span>
              </div>
              <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight">
                Your ride,<br /><span className="text-brand-500">on demand.</span>
              </h1>
              <p className="text-white/40 font-body text-lg leading-relaxed">
                Book a cab in seconds. Choose from bikes, sedans, and SUVs. Real-time tracking and transparent pricing.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[{ value: '2M+', label: 'Rides' }, { value: '4.9★', label: 'Rating' }, { value: '50+', label: 'Cities' }].map(s => (
                  <div key={s.label} className="bg-surface-2/60 border border-white/8 rounded-2xl p-4 text-center">
                    <div className="font-display font-bold text-2xl text-white">{s.value}</div>
                    <div className="text-white/30 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {[['⚡', 'Instant booking confirmation'], ['💳', 'No hidden charges — transparent pricing'], ['📍', 'Real-time driver tracking']].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-white/50 text-sm"><span>{icon}</span>{text}</div>
                ))}
              </div>
            </div>

            {/* Booking form */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-surface-2/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-500/15 border border-brand-500/25 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white text-lg leading-tight">Book a Ride</h2>
                    <p className="text-white/30 text-xs">Enter your locations to get started</p>
                  </div>
                </div>
                <FareEstimateForm onEstimateReady={handleEstimateReady} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {showVehicles && booking.fareEstimate && (
        <section id="vehicles-section" className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-surface-2/60 border border-white/8 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-brand-500/30" />
                  <div className="w-px h-8 bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-400/30" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <p className="text-white font-body text-sm font-medium truncate">{booking.pickup}</p>
                  <p className="text-white/40 font-body text-sm truncate">{booking.drop}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-white/30 bg-surface-3 px-3 py-1.5 rounded-full border border-white/8">~{booking.fareEstimate?.distance} km</span>
                <button onClick={() => setShowVehicles(false)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Change</button>
              </div>
            </div>
            <VehicleSelector
              vehicles={booking.fareEstimate?.vehicles || []}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              onBookNow={handleBookNow}
              loading={bookingLoading}
            />
          </div>
        </section>
      )}

      {/* Recent Bookings Section */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface-2/60 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-white">Recent Bookings</h2>
                <p className="text-white/40 text-sm">
                  {recentBookings.length > 0 ? 'Latest rides from our system' : 'Sample bookings (demo data)'}
                </p>
              </div>
              <button 
                onClick={fetchRecentBookings} 
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                disabled={bookingsLoading}
              >
                {bookingsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <Table
              columns={bookingColumns}
              data={displayBookings}
              loading={bookingsLoading}
              emptyMessage="No bookings found"
            />
          </div>
        </div>
      </section>
    </div>
  )
}