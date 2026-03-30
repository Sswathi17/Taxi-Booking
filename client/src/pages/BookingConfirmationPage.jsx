import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { formatCurrency, formatDate } from '../utils/helpers'
import Button from '../components/ui/Button'

const vehicleIcons = { bike: '🏍️', sedan: '🚗', suv: '🚙', mini: '🚕', auto: '🛺' }

export default function BookingConfirmationPage() {
  const navigate = useNavigate()
  const { booking, resetBooking } = useBooking()
  const confirmed = booking.confirmedBooking

  useEffect(() => { if (!confirmed) navigate('/', { replace: true }) }, [confirmed, navigate])
  if (!confirmed) return null

  const vehicleIcon = vehicleIcons[confirmed.vehicle?.id?.toLowerCase()] || '🚗'

  return (
    <div className="min-h-screen bg-surface-0 dot-grid flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-lg">
        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
              <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-4xl text-white mb-2">Booking Confirmed!</h1>
          <p className="text-white/40">Your ride is being arranged.</p>
        </div>

        <div className="bg-surface-2/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/15 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-emerald-400/60 text-xs font-mono uppercase tracking-wider mb-0.5">Booking ID</p>
              <p className="text-emerald-400 font-mono font-bold text-xl tracking-wider">{confirmed.booking_ref}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Confirmed
            </span>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Route */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-1 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-brand-500/30" />
                <div className="w-px flex-1 min-h-[2rem] bg-gradient-to-b from-brand-500/50 to-red-400/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-400/30" />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div><p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-0.5">Pickup</p><p className="text-white font-medium">{confirmed.pickup_location}</p></div>
                <div><p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-0.5">Drop</p><p className="text-white font-medium">{confirmed.drop_location}</p></div>
              </div>
            </div>
            <div className="h-px bg-white/8" />

            {/* Vehicle & Fare */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-3 rounded-2xl p-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Vehicle</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{vehicleIcon}</span>
                  <div>
                    <p className="text-white font-display font-bold">{confirmed.vehicle_name}</p>
                    <p className="text-white/30 text-xs">{confirmed.capacity} seats</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-3 rounded-2xl p-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Fare</p>
                <p className="text-brand-500 font-display font-extrabold text-2xl">{formatCurrency(confirmed.fare)}</p>
                <p className="text-white/30 text-xs">Estimated fare</p>
              </div>
            </div>

            {/* Driver details will be shown once assigned */}
            {/* <div className="bg-surface-3 rounded-2xl p-4">
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-3">Driver Details</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-display font-bold">
                  {confirmed.driverName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{confirmed.driverName}</p>
                  <p className="text-white/40 text-sm">{confirmed.driverPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-xs font-mono">{confirmed.vehicleNumber}</p>
                  <div className="flex gap-0.5 justify-end mt-1">
                    {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-brand-500 text-xs">★</span>)}
                  </div>
                </div>
              </div>
            </div> */}
            <p className="text-white/20 text-xs font-mono text-center">Booked at {formatDate(confirmed.created_at)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="secondary" fullWidth onClick={() => { resetBooking(); navigate('/') }}>+ Book Another</Button>
          <Link to="/" className="flex-1"><Button fullWidth>Back to Home</Button></Link>
        </div>
      </div>
    </div>
  )
}