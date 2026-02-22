import { useMemo } from 'react'
import { useAppActions, useAppState } from '../state/AppStateContext'
import { formatDateTime } from '../utils'

const invoices = [
  {
    id: 'INV-2026-001',
    amount: 6840,
    status: 'Paid',
    issuedAt: '2026-01-02T09:20:00.000Z',
  },
  {
    id: 'INV-2026-002',
    amount: 6711,
    status: 'Due',
    issuedAt: '2026-02-02T09:20:00.000Z',
  },
  {
    id: 'INV-2026-003',
    amount: 7098,
    status: 'Draft',
    issuedAt: '2026-03-02T09:20:00.000Z',
  },
]

export default function BillingPage() {
  const { users } = useAppState()
  const { appendAudit, pushToast } = useAppActions()

  const summary = useMemo(() => {
    const activeSeats = users.filter((user) => user.status === 'Active').length
    const unitPrice = 129
    const subtotal = activeSeats * unitPrice

    return {
      activeSeats,
      unitPrice,
      subtotal,
      enterpriseDiscount: subtotal * 0.12,
      netAmount: subtotal * 0.88,
    }
  }, [users])

  const handleExport = () => {
    appendAudit({
      actionType: 'billing',
      action: 'Exported billing summary',
      target: 'billing-report',
      details: `Exported billing report for ${summary.activeSeats} active seats.`,
    })
    pushToast('Billing report export queued.', 'success')
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
          Billing
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Administrative billing controls for plan usage, invoices, and exports.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Active seats
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary.activeSeats}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Unit price
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            ${summary.unitPrice}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Discount
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            -${Math.round(summary.enterpriseDiscount).toLocaleString()}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Net amount
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            ${Math.round(summary.netAmount).toLocaleString()}
          </p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent invoices
          </h2>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition hover:bg-primary-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            onClick={handleExport}
            type="button"
          >
            Export report
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                  Invoice
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                  Issued
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                  Amount
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-200">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {invoice.id}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {formatDateTime(invoice.issuedAt)}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        invoice.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
                          : invoice.status === 'Due'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
