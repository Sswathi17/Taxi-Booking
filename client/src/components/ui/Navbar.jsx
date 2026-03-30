import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg className="w-4 h-4 text-surface-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Ride<span className="text-brand-500">X</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 rounded-lg text-sm font-body text-white/60 hover:text-white hover:bg-white/5 transition-all">Book a Ride</Link>
          <Link to="/admin/login" className="px-4 py-2 rounded-lg text-sm font-body text-white/60 hover:text-white hover:bg-white/5 transition-all">Admin</Link>
        </div>
      </div>
    </nav>
  )
}