import { useMemo } from 'react'
import { useAppState } from '../state/AppStateContext'

const KPI_CARD_STYLES = [
  'from-primary-500/15 to-primary-500/5',
  'from-accent-500/20 to-accent-500/5',
  'from-emerald-500/15 to-emerald-500/5',
  'from-amber-500/15 to-amber-500/5',
]

const lastSevenDayBuckets = (auditLogs) => {
  const labels = []
  const counts = []
  const map = new Map()

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)

    const key = date.toISOString().slice(0, 10)
    const label = date.toLocaleDateString('en-US', {
      weekday: 'short',
    })

    labels.push(label)
    map.set(key, 0)
  }

  auditLogs.forEach((entry) => {
    const key = entry.timestamp?.slice(0, 10)
    if (!key || !map.has(key)) {
      return
    }

    map.set(key, map.get(key) + 1)
  })

  for (const value of map.values()) {
    counts.push(value)
  }

  return { labels, counts }
}

const buildLinePath = (values, width, height) => {
  const maxValue = Math.max(...values, 1)
  const stepX = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((value, index) => {
      const x = index * stepX
      const y = height - (value / maxValue) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export default function OverviewPage() {
  const { users, auditLogs } = useAppState()

  const kpis = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === 'Active').length
    const managers = users.filter((user) => user.role === 'Manager').length
    const actionsToday = auditLogs.filter(
      (entry) => entry.timestamp?.slice(0, 10) === new Date().toISOString().slice(0, 10),
    ).length
    const monthlyRevenue = activeUsers * 129

    return [
      {
        id: 'kpi-users',
        label: 'Active Users',
        value: activeUsers,
        detail: `${users.length} total seats`,
      },
      {
        id: 'kpi-managers',
        label: 'Managers',
        value: managers,
        detail: 'Cross-team role holders',
      },
      {
        id: 'kpi-actions',
        label: 'Actions Today',
        value: actionsToday,
        detail: 'Audit events in last 24h',
      },
      {
        id: 'kpi-revenue',
        label: 'MRR Estimate',
        value: `$${monthlyRevenue.toLocaleString()}`,
        detail: 'Demo financial projection',
      },
    ]
  }, [auditLogs, users])

  const chartData = useMemo(() => lastSevenDayBuckets(auditLogs), [auditLogs])

  const chartPath = useMemo(
    () => buildLinePath(chartData.counts, 600, 150),
    [chartData.counts],
  )

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
          Workspace Overview
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          High-level operational health for your RBAC-enabled workspace.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <article
            className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${KPI_CARD_STYLES[index % KPI_CARD_STYLES.length]} p-4 dark:border-slate-700`}
            key={kpi.id}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {kpi.value}
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{kpi.detail}</p>
          </article>
        ))}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Audit Activity Trend
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Last 7 days of recorded actions
            </p>
          </div>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200">
            {chartData.counts.reduce((sum, value) => sum + value, 0)} total events
          </span>
        </div>

        <div className="overflow-x-auto">
          <svg
            aria-label="Audit activity chart for last seven days"
            className="min-w-[640px]"
            role="img"
            viewBox="0 0 640 240"
          >
            <defs>
              <linearGradient id="auditLineGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g transform="translate(20 20)">
              {[0, 1, 2, 3, 4].map((lineIndex) => {
                const y = 150 - lineIndex * 37.5
                return (
                  <line
                    key={`grid-${lineIndex}`}
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    x1="0"
                    x2="600"
                    y1={y}
                    y2={y}
                  />
                )
              })}

              <path
                d={`${chartPath} L 600 150 L 0 150 Z`}
                fill="url(#auditLineGradient)"
                transform="translate(0 0)"
              />
              <path
                d={chartPath}
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="3"
              />

              {chartData.counts.map((value, index) => {
                const maxValue = Math.max(...chartData.counts, 1)
                const x = (index * 600) / (chartData.counts.length - 1)
                const y = 150 - (value / maxValue) * 150

                return (
                  <g key={`point-${chartData.labels[index]}`}>
                    <circle
                      cx={x}
                      cy={y}
                      fill="var(--color-accent-500)"
                      r="5"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      fill="currentColor"
                      fontSize="11"
                      textAnchor="middle"
                      x={x}
                      y="182"
                    >
                      {chartData.labels[index]}
                    </text>
                    <text
                      fill="currentColor"
                      fontSize="10"
                      textAnchor="middle"
                      x={x}
                      y={Math.max(y - 10, 10)}
                    >
                      {value}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      </article>
    </section>
  )
}
