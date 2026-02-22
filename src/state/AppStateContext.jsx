/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { canRole } from '../rbac'
import { createDemoCollections, loadStore, saveStore } from '../storage'

const MAX_AUDIT_LOGS = 500

const AppStateContext = createContext(null)
const AppActionsContext = createContext(null)

const generateId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

const createAuditEntry = ({ actor, actionType, action, target, details }) => ({
  id: generateId('audit'),
  timestamp: new Date().toISOString(),
  actor,
  actionType,
  action,
  target,
  details,
})

const trimAuditLogs = (auditLogs) => auditLogs.slice(0, MAX_AUDIT_LOGS)

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...state,
        session: action.session,
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'LOGOUT': {
      return {
        ...state,
        session: null,
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'CREATE_USER': {
      return {
        ...state,
        users: [action.user, ...state.users],
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'UPDATE_USER': {
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.user.id ? action.user : user,
        ),
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'DELETE_USER': {
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.userId),
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'UPDATE_PREFERENCE': {
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.key]: action.value,
        },
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    case 'RESET_DEMO_DATA': {
      return {
        ...state,
        users: action.demoData.users,
        auditLogs: trimAuditLogs([
          action.auditEntry,
          ...action.demoData.auditLogs,
          ...state.auditLogs,
        ]),
      }
    }

    case 'APPEND_AUDIT': {
      return {
        ...state,
        auditLogs: trimAuditLogs([action.auditEntry, ...state.auditLogs]),
      }
    }

    default:
      return state
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadStore)
  const [toasts, setToasts] = useState([])
  const timeoutMapRef = useRef(new Map())

  useEffect(() => {
    saveStore(state)
  }, [state])

  useEffect(() => {
    const isDark = state.preferences.theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }, [state.preferences.theme])

  useEffect(() => {
    document.documentElement.dataset.density = state.preferences.density
  }, [state.preferences.density])

  useEffect(
    () => () => {
      timeoutMapRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      timeoutMapRef.current.clear()
    },
    [],
  )

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutMapRef.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, tone = 'info') => {
      const id = generateId('toast')
      setToasts((current) => [...current, { id, message, tone }])

      const timeoutId = window.setTimeout(() => {
        timeoutMapRef.current.delete(id)
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 3500)

      timeoutMapRef.current.set(id, timeoutId)
      return id
    },
    [],
  )

  const actorFromState = useCallback(
    () => state.session?.email || 'system@northstarhq.com',
    [state.session?.email],
  )

  const appendAudit = useCallback(
    ({ actionType, action, target, details, actor }) => {
      dispatch({
        type: 'APPEND_AUDIT',
        auditEntry: createAuditEntry({
          actor: actor || actorFromState(),
          actionType,
          action,
          target,
          details,
        }),
      })
    },
    [actorFromState],
  )

  const login = useCallback(
    (email, role) => {
      const normalizedEmail = email.trim().toLowerCase()
      const session = {
        email: normalizedEmail,
        role,
        loginAt: new Date().toISOString(),
      }

      dispatch({
        type: 'LOGIN',
        session,
        auditEntry: createAuditEntry({
          actor: normalizedEmail,
          actionType: 'auth',
          action: 'User login',
          target: 'session',
          details: `Signed in with ${role} role.`,
        }),
      })

      pushToast(`Welcome back, ${normalizedEmail}.`, 'success')
    },
    [pushToast],
  )

  const logout = useCallback(() => {
    if (!state.session) {
      return
    }

    dispatch({
      type: 'LOGOUT',
      auditEntry: createAuditEntry({
        actor: state.session.email,
        actionType: 'auth',
        action: 'User logout',
        target: 'session',
        details: 'Session cleared from local storage.',
      }),
    })

    pushToast('You have been signed out.', 'info')
  }, [pushToast, state.session])

  const createUser = useCallback(
    ({ name, email, role, status }) => {
      const user = {
        id: generateId('user'),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status,
        lastActiveAt: new Date().toISOString(),
      }

      dispatch({
        type: 'CREATE_USER',
        user,
        auditEntry: createAuditEntry({
          actor: actorFromState(),
          actionType: 'users',
          action: 'Created user',
          target: user.email,
          details: `Assigned role ${role} with status ${status}.`,
        }),
      })

      pushToast(`User ${user.name} created.`, 'success')
    },
    [actorFromState, pushToast],
  )

  const updateUser = useCallback(
    (userId, updates) => {
      const existingUser = state.users.find((user) => user.id === userId)
      if (!existingUser) {
        return
      }

      const updatedUser = {
        ...existingUser,
        ...updates,
        name: updates.name?.trim() ?? existingUser.name,
        email: updates.email?.trim().toLowerCase() ?? existingUser.email,
      }

      dispatch({
        type: 'UPDATE_USER',
        user: updatedUser,
        auditEntry: createAuditEntry({
          actor: actorFromState(),
          actionType: 'users',
          action: 'Updated user',
          target: updatedUser.email,
          details: `Role ${existingUser.role} -> ${updatedUser.role}; status ${existingUser.status} -> ${updatedUser.status}.`,
        }),
      })

      pushToast(`User ${updatedUser.name} updated.`, 'success')
    },
    [actorFromState, pushToast, state.users],
  )

  const deleteUser = useCallback(
    (userId) => {
      const existingUser = state.users.find((user) => user.id === userId)
      if (!existingUser) {
        return
      }

      dispatch({
        type: 'DELETE_USER',
        userId,
        auditEntry: createAuditEntry({
          actor: actorFromState(),
          actionType: 'users',
          action: 'Deleted user',
          target: existingUser.email,
          details: `Removed ${existingUser.name} from workspace.`,
        }),
      })

      pushToast(`User ${existingUser.name} deleted.`, 'warning')
    },
    [actorFromState, pushToast, state.users],
  )

  const updatePreference = useCallback(
    (key, value) => {
      if (state.preferences[key] === value) {
        return
      }

      dispatch({
        type: 'UPDATE_PREFERENCE',
        key,
        value,
        auditEntry: createAuditEntry({
          actor: actorFromState(),
          actionType: 'settings',
          action: 'Updated preference',
          target: key,
          details: `${key} set to ${value}.`,
        }),
      })

      pushToast(`Preference updated: ${key}.`, 'info')
    },
    [actorFromState, pushToast, state.preferences],
  )

  const resetDemoData = useCallback(() => {
    const demoData = createDemoCollections()
    dispatch({
      type: 'RESET_DEMO_DATA',
      demoData,
      auditEntry: createAuditEntry({
        actor: actorFromState(),
        actionType: 'settings',
        action: 'Reset demo data',
        target: 'workspace',
        details: 'Users and seed records were reset.',
      }),
    })

    pushToast('Demo data reset completed.', 'warning')
  }, [actorFromState, pushToast])

  const can = useCallback(
    (permission) => canRole(state.session?.role, permission),
    [state.session?.role],
  )

  const appStateValue = useMemo(
    () => ({
      session: state.session,
      users: state.users,
      auditLogs: state.auditLogs,
      preferences: state.preferences,
      toasts,
      isAuthenticated: Boolean(state.session),
      can,
    }),
    [can, state.auditLogs, state.preferences, state.session, state.users, toasts],
  )

  const appActionsValue = useMemo(
    () => ({
      appendAudit,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      updatePreference,
      resetDemoData,
      dismissToast,
      pushToast,
    }),
    [
      appendAudit,
      createUser,
      deleteUser,
      dismissToast,
      login,
      logout,
      pushToast,
      resetDemoData,
      updatePreference,
      updateUser,
    ],
  )

  return (
    <AppStateContext.Provider value={appStateValue}>
      <AppActionsContext.Provider value={appActionsValue}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  )
}

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider')
  }

  return context
}

export const useAppActions = () => {
  const context = useContext(AppActionsContext)
  if (!context) {
    throw new Error('useAppActions must be used inside AppStateProvider')
  }

  return context
}
