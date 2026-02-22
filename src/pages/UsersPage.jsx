import { memo, useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { ROLES } from '../rbac'
import { useAppActions, useAppState } from '../state/AppStateContext'
import { daysAgoLabel, formatDateTime } from '../utils'

const PAGE_SIZE = {
  comfortable: 6,
  compact: 8,
}

const USER_STATUSES = ['Active', 'Inactive', 'Invited']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sortUsers = (users, sortKey, sortDirection) => {
  const sorted = [...users]

  sorted.sort((a, b) => {
    const valueA = String(a[sortKey] ?? '').toLowerCase()
    const valueB = String(b[sortKey] ?? '').toLowerCase()

    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1
    }

    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1
    }

    return 0
  })

  return sorted
}

function UsersPage() {
  const { users, preferences, can } = useAppState()
  const { createUser, updateUser, deleteUser } = useAppActions()

  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
  })
  const [formErrors, setFormErrors] = useState({})

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState(null)

  const canEdit = can('edit')
  const canDelete = can('delete')
  const canManageUsers = can('manageUsers')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    const visibleUsers = query
      ? users.filter((user) =>
          [user.name, user.email, user.role, user.status]
            .join(' ')
            .toLowerCase()
            .includes(query),
        )
      : users

    return sortUsers(visibleUsers, sortKey, sortDirection)
  }, [search, sortDirection, sortKey, users])

  const pageSize = PAGE_SIZE[preferences.density] || PAGE_SIZE.comfortable
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, pageSize, safePage])

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) || null,
    [editingUserId, users],
  )

  const deleteCandidate = useMemo(
    () => users.find((user) => user.id === deleteCandidateId) || null,
    [deleteCandidateId, users],
  )

  const openCreateUserModal = () => {
    setEditingUserId(null)
    setFormValues({
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
    })
    setFormErrors({})
    setIsEditorOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUserId(user.id)
    setFormValues({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setFormErrors({})
    setIsEditorOpen(true)
  }

  const validateUserForm = () => {
    const nextErrors = {}

    if (!formValues.name.trim() || formValues.name.trim().length < 2) {
      nextErrors.name = 'Name must include at least 2 characters.'
    }

    if (!EMAIL_PATTERN.test(formValues.email.trim())) {
      nextErrors.email = 'A valid email address is required.'
    }

    if (!ROLES.includes(formValues.role)) {
      nextErrors.role = 'Please choose a supported role.'
    }

    if (!USER_STATUSES.includes(formValues.status)) {
      nextErrors.status = 'Please choose a valid status.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSaveUser = (event) => {
    event.preventDefault()

    if (!validateUserForm()) {
      return
    }

    if (editingUser) {
      updateUser(editingUser.id, formValues)
    } else {
      createUser(formValues)
    }

    setIsEditorOpen(false)
    setEditingUserId(null)
  }

  const requestDelete = (user) => {
    setDeleteCandidateId(user.id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteCandidate) {
      return
    }

    deleteUser(deleteCandidate.id)
    setIsDeleteModalOpen(false)
    setDeleteCandidateId(null)
  }

  const handleSortDirectionToggle = () => {
    setPage(1)
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
  }

  const renderEmptyState = () => (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/30 dark:text-slate-300">
      <p className="text-base font-semibold text-slate-700 dark:text-slate-100">
        No users found
      </p>
      <p className="mt-2">Try a different query or reset filters.</p>
      {search ? (
        <button
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={() => {
            setSearch('')
            setPage(1)
          }}
          type="button"
        >
          Clear search
        </button>
      ) : null}
    </div>
  )

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
            Users
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Manage identities, roles, and account status.
          </p>
        </div>

        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-500/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!canManageUsers}
          onClick={openCreateUserModal}
          type="button"
        >
          Add user
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          <label className="space-y-1 text-sm">
            <span className="block font-medium text-slate-700 dark:text-slate-200">
              Search users
            </span>
            <input
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Name, email, role, status"
              type="search"
              value={search}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="block font-medium text-slate-700 dark:text-slate-200">
              Sort by
            </span>
            <select
              className="h-11 w-full min-w-40 rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              onChange={(event) => {
                setSortKey(event.target.value)
                setPage(1)
              }}
              value={sortKey}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="status">Status</option>
            </select>
          </label>

          <div className="space-y-1 text-sm">
            <span className="block font-medium text-slate-700 dark:text-slate-200">
              Direction
            </span>
            <button
              className="inline-flex min-h-11 w-full min-w-32 items-center justify-center rounded-xl border border-slate-300 px-3 font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={handleSortDirectionToggle}
              type="button"
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="mt-4">{renderEmptyState()}</div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-300">
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Email</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Last active</th>
                    <th className="px-3 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                        {user.email}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                        {user.role}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
                              : user.status === 'Invited'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-100'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                        {daysAgoLabel(user.lastActiveAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                            disabled={!canEdit}
                            onClick={() => openEditModal(user)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-600 dark:text-rose-200 dark:hover:bg-rose-900/40"
                            disabled={!canDelete}
                            onClick={() => requestDelete(user)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 lg:hidden">
              {paginatedUsers.map((user) => (
                <article
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                  key={user.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                    </div>
                    <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200">
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>{user.status}</span>
                    <span aria-hidden="true">•</span>
                    <span>Last active {formatDateTime(user.lastActiveAt)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                      disabled={!canEdit}
                      onClick={() => openEditModal(user)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-rose-300 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-600 dark:text-rose-200 dark:hover:bg-rose-900/40"
                      disabled={!canDelete}
                      onClick={() => requestDelete(user)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <p>
            Showing {(safePage - 1) * pageSize + (paginatedUsers.length ? 1 : 0)}-
            {(safePage - 1) * pageSize + paginatedUsers.length} of{' '}
            {filteredUsers.length}
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border border-slate-300 px-3 font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={safePage === 1}
              onClick={() => setPage(Math.max(1, safePage - 1))}
              type="button"
            >
              Previous
            </button>
            <span className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border border-slate-200 px-3 font-semibold dark:border-slate-600">
              Page {safePage} / {totalPages}
            </span>
            <button
              className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border border-slate-300 px-3 font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={safePage >= totalPages}
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingUser ? `Edit ${editingUser.name}` : 'Create user'}
      >
        <form className="space-y-4" onSubmit={handleSaveUser}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
              Full name
            </span>
            <input
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              onChange={(event) =>
                setFormValues((current) => ({ ...current, name: event.target.value }))
              }
              required
              type="text"
              value={formValues.name}
            />
            {formErrors.name ? (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-300">
                {formErrors.name}
              </span>
            ) : null}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
              Email address
            </span>
            <input
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              onChange={(event) =>
                setFormValues((current) => ({ ...current, email: event.target.value }))
              }
              required
              type="email"
              value={formValues.email}
            />
            {formErrors.email ? (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-300">
                {formErrors.email}
              </span>
            ) : null}
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                Role
              </span>
              <select
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, role: event.target.value }))
                }
                value={formValues.role}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                Status
              </span>
              <select
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, status: event.target.value }))
                }
                value={formValues.status}
              >
                {USER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setIsEditorOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-500/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              type="submit"
            >
              {editingUser ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete user"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This action removes {deleteCandidate?.name || 'this user'} from the
          workspace. It cannot be undone in this demo session.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={() => setIsDeleteModalOpen(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            onClick={confirmDelete}
            type="button"
          >
            Delete user
          </button>
        </div>
      </Modal>
    </section>
  )
}

export default memo(UsersPage)
