export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
        About This Project
      </h1>
      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
        This project was designed and developed by HesamCode as part of a professional portfolio demonstrating advanced front-end engineering, product architecture, and UI/UX expertise.
      </p>
      <div className="text-base text-slate-700 dark:text-slate-200">
        <p>
          Built by{' '}
          <a
            aria-label="Visit HesamCode portfolio website"
            className="underline transition hover:opacity-100 focus-visible:opacity-100"
            href="https://hesamcode.github.io"
            rel="noopener noreferrer"
            target="_blank"
          >
            HesamCode
          </a>
        </p>
      </div>
    </section>
  )
}
