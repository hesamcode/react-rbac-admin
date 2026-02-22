import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        The route you requested does not exist in this demo workspace.
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-500/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        to="/overview"
      >
        Back to overview
      </Link>
    </section>
  )
}
