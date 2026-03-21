import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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

/** Minimum bar width (px) to place the label inside */
const MIN_WIDTH_FOR_INSIDE = 180

function CustomBarLabel(props: any) {
  const { x, y, width, height, value } = props
  const isBankrupt = value?.startsWith('💀')

  if (isBankrupt) {
    // Bankrupt: always render label at the left edge
    return (
      <text
        x={(x ?? 0) + 6}
        y={y + height / 2}
        dy={4}
        textAnchor="start"
        style={{ fontSize: 13, fontWeight: 600, fill: '#991b1b' }}
      >
        {value}
      </text>
    )
  }

  const inside = (width ?? 0) >= MIN_WIDTH_FOR_INSIDE

  return (
    <text
      x={inside ? x + 8 : x + (width ?? 0) + 6}
      y={y + height / 2}
      dy={4}
      textAnchor="start"
      style={{
        fontSize: 13,
        fontWeight: 600,
        fill: inside ? '#fff' : '#374151',
        textShadow: inside ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {value}
    </text>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 text-sm">
      <span className="font-medium">{data.displayName}</span>
      <span className="text-gray-500 ml-2">
        {data.bankrupt ? '💀 bankrupt' : formatCurrency(data.value)}
      </span>
      {data.neverBought && !data.bankrupt && (
        <span className="text-gray-400 ml-1">🏚️ no house</span>
      )}
    </div>
  )
}

export default function ComparisonChart({ results }: ComparisonChartProps) {
  if (results.length === 0) {
    return (
      <section className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-6">
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

  const chartData = sorted.map((r) => {
    const bankrupt = r.finalNetWorth === -1
    const neverBought = r.neverBought === true
    let name = r.strategy.name
    if (bankrupt) name = `💀 ${name}`
    else if (neverBought) name = `🏚️ ${name}`

    return {
      name,
      displayName: r.strategy.name,
      value: bankrupt ? 0 : r.finalNetWorth,
      bankrupt,
      neverBought,
      color: bankrupt ? '#e5e7eb' : r.strategy.color,
    }
  })

  const barHeight = 40
  const chartHeight = Math.max(chartData.length * barHeight + 60, 200)

  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-6">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 20, left: 5 }}
          barCategoryGap="20%"
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCurrency(v)}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28} minPointSize={2}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
            <LabelList dataKey="name" content={CustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}



