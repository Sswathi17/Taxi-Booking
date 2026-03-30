import { classNames } from '../../utils/helpers'

export default function Input({ label, error, hint, icon = null, iconRight = null, className = '', containerClassName = '', name, ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={name} className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">{icon}</div>}
        <input
          id={name}
          name={name}
          className={classNames(
            'input-base',
            icon && 'pl-10',
            iconRight && 'pr-10',
            error && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
        {iconRight && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">{iconRight}</div>}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  )
}