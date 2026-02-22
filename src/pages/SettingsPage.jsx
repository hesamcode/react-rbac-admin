import { useState } from 'react'
import Modal from '../components/Modal'
import { useAppActions, useAppState } from '../state/AppStateContext'

export default function SettingsPage() {
  const { preferences } = useAppState()
  const { updatePreference, resetDemoData } = useAppActions()

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  const toggleTheme = () => {
    updatePreference('theme', preferences.theme === 'dark' ? 'light' : 'dark')
  }

  const toggleDensity = () => {
    updatePreference(
      'density',
      preferences.density === 'compact' ? 'comfortable' : 'compact',
    )
  }

  const handleResetData = () => {
    resetDemoData()
    setIsResetModalOpen(false)
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Personalize dashboard experience and manage demo workspace data.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Theme preference
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Active: {preferences.theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </p>
          </div>
          <button
            aria-pressed={preferences.theme === 'dark'}
            className="inline-flex min-h-11 min-w-32 items-center justify-center rounded-xl border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition hover:bg-primary-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            onClick={toggleTheme}
            type="button"
          >
            Toggle theme
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Density
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Active: {preferences.density === 'compact' ? 'Compact' : 'Comfortable'}
            </p>
          </div>
          <button
            aria-pressed={preferences.density === 'compact'}
            className="inline-flex min-h-11 min-w-32 items-center justify-center rounded-xl border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition hover:bg-primary-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            onClick={toggleDensity}
            type="button"
          >
            Toggle density
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 p-3 dark:border-rose-700">
          <div>
            <h2 className="text-base font-semibold text-rose-700 dark:text-rose-200">
              Reset demo data
            </h2>
            <p className="text-sm text-rose-600 dark:text-rose-300">
              This resets users and seed records without changing your login session.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 min-w-32 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            onClick={() => setIsResetModalOpen(true)}
            type="button"
          >
            Reset data
          </button>
        </div>
      </section>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset demo data"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Confirm reset of users and seeded records. Existing audit history will be
          preserved, and a reset event will be logged.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={() => setIsResetModalOpen(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            onClick={handleResetData}
            type="button"
          >
            Confirm reset
          </button>
        </div>
      </Modal>
    </section>
  )
}
