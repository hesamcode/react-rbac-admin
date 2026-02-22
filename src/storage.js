import { ROLES } from './rbac'

export const STORAGE_KEY = 'rbac-admin-console-store'
export const STORAGE_VERSION = 1

const DAY_MS = 24 * 60 * 60 * 1000

const roleCycle = ['Admin', 'Manager', 'Support', 'Viewer']

const seedUsers = [
  {
    id: 'user-001',
    name: 'Ava Thompson',
    email: 'ava.thompson@northstarhq.com',
    role: 'Admin',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 0.15).toISOString(),
  },
  {
    id: 'user-002',
    name: 'Noah Patel',
    email: 'noah.patel@northstarhq.com',
    role: 'Manager',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 0.6).toISOString(),
  },
  {
    id: 'user-003',
    name: 'Mia Rodriguez',
    email: 'mia.rodriguez@northstarhq.com',
    role: 'Support',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 1.1).toISOString(),
  },
  {
    id: 'user-004',
    name: 'Ethan Kim',
    email: 'ethan.kim@northstarhq.com',
    role: 'Viewer',
    status: 'Inactive',
    lastActiveAt: new Date(Date.now() - DAY_MS * 8).toISOString(),
  },
  {
    id: 'user-005',
    name: 'Sophia Green',
    email: 'sophia.green@northstarhq.com',
    role: 'Manager',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 0.4).toISOString(),
  },
  {
    id: 'user-006',
    name: 'Lucas Baker',
    email: 'lucas.baker@northstarhq.com',
    role: 'Support',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 2.2).toISOString(),
  },
  {
    id: 'user-007',
    name: 'Olivia Chen',
    email: 'olivia.chen@northstarhq.com',
    role: 'Viewer',
    status: 'Invited',
    lastActiveAt: new Date(Date.now() - DAY_MS * 12).toISOString(),
  },
  {
    id: 'user-008',
    name: 'James Miller',
    email: 'james.miller@northstarhq.com',
    role: 'Manager',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 1.3).toISOString(),
  },
  {
    id: 'user-009',
    name: 'Amelia Johnson',
    email: 'amelia.johnson@northstarhq.com',
    role: 'Support',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 3.5).toISOString(),
  },
  {
    id: 'user-010',
    name: 'Benjamin Scott',
    email: 'benjamin.scott@northstarhq.com',
    role: 'Viewer',
    status: 'Inactive',
    lastActiveAt: new Date(Date.now() - DAY_MS * 15).toISOString(),
  },
  {
    id: 'user-011',
    name: 'Charlotte Wilson',
    email: 'charlotte.wilson@northstarhq.com',
    role: 'Admin',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 0.8).toISOString(),
  },
  {
    id: 'user-012',
    name: 'Henry Evans',
    email: 'henry.evans@northstarhq.com',
    role: 'Support',
    status: 'Active',
    lastActiveAt: new Date(Date.now() - DAY_MS * 1.7).toISOString(),
  },
]

const makeSystemAudit = () => ({
  id: `audit-${Date.now().toString(36)}-seed`,
  timestamp: new Date(Date.now() - DAY_MS * 2).toISOString(),
  actor: 'system@northstarhq.com',
  actionType: 'system',
  action: 'Seeded demo workspace',
  target: 'data-store',
  details: 'Initial demo records were created for first run.',
})

const withFallbackRole = (role, index) => {
  if (ROLES.includes(role)) {
    return role
  }

  return roleCycle[index % roleCycle.length]
}

