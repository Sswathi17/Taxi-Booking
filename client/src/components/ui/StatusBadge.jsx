import { classNames } from '../../utils/helpers'

const config = {
  Confirmed:   { className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Pending:     { className: 'bg-yellow-500/15  text-yellow-400  border border-yellow-500/25',  dot: 'bg-yellow-400' },
  Cancelled:   { className: 'bg-red-500/15     text-red-400     border border-red-500/25',     dot: 'bg-red-400' },
  Available:   { className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Unavailable: { className: 'bg-surface-4 text-white/40 border border-white/10',              dot: 'bg-white/30' },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config.Pending
  return (
    <span className={classNames('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium', c.className)}>
      <span className={classNames('w-1.5 h-1.5 rounded-full', c.dot)} />
      {status}
    </span>
  )
}