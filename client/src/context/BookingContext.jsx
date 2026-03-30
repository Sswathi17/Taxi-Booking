import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

const initialState = {
  pickup: '',
  drop: '',
  fareEstimate: null,
  selectedVehicle: null,
  confirmedBooking: null,
}

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(initialState)

  const updateBooking = (updates) => setBooking((prev) => ({ ...prev, ...updates }))
  const resetBooking = () => setBooking(initialState)

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be inside BookingProvider')
  return ctx
}