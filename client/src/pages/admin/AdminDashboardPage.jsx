import { useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import VehiclesSection from '../../components/admin/VehiclesSection'
import BookingsSection from '../../components/admin/BookingsSection'

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('bookings')
  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'bookings' && <BookingsSection />}
      {activeSection === 'vehicles' && <VehiclesSection />}
    </AdminLayout>
  )
}