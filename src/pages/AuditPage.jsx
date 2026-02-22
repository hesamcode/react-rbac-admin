import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppStateContext'
import { formatDateTime } from '../utils'

export default function AuditPage() {
  const { auditLogs } = useAppState()
  const [actorFilter, setActorFilter] = useState('all')
  const [actionTypeFilter, setActionTypeFilter] = useState('all')

  const actors = useMemo(() => {
    return Array.from(new Set(auditLogs.map((entry) => entry.actor))).sort()
  }, [auditLogs])

  const actionTypes = useMemo(() => {
    return Array.from(new Set(auditLogs.map((entry) => entry.actionType))).sort()
  }, [auditLogs])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((entry) => {
      const actorMatch = actorFilter === 'all' || entry.actor === actorFilter
      const actionTypeMatch =
        actionTypeFilter === 'all' || entry.actionType === actionTypeFilter

      return actorMatch && actionTypeMatch
    })
  }, [actionTypeFilter, actorFilter, auditLogs])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
          Audit Trail
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Searchable event history for authentication, users, billing, and settings.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800">
        <label className="space-y-1 text-sm">
          <span className="block font-medium text-slate-700 dark:text-slate-200">Filter by user</span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            onChange={(event) => setActorFilter(event.target.value)}
            value={actorFilter}
          >
            <option value="all">All users</option>
            {actors.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium text-slate-700 dark:text-slate-200">
            Filter by action type
          </span>
          <select
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            onChange={(event) => setActionTypeFilter(event.target.value)}
            value={actionTypeFilter}
          >
            <option value="all">All action types</option>
            {actionTypes.map((actionType) => (
              <option key={actionType} value={actionType}>
                {actionType}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredLogs.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Time
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Actor
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Type
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Action
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Target
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700 dark:text-slate-200">
                      {formatDateTime(entry.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-900 dark:text-slate-100">
                      {entry.actor}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200">
                        {entry.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{entry.action}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{entry.target}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/30 dark:text-slate-300">
          No audit entries match the current filters.
        </div>
      )}
    </section>
  )
}
