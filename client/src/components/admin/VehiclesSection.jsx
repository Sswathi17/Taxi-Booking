import { useState, useEffect } from 'react'
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/api'
import { useAsync } from '../../hooks'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Table from '../ui/Table'
import StatusBadge from '../ui/StatusBadge'

const emptyForm = { name: '', type: '', capacity: '', baseFare: '', perKm: '', available: true }

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [deletingVehicle, setDeletingVehicle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const { loading, execute } = useAsync()
  const { loading: saving, execute: executeSave } = useAsync()
  const { loading: deleting, execute: executeDelete } = useAsync()

  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await execute(() => getVehicles())
        const list = Array.isArray(data) ? data : []
        setVehicles(list.map((v) => ({
          ...v,
          baseFare: v.base_fare ?? v.baseFare ?? 0,
          perKm: v.per_km_rate ?? v.perKm ?? 0,
          available: v.available ?? (v.status === 'available'),
        })))
      } catch (err) {
        console.error('Error loading vehicles:', err)
        setVehicles([])
      }
    }
    fetchVehicles()
  }, [])

  const openAdd = () => { setEditingVehicle(null); setForm(emptyForm); setFormErrors({}); setModalOpen(true) }
  const openEdit = (v) => { setEditingVehicle(v); setForm({ ...v, available: v.available ?? (v.status === 'available') }); setFormErrors({}); setModalOpen(true) }
  const openDelete = (v) => { setDeletingVehicle(v); setDeleteModalOpen(true) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.type.trim()) errs.type = 'Type is required'
    if (!form.capacity || isNaN(form.capacity) || +form.capacity < 1) errs.capacity = 'Valid capacity required'
    if (!form.baseFare || isNaN(form.baseFare)) errs.baseFare = 'Valid base fare required'
    if (!form.perKm || isNaN(form.perKm)) errs.perKm = 'Valid per km rate required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const payload = { 
      name: form.name,
      type: form.type,
      plate_number: form.plate || `MH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      capacity: +form.capacity, 
      base_fare: +form.baseFare, 
      per_km_rate: +form.perKm,
      status: form.available ? 'available' : 'unavailable'
    }
    await executeSave(async () => {
      if (editingVehicle) {
        const updated = await updateVehicle(editingVehicle.id, payload)
        setVehicles(v => v.map(x => x.id === editingVehicle.id ? { ...updated, baseFare: updated.base_fare, perKm: updated.per_km_rate } : x))
      } else {
        const created = await addVehicle(payload)
        setVehicles(v => [...v, { ...created, baseFare: created.base_fare, perKm: created.per_km_rate }])
      }
    })
    setModalOpen(false)
  }

  const handleDelete = async () => {
    await executeDelete(() => deleteVehicle(deletingVehicle.id))
    setVehicles(v => v.filter(x => x.id !== deletingVehicle.id))
    setDeleteModalOpen(false)
  }

  const columns = [
    { key: 'name', label: 'Vehicle', render: val => <span className="font-medium text-white">{val}</span> },
    { key: 'type', label: 'Type', render: val => <span className="text-white/60 text-xs font-mono">{val}</span> },
    { key: 'capacity', label: 'Seats', render: val => <span className="font-mono">{val}</span> },
    { key: 'baseFare', label: 'Base Fare', render: val => <span className="font-mono text-brand-400">₹{val}</span> },
    { key: 'perKm', label: 'Per Km', render: val => <span className="font-mono text-white/60">₹{val}</span> },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status?.toLowerCase() === 'available' ? 'Available' : 'Unavailable'} /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>✏️ Edit</Button>
        <Button variant="danger" size="sm" onClick={() => openDelete(row)}>🗑 Delete</Button>
      </div>
    )},
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Fleet Management</h2>
          <p className="text-white/40 text-sm mt-0.5">{vehicles.length} vehicles registered</p>
        </div>
        <Button onClick={openAdd} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>Add Vehicle</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: vehicles.length, color: 'text-white' },
          { label: 'Available', value: vehicles.filter(v => (v.status || '').toLowerCase() === 'available').length, color: 'text-emerald-400' },
          { label: 'Unavailable', value: vehicles.filter(v => (v.status || '').toLowerCase() !== 'available').length, color: 'text-red-400' },
          { label: 'Avg Base Fare', value: vehicles.length ? `₹${Math.round(vehicles.reduce((s,v) => s+(v.baseFare || 0), 0) / vehicles.length)}` : '—', color: 'text-brand-400' },
        ].map(s => (
          <div key={s.label} className="bg-surface-2 border border-white/8 rounded-2xl p-4">
            <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={vehicles} loading={loading} emptyMessage="No vehicles. Add your first vehicle." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>{editingVehicle ? 'Save Changes' : 'Add Vehicle'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Vehicle Name" name="name" placeholder="e.g. Sedan" value={form.name} onChange={handleChange} error={formErrors.name} />
          <Input label="Type" name="type" placeholder="e.g. Car" value={form.type} onChange={handleChange} error={formErrors.type} />
          <Input label="Capacity" name="capacity" type="number" placeholder="4" value={form.capacity} onChange={handleChange} error={formErrors.capacity} />
          <Input label="Base Fare (₹)" name="baseFare" type="number" placeholder="80" value={form.baseFare} onChange={handleChange} error={formErrors.baseFare} />
          <Input label="Per Km (₹)" name="perKm" type="number" placeholder="5" value={form.perKm} onChange={handleChange} error={formErrors.perKm} />
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="sr-only" />
                <div className={`w-10 h-5 rounded-full transition-colors ${form.available ? 'bg-brand-500' : 'bg-surface-4'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <span className="text-sm text-white/60">Available</span>
            </label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Vehicle" size="sm"
        footer={<><Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button><Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button></>}>
        <p className="text-white/60 text-sm">Are you sure you want to delete <strong className="text-white">{deletingVehicle?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  )
}