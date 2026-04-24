import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import HouseSpinner from './components/shared/HouseSpinner'

// Tenant pages
import TenantDashboard from './components/tenant/Dashboard'
import PaymentPanel from './components/tenant/PaymentPanel'
import PaymentHistory from './components/tenant/PaymentHistory'
import LeaseViewer from './components/tenant/LeaseViewer'
import MaintenanceForm from './components/tenant/MaintenanceForm'
import Inbox from './components/tenant/Inbox'
import Profile from './components/tenant/Profile'
import ReviewForm from './components/tenant/ReviewForm'

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard'
import TenantDetail from './components/admin/TenantDetail'
import PaymentConfirm from './components/admin/PaymentConfirm'
import AnnouncementBoard from './components/admin/AnnouncementBoard'
import MaintenanceQueue from './components/admin/MaintenanceQueue'
import TenantList from './components/admin/TenantList'

// Auth + shared
import LoginPage from './components/shared/LoginPage'
import UIShowcase from './components/UIShowcase'
import HouseLoading from './components/HouseLoading'
import LandingPage from './components/LandingPage'
import AboutContactPage from './components/AboutContactPage'
import PropertiesPage from './components/PropertiesPage'
import PrivacyPage from './components/PrivacyPage'
import TermsPage from './components/TermsPage'

function RequireTenant({ children }) {
  const { loading, session, profile } = useAuth()
  if (loading) return <HouseSpinner />
  if (!session) return <Navigate to='/login' replace />
  if (!profile) return <HouseSpinner />
  if (profile.role !== 'tenant') return <Navigate to='/admin/dashboard' replace />
  return children
}

function RequireAdmin({ children }) {
  const { loading, session, profile } = useAuth()
  if (loading) return <HouseSpinner />
  if (!session) return <Navigate to='/login' replace />
  if (!profile) return <HouseSpinner />
  if (profile.role !== 'admin') return <Navigate to='/tenant/dashboard' replace />
  return children
}

function RootRedirect() {
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RootRedirect />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/reset-password' element={<LoginPage />} />

        {/* Tenant routes */}
        <Route path='/tenant/dashboard' element={<RequireTenant><TenantDashboard /></RequireTenant>} />
        <Route path='/tenant/payments' element={<RequireTenant><PaymentPanel /></RequireTenant>} />
        <Route path='/tenant/payment-history' element={<RequireTenant><PaymentHistory /></RequireTenant>} />
        <Route path='/tenant/lease' element={<RequireTenant><LeaseViewer /></RequireTenant>} />
        <Route path='/tenant/maintenance' element={<RequireTenant><MaintenanceForm /></RequireTenant>} />
        <Route path='/tenant/inbox' element={<RequireTenant><Inbox /></RequireTenant>} />
        <Route path='/tenant/profile' element={<RequireTenant><Profile /></RequireTenant>} />
        <Route path='/tenant/review' element={<RequireTenant><ReviewForm /></RequireTenant>} />

        {/* Admin routes */}
        <Route path='/admin/dashboard' element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path='/admin/tenants' element={<RequireAdmin><TenantList /></RequireAdmin>} />
        <Route path='/admin/tenants/:tenantId' element={<RequireAdmin><TenantDetail /></RequireAdmin>} />
        <Route path='/admin/payments' element={<RequireAdmin><PaymentConfirm /></RequireAdmin>} />
        <Route path='/admin/announcements' element={<RequireAdmin><AnnouncementBoard /></RequireAdmin>} />
        <Route path='/admin/maintenance' element={<RequireAdmin><MaintenanceQueue /></RequireAdmin>} />

        {/* Public landing */}
        <Route path='/home' element={<LandingPage />} />
        <Route path='/about' element={<AboutContactPage />} />
        <Route path='/properties' element={<PropertiesPage />} />
        <Route path='/privacy' element={<PrivacyPage />} />
        <Route path='/terms' element={<TermsPage />} />

        {/* Design previews */}
        <Route path='/showcase' element={<UIShowcase />} />
        <Route path='/loading' element={<HouseLoading />} />

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
