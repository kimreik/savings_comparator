import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { StrategyResult } from '../types'

interface ComparisonChartProps {
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

export default function ComparisonChart({ results }: ComparisonChartProps) {
  if (results.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Add a savings strategy to see the comparison chart
        </div>
      </section>
    )
  }

  // Sort by final net worth descending so best strategy is on top
  // Bankrupt (-1) always goes to the bottom
  const sorted = [...results].sort((a, b) => {
    if (a.finalNetWorth === -1 && b.finalNetWorth === -1) return 0
    if (a.finalNetWorth === -1) return 1
    if (b.finalNetWorth === -1) return -1
    return b.finalNetWorth - a.finalNetWorth
  })

  const chartData = sorted.map((r) => ({
    name: r.finalNetWorth === -1 ? `💀 ${r.strategy.name}` : r.strategy.name,
    value: r.finalNetWorth === -1 ? 0 : r.finalNetWorth,
    color: r.finalNetWorth === -1 ? '#888' : r.strategy.color,
  }))

  const barHeight = 48
  const chartHeight = Math.max(chartData.length * barHeight + 40, 200)

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCurrency(v)}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={220}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}



