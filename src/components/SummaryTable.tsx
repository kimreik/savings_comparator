import type { StrategyResult } from '../types'

interface SummaryTableProps {
  results: StrategyResult[]
}

function formatCurrency(value: number) {
  if (value === -1) return '💀 bankrupt'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SummaryTable({ results }: SummaryTableProps) {
  if (results.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          No strategies to compare yet
        </div>
      </section>
    )
  }

  const sorted = [...results].sort((a, b) => {
    if (a.finalNetWorth === -1 && b.finalNetWorth === -1) return 0
    if (a.finalNetWorth === -1) return 1
    if (b.finalNetWorth === -1) return -1
    return b.finalNetWorth - a.finalNetWorth
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">#</th>
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Strategy</th>
              <th className="text-right py-2 text-gray-500 font-medium">Final Net Worth</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.strategy.id} className="border-b border-gray-50">
                <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.strategy.color }}
                    />
                    <span className="font-medium text-gray-800">{r.strategy.name}</span>
                  </div>
                </td>
                <td className="py-2 text-right font-semibold text-gray-900">
                  {formatCurrency(r.finalNetWorth)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}


