import { useState, useCallback } from 'react'

export function useAsync() {
  const [state, setState] = useState({ loading: false, error: null, data: null })

  const execute = useCallback(async (asyncFn) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await asyncFn()
      setState({ loading: false, error: null, data })
      return data
    } catch (err) {
      const error = err.message || 'Something went wrong'
      setState({ loading: false, error, data: null })
      throw err
    }
  }, [])

  const reset = useCallback(() => setState({ loading: false, error: null, data: null }), [])

  return { ...state, execute, reset }
}

export function useForm(initialValues = {}, validators = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }, [errors])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    if (validators[name]) {
      const error = validators[name](values[name], values)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }, [validators, values])

  const validate = useCallback(() => {
    const newErrors = {}
    Object.keys(validators).forEach((field) => {
      const error = validators[field](values[field], values)
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    setTouched(Object.keys(validators).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    return Object.keys(newErrors).length === 0
  }, [validators, values])

  const reset = useCallback(() => { setValues(initialValues); setErrors({}); setTouched({}) }, [initialValues])
  const setValue = useCallback((name, value) => setValues((prev) => ({ ...prev, [name]: value })), [])

  return { values, errors, touched, handleChange, handleBlur, validate, reset, setValue, setValues }
}