import { classNames } from '../../utils/helpers'

export default function Table({ columns, data, loading = false, emptyMessage = 'No data found' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-3 border-b border-white/8">
              {columns.map((col) => (
                <th key={col.key} className={classNames('px-4 py-3 text-left text-xs font-display font-semibold uppercase tracking-wider text-white/40', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-white/30">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className={classNames('border-b border-white/5 transition-colors hover:bg-white/3', i % 2 === 0 ? 'bg-surface-1/50' : 'bg-surface-2/50')}>
                  {columns.map((col) => (
                    <td key={col.key} className={classNames('px-4 py-3 text-white/80', col.cellClassName)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}