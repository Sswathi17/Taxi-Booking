import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useBooking } from '../../context/BookingContext'
import { getFareEstimate } from '../../services/api'
import { useAsync } from '../../hooks'

export default function FareEstimateForm({ onEstimateReady }) {
  const { booking, updateBooking } = useBooking()
  const { loading, error, execute } = useAsync()
  const [pickup, setPickup] = useState(booking.pickup || '')
  const [drop, setDrop] = useState(booking.drop || '')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!pickup.trim()) errs.pickup = 'Pickup location is required'
    if (!drop.trim()) errs.drop = 'Drop location is required'
    if (pickup.trim() && drop.trim() && pickup.trim().toLowerCase() === drop.trim().toLowerCase())
      errs.drop = 'Drop must differ from pickup'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await execute(() => getFareEstimate({ pickup, drop }))
    if (result) {
      updateBooking({ pickup, drop, fareEstimate: result })
      onEstimateReady?.(result)
    }
  }

  const LocationIcon = ({ color }) => (
    <svg className="w-4 h-4" fill={color || 'none'} stroke={color ? 'none' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      {!color && <circle cx="12" cy="10" r="3"/>}
    </svg>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Pickup Location" name="pickup" placeholder="Enter pickup address…" value={pickup}
        onChange={(e) => { setPickup(e.target.value); if (fieldErrors.pickup) setFieldErrors(p => ({...p, pickup: null})) }}
        error={fieldErrors.pickup} icon={<LocationIcon />} />

      <div className="flex items-center gap-3 px-1">
        <div className="flex flex-col items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <div className="w-px h-5 bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        </div>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <Input label="Drop Location" name="drop" placeholder="Enter destination address…" value={drop}
        onChange={(e) => { setDrop(e.target.value); if (fieldErrors.drop) setFieldErrors(p => ({...p, drop: null})) }}
        error={fieldErrors.drop} icon={<LocationIcon color="#f87171" />} />

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}

      <Button type="submit" size="lg" fullWidth loading={loading}>Get Fare Estimate</Button>
    </form>
  )
}