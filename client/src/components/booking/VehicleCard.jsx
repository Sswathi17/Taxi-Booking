import { formatCurrency, classNames } from '../../utils/helpers'

const icons = { bike: '🏍️', sedan: '🚗', suv: '🚙', mini: '🚕', auto: '🛺' }
const gradients = {
  bike:  'from-orange-500/10 to-transparent',
  sedan: 'from-blue-500/10 to-transparent',
  suv:   'from-purple-500/10 to-transparent',
}

export default function VehicleCard({ vehicle, selected, onSelect }) {
  const id = vehicle.id?.toLowerCase()
  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={classNames(
        'relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 p-5 bg-surface-2 hover:-translate-y-0.5',
        selected
          ? 'border-brand-500/70 bg-surface-3 shadow-lg shadow-brand-500/15 ring-1 ring-brand-500/20'
          : 'border-white/8 hover:border-brand-500/30 hover:shadow-md hover:shadow-brand-500/10'
      )}
    >
      <div className={classNames('absolute inset-0 bg-gradient-to-br opacity-60', gradients[id] || 'from-white/5 to-transparent')} />
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
          <svg className="w-3 h-3 text-surface-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {vehicle.tag && (
        <div className="absolute top-3 left-3">
          <span className={classNames('text-xs font-mono font-medium px-2 py-0.5 rounded-full',
            vehicle.tag === 'Premium'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/25'
              : 'bg-brand-500/20 text-brand-400 border border-brand-500/25'
          )}>{vehicle.tag}</span>
        </div>
      )}
      <div className="relative">
        <div className="flex items-center gap-3 mb-4 mt-2">
          <span className="text-4xl">{icons[id] || '🚗'}</span>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">{vehicle.name}</h3>
            <p className="text-xs text-white/40 font-body">{vehicle.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-brand-400 font-display font-bold text-base leading-none mb-0.5">{formatCurrency(vehicle.fare)}</div>
            <div className="text-white/30 text-xs">Fare</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-white font-display font-bold text-base leading-none mb-0.5">{vehicle.capacity}</div>
            <div className="text-white/30 text-xs">Seats</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <div className="text-emerald-400 font-display font-bold text-base leading-none mb-0.5">{vehicle.eta}</div>
            <div className="text-white/30 text-xs">ETA</div>
          </div>
        </div>
      </div>
    </div>
  )
}