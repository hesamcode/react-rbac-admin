export const PERMISSIONS = [
  'view',
  'edit',
  'delete',
  'export',
  'manageBilling',
  'manageUsers',
]

export const ROLES = ['Admin', 'Manager', 'Support', 'Viewer']

export const PERMISSION_MATRIX = {
  Admin: {
    view: true,
    edit: true,
    delete: true,
    export: true,
    manageBilling: true,
    manageUsers: true,
  },
  Manager: {
    view: true,
    edit: true,
    delete: false,
    export: true,
    manageBilling: false,
    manageUsers: true,
  },
  Support: {
    view: true,
    edit: true,
    delete: false,
    export: false,
    manageBilling: false,
    manageUsers: false,
  },
  Viewer: {
    view: true,
    edit: false,
    delete: false,
    export: false,
    manageBilling: false,
    manageUsers: false,
  },
}

export const canRole = (role, permission) =>
  Boolean(PERMISSION_MATRIX[role]?.[permission])
