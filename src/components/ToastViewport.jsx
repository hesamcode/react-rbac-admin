const toneStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100',
}

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div
      aria-atomic="false"
      aria-live="polite"
      className="pointer-events-none fixed right-3 top-3 z-50 flex w-[min(92vw,24rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <article
          className={`pointer-events-auto rounded-xl border px-3 py-3 shadow-lg ${toneStyles[toast.tone] || toneStyles.info}`}
          key={toast.id}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm hover:bg-slate-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:hover:bg-slate-100/15"
              onClick={() => onDismiss(toast.id)}
              type="button"
            >
              <span aria-hidden="true">×</span>
              <span className="sr-only">Dismiss notification</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
