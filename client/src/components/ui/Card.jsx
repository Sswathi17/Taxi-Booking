import { classNames } from '../../utils/helpers'

export default function Card({ children, className = '', hoverable = false, selected = false, onClick, padding = 'md' }) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-8', none: '' }
  return (
    <div
      onClick={onClick}
      className={classNames(
        'bg-surface-2 border rounded-2xl transition-all duration-300',
        paddings[padding] || paddings.md,
        selected ? 'border-brand-500/70 bg-surface-3 shadow-lg shadow-brand-500/15 ring-1 ring-brand-500/20' : 'border-white/8',
        hoverable && 'cursor-pointer hover:border-brand-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/10',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}