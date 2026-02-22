import { useCallback, useEffect } from 'react'
import { HashRouter, useLocation, useNavigate } from 'react-router-dom'
import RootLayout from './components/RootLayout'
import ToastViewport from './components/ToastViewport'
import AboutPage from './pages/AboutPage'
import AccessDeniedPage from './pages/AccessDeniedPage'
import AuditPage from './pages/AuditPage'
import BillingPage from './pages/BillingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import { AppStateProvider, useAppActions, useAppState } from './state/AppStateContext'

function Redirect({ to, replace = true }) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to, { replace })
  }, [navigate, replace, to])

  return null
}

function AppRouter() {
  const { can, isAuthenticated, preferences, session, toasts } = useAppState()
  const { dismissToast, logout, updatePreference } = useAppActions()
  const navigate = useNavigate()
  const location = useLocation()

  const handleThemeToggle = useCallback(() => {
    updatePreference('theme', preferences.theme === 'dark' ? 'light' : 'dark')
  }, [preferences.theme, updatePreference])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const path = location.pathname || '/'

  let content = null

  if (path === '/') {
    content = <Redirect to={isAuthenticated ? '/overview' : '/login'} />
  } else if (path === '/login') {
    content = isAuthenticated ? <Redirect to="/overview" /> : <LoginPage />
  } else if (path === '/about') {
    content = <AboutPage />
  } else if (path === '/overview') {
    content = isAuthenticated ? <OverviewPage /> : <Redirect to="/login" />
  } else if (path === '/users') {
    content = isAuthenticated ? <UsersPage /> : <Redirect to="/login" />
  } else if (path === '/billing') {
    if (!isAuthenticated) {
      content = <Redirect to="/login" />
    } else if (!can('manageBilling')) {
      content = <AccessDeniedPage attemptedPath={path} />
    } else {
      content = <BillingPage />
    }
  } else if (path === '/audit') {
    content = isAuthenticated ? <AuditPage /> : <Redirect to="/login" />
  } else if (path === '/settings') {
    content = isAuthenticated ? <SettingsPage /> : <Redirect to="/login" />
  } else {
    content = <NotFoundPage />
  }

  return (
    <RootLayout
      canManageBilling={can('manageBilling')}
      density={preferences.density}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      onToggleTheme={handleThemeToggle}
      session={session}
      theme={preferences.theme}
    >
      {content}
      <ToastViewport onDismiss={dismissToast} toasts={toasts} />
    </RootLayout>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppStateProvider>
        <AppRouter />
      </AppStateProvider>
    </HashRouter>
  )
}
