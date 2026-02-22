import { useNavigate } from 'react-router-dom'

export default function AccessDeniedPage({ attemptedPath = '' }) {
  const navigate = useNavigate()

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
      <h1 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
        Access Denied
      </h1>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        Your current role does not have permission to open
        {attemptedPath ? ` ${attemptedPath}` : ' this route'}.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          onClick={() => navigate('/overview')}
          type="button"
        >
          Go to overview
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-500 px-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-amber-300 dark:text-amber-100 dark:hover:bg-amber-900/40"
          onClick={() => navigate('/login')}
          type="button"
        >
          Switch role
        </button>
      </div>
    </section>
  )
}
