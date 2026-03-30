import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminLogin } from '../../services/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAsync } from '../../hooks'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const { loading, error, execute } = useAsync()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validate = () => {
    const errs = {}

    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    const session = await execute(() => adminLogin(form))
    if (!session || !session.token) {
      console.error('Invalid login response:', session)
      return
    }

    localStorage.setItem('admin_session', JSON.stringify(session))
    login(session)
    navigate('/admin/dashboard', { replace: true })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-80 p-6 bg-white shadow rounded-xl"
      >
        <h2 className="text-xl font-semibold text-center">
          Admin Login
        </h2>

        <div>
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-sm">{fieldErrors.password}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" loading={loading}>
          Login
        </Button>

        <Link to="/" className="text-sm text-center text-blue-500">
          Back to app
        </Link>
      </form>
    </div>
  )
}