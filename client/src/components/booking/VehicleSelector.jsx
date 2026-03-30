import VehicleCard from './VehicleCard'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/helpers'

export default function VehicleSelector({ vehicles, selectedVehicle, onSelectVehicle, onBookNow, loading }) {
  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Choose your ride</h2>
          <p className="text-white/40 text-sm font-body mt-0.5">Select a vehicle that fits your needs</p>
        </div>
        <span className="text-xs font-mono text-white/30 bg-surface-3 px-3 py-1 rounded-full border border-white/8">{vehicles.length} options</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((v, i) => (
          <div key={v.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both', opacity: 1 }}>
            <VehicleCard vehicle={v} selected={selectedVehicle?.id === v.id} onSelect={onSelectVehicle} />
          </div>
        ))}
      </div>

      {selectedVehicle && (
        <div className="animate-fade-up bg-surface-2 border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs font-body mb-0.5">Selected vehicle</p>
            <p className="font-display font-bold text-white text-lg">
              {selectedVehicle.name} <span className="text-brand-500">{formatCurrency(selectedVehicle.fare)}</span>
            </p>
            <p className="text-white/30 text-xs font-body">ETA: {selectedVehicle.eta} · {selectedVehicle.capacity} seat{selectedVehicle.capacity > 1 ? 's' : ''}</p>
          </div>
          <Button size="lg" loading={loading} onClick={onBookNow}>Book Now →</Button>
        </div>
      )}
    </div>
  )
}