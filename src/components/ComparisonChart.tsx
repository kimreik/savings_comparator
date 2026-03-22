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
import { useEffect, useState } from 'react'
import type { StrategyResult } from '../types'
import { t } from '../i18n'
import type { TranslationKey } from '../i18n'

interface ComparisonChartProps {
  results: StrategyResult[]
  onSelectStrategy?: (result: StrategyResult) => void
}

function formatCurrency(value: number) {
  if (value === -1) return '💀 bankrupt'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyCompact(value: number) {
  if (value === -1) return '💀'
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

/** Minimum bar width (px) to place the label inside */
const MIN_WIDTH_FOR_INSIDE = 140

function CustomBarLabel(props: any) {
  const { x, y, width, height, value, fontSize = 16 } = props
  const isBankrupt = value?.startsWith('💀')

  if (isBankrupt) {
    return (
      <text
        x={(x ?? 0) + 6}
        y={y + height / 2}
        dy={4}
        textAnchor="start"
        style={{ fontSize, fontWeight: 600, fill: '#991b1b' }}
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
        fontSize,
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 px-2 py-1.5 text-sm lg:px-3 lg:py-2 lg:text-base">
      <span className="font-medium">{data.displayName}</span>
      <span className="text-gray-500 ml-2">
        {data.bankrupt ? t('chart.bankrupt') : formatCurrency(data.value)}
      </span>
      {data.neverBought && !data.bankrupt && (
        <span className="text-gray-400 ml-1">{t('chart.noHouse')}</span>
      )}
    </div>
  )
}

export default function ComparisonChart({ results, onSelectStrategy }: ComparisonChartProps) {
  const isMobile = useIsMobile(1024)

  if (results.length === 0) {
    return (
      <section className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-4 lg:p-6 flex-1 min-h-0">
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          {t('chart.empty')}
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
    const displayName = r.strategy.nameKey
      ? t(r.strategy.nameKey as TranslationKey)
      : r.strategy.name
    let name = displayName
    if (bankrupt) name = `💀 ${displayName}`
    else if (neverBought) name = `❌🏚️ ${displayName}`

    return {
      name,
      displayName,
      strategyId: r.strategy.id,
      value: bankrupt ? 0 : r.finalNetWorth,
      bankrupt,
      neverBought,
      color: bankrupt ? '#e5e7eb' : r.strategy.color,
    }
  })

  const handleBarClick = (data: any) => {
    if (!onSelectStrategy) return
    const strategyId = data?.strategyId
    const matched = results.find((r) => r.strategy.id === strategyId)
    if (matched) onSelectStrategy(matched)
  }

  const labelFontSize = isMobile ? 12 : 16
  const axisFontSize = isMobile ? 10 : 13
  const xFormatter = isMobile ? formatCurrencyCompact : formatCurrency

  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-3 lg:p-6 flex-1 min-h-0 flex flex-col outline-none">
      <div className="flex-1 min-h-0" style={{ outline: 'none' }} tabIndex={-1}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={isMobile
              ? { top: 2, right: 8, bottom: 16, left: 2 }
              : { top: 5, right: 20, bottom: 20, left: 5 }
            }
            barCategoryGap="8%"
            style={{ outline: 'none' }}
          >
            <XAxis
              type="number"
              tickFormatter={xFormatter}
              tick={{ fontSize: axisFontSize }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={2} style={{ cursor: onSelectStrategy ? 'pointer' : 'default' }}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} onClick={() => handleBarClick(entry)} />
              ))}
              <LabelList dataKey="name" content={(props: any) => <CustomBarLabel {...props} fontSize={labelFontSize} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}






