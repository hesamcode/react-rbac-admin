import { NavLink } from 'react-router-dom'

const linkClassName = ({ isActive }) =>
  `inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
    isActive
      ? 'bg-primary-500 text-white shadow-sm'
      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700'
  }`

export default function RootLayout({
  canManageBilling,
  children,
  density,
  isAuthenticated,
  onLogout,
  onToggleTheme,
  session,
  theme,
}) {
  const shellSpacing =
    density === 'compact'
      ? 'px-2 pb-4 pt-3 sm:px-3 lg:px-5'
      : 'px-3 pb-6 pt-4 sm:px-4 lg:px-6'

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_48%)] bg-bg-light text-text-light dark:bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.2),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.15),_transparent_50%)] dark:bg-bg-dark dark:text-text-dark">
      <div className={`mx-auto flex min-h-screen w-full max-w-7xl flex-col ${shellSpacing}`}>
        <header className="rounded-2xl border border-slate-200/80 bg-surface-light/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-surface-dark/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                Enterprise SaaS Demo
              </p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                RBAC Admin Console
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={onToggleTheme}
                type="button"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              {isAuthenticated ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-300 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-600 dark:text-rose-200 dark:hover:bg-rose-900/40"
                  onClick={onLogout}
                  type="button"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            {isAuthenticated ? (
              <>
                <NavLink className={linkClassName} to="/overview">
                  Overview
                </NavLink>
                <NavLink className={linkClassName} to="/users">
                  Users
                </NavLink>
                {canManageBilling ? (
                  <NavLink className={linkClassName} to="/billing">
                    Billing
                  </NavLink>
                ) : null}
                <NavLink className={linkClassName} to="/audit">
                  Audit
                </NavLink>
                <NavLink className={linkClassName} to="/settings">
                  Settings
                </NavLink>
                <NavLink className={linkClassName} to="/about">
                  About
                </NavLink>
              </>
            ) : (
              <>
                <NavLink className={linkClassName} to="/login">
                  Login
                </NavLink>
                <NavLink className={linkClassName} to="/about">
                  About
                </NavLink>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              Signed in as {session?.email} ({session?.role})
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              No active session.
            </p>
          )}
        </header>

        <main className="mt-6 flex-1">{children}</main>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-base text-slate-700 opacity-80 dark:border-slate-700 dark:text-slate-200">
          Built by{' '}
          <a
            aria-label="Visit Hesam Khorshidi portfolio website"
            className="underline transition hover:opacity-100 focus-visible:opacity-100"
            href="https://hesamkhorshidi.github.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            Hesam Khorshidi
          </a>
        </footer>
      </div>
    </div>
  )
}