const sanitizeUsers = (users) => {
  if (!Array.isArray(users)) {
    return [...seedUsers]
  }

  return users
    .filter((user) => user && typeof user === 'object')
    .map((user, index) => ({
      id: typeof user.id === 'string' ? user.id : `user-${String(index + 1).padStart(3, '0')}`,
      name: typeof user.name === 'string' && user.name.trim() ? user.name.trim() : `Demo User ${index + 1}`,
      email:
        typeof user.email === 'string' && user.email.trim()
          ? user.email.trim().toLowerCase()
          : `demo${index + 1}@northstarhq.com`,
      role: withFallbackRole(user.role, index),
      status:
        typeof user.status === 'string' && user.status.trim() ? user.status.trim() : 'Active',
      lastActiveAt:
        typeof user.lastActiveAt === 'string' && user.lastActiveAt
          ? user.lastActiveAt
          : new Date(Date.now() - DAY_MS * (index + 1)).toISOString(),
    }))
}

const sanitizeAuditLogs = (auditLogs) => {
  if (!Array.isArray(auditLogs)) {
    return [makeSystemAudit()]
  }

  return auditLogs
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry, index) => ({
      id:
        typeof entry.id === 'string' && entry.id.trim()
          ? entry.id
          : `audit-${Date.now().toString(36)}-${index}`,
      timestamp:
        typeof entry.timestamp === 'string' && entry.timestamp
          ? entry.timestamp
          : new Date(Date.now() - index * 5 * 60 * 1000).toISOString(),
      actor: typeof entry.actor === 'string' && entry.actor.trim() ? entry.actor.trim() : 'system',
      actionType:
        typeof entry.actionType === 'string' && entry.actionType.trim()
          ? entry.actionType.trim()
          : 'system',
      action: typeof entry.action === 'string' && entry.action.trim() ? entry.action.trim() : 'Action',
      target: typeof entry.target === 'string' && entry.target.trim() ? entry.target.trim() : '-',
      details: typeof entry.details === 'string' && entry.details.trim() ? entry.details.trim() : '-',
    }))
}

const sanitizePreferences = (preferences) => ({
  theme: preferences?.theme === 'dark' ? 'dark' : 'light',
  density: preferences?.density === 'compact' ? 'compact' : 'comfortable',
})

export const createDemoCollections = () => ({
  users: [...seedUsers],
  auditLogs: [makeSystemAudit()],
})

const createDefaultStore = () => {
  const demoData = createDemoCollections()
  return {
    version: STORAGE_VERSION,
    session: null,
    preferences: {
      theme: 'light',
      density: 'comfortable',
    },
    users: demoData.users,
    auditLogs: demoData.auditLogs,
  }
}

const sanitizeStore = (store) => ({
  version: STORAGE_VERSION,
  session:
    store?.session && typeof store.session === 'object'
      ? {
          email:
            typeof store.session.email === 'string' && store.session.email.trim()
              ? store.session.email.trim().toLowerCase()
              : '',
          role: withFallbackRole(store.session.role, 0),
          loginAt:
            typeof store.session.loginAt === 'string' && store.session.loginAt
              ? store.session.loginAt
              : new Date().toISOString(),
        }
      : null,
  preferences: sanitizePreferences(store?.preferences),
  users: sanitizeUsers(store?.users),
  auditLogs: sanitizeAuditLogs(store?.auditLogs),
})

export const migrateStore = (rawStore) => {
  if (!rawStore || typeof rawStore !== 'object') {
    return createDefaultStore()
  }

  let migratedStore = rawStore

  // Migration stub for future schema upgrades.
  if ((rawStore.version ?? 0) < STORAGE_VERSION) {
    migratedStore = {
      ...rawStore,
      version: STORAGE_VERSION,
    }
  }

  return sanitizeStore(migratedStore)
}

export const loadStore = () => {
  if (typeof window === 'undefined') {
    return createDefaultStore()
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    const defaultStore = createDefaultStore()
    saveStore(defaultStore)
    return defaultStore
  }

  try {
    const parsed = JSON.parse(rawValue)
    const migrated = migrateStore(parsed)
    saveStore(migrated)
    return migrated
  } catch {
    const defaultStore = createDefaultStore()
    saveStore(defaultStore)
    return defaultStore
  }
}

export const saveStore = (store) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}
