import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERMISSIONS, PERMISSION_MATRIX, ROLES } from '../rbac'
import { useAppActions } from '../state/AppStateContext'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAppActions()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Admin')
  const [error, setError] = useState('')

  const selectedPermissions = useMemo(
    () => PERMISSION_MATRIX[role] || {},
    [role],
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalized = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalized)) {
      setError('Please provide a valid business email address.')
      return
    }

    setError('')
    login(normalized, role)
    navigate('/overview', { replace: true })
  }

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/60 sm:p-6 dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-slate-900/20">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-500">
            Welcome
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
            Sign in to the RBAC Admin Console
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            This is a backend-free demo workspace. Choose a role to simulate
            enterprise access levels.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="login-email"
              >
                Work Email
              </label>
              <input
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="login-role"
              >
                Simulated Role
              </label>
              <select
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 outline-none transition focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                id="login-role"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                {ROLES.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-500/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              type="submit"
            >
              Enter Console
            </button>
          </form>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {role} permissions
          </h2>
          <ul className="mt-3 space-y-2">
            {PERMISSIONS.map((permission) => {
              const enabled = Boolean(selectedPermissions[permission])
              return (
                <li
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  key={permission}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {permission}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      enabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                    }`}
                  >
                    {enabled ? 'Allowed' : 'No access'}
                  </span>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </section>
  )
}
