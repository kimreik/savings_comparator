import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useEffect, useState } from 'react'
import type { StrategyResult } from '../types'
import { t } from '../i18n'
import type { TranslationKey } from '../i18n'

interface DetailChartProps {
  result: StrategyResult
  onBack: () => void
}

function useIsMobile(breakpoint = 1024) {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(Math.round(value))
}

const ASSET_COLORS = {
  cash: '#6366f1',       // indigo
  equity: '#a855f7',     // purple (owned portion of real estate)
  stocks: '#eab308',     // yellow
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 text-sm">
      <div className="font-semibold mb-1">{t('chart.year')} {label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DetailChart({ result, onBack }: DetailChartProps) {
  const isMobile = useIsMobile()
  const displayName = result.strategy.nameKey
    ? t(result.strategy.nameKey as TranslationKey)
    : result.strategy.name

  const bankrupt = result.finalNetWorth === -1

  // Build chart data from yearly results
  const chartData = result.data.map((yr) => ({
    year: yr.year,
    cash: yr.cash ?? 0,
    equity: Math.max(0, (yr.realEstate ?? 0) - (yr.debt ?? 0)),
    stocks: yr.stocks ?? 0,
  }))

  // Determine which asset types are present and sort by final value (largest on bottom)
  const lastPoint = chartData[chartData.length - 1] ?? { cash: 0, equity: 0, stocks: 0 }

  type AssetKey = 'cash' | 'equity' | 'stocks'
  const assetDefs: { key: AssetKey; nameKey: TranslationKey; color: string }[] = [
    { key: 'cash', nameKey: 'chart.cash', color: ASSET_COLORS.cash },
    { key: 'equity', nameKey: 'chart.realEstate', color: ASSET_COLORS.equity },
    { key: 'stocks', nameKey: 'chart.stocks', color: ASSET_COLORS.stocks },
  ]

  // Sort by growth (final − first non-zero). Most static assets on bottom (stable base),
  // fastest-growing on top so their curve shape is clearly visible.
  const orderedAssets = assetDefs
    .filter((a) => chartData.some((d) => d[a.key] > 0))
    .sort((a, b) => {
      const firstNonZero = (key: AssetKey) => (chartData.find((d) => d[key] > 0)?.[key] ?? 0)
      const growthA = lastPoint[a.key] - firstNonZero(a.key)
      const growthB = lastPoint[b.key] - firstNonZero(b.key)
      return growthA - growthB  // ascending: least growth at bottom, most growth on top
    })

  const xFormatter = isMobile ? formatCurrencyCompact : formatCurrency

  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-3 lg:p-6 flex-1 min-h-0 flex flex-col outline-none">
      {/* Header with back button and strategy name */}
      <div className="flex items-center gap-2 mb-2 lg:mb-4 shrink-0">
        <button
          onClick={onBack}
          className="text-3xl lg:text-4xl font-bold text-gray-600 hover:text-gray-900 transition-colors px-1 py-0.5 -ml-1 rounded-lg hover:bg-amber-100 leading-none"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-lg lg:text-2xl font-bold text-gray-800 truncate">
          {bankrupt ? `💀 ${displayName}` : displayName}
        </h2>
      </div>

      {bankrupt ? (
        <div className="flex-1 flex items-center justify-center text-2xl text-red-600 font-bold">
          💀 {t('chart.bankrupt')}
        </div>
      ) : (
        <div className="flex-1 min-h-0" style={{ outline: 'none' }} tabIndex={-1}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={isMobile
                ? { top: 5, right: 5, bottom: 5, left: 0 }
                : { top: 10, right: 20, bottom: 10, left: 10 }
              }
              style={{ outline: 'none' }}
            >
              <XAxis
                dataKey="year"
                tick={{ fontSize: isMobile ? 10 : 13 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                label={isMobile ? undefined : { value: t('chart.year'), position: 'insideBottomRight', offset: -5, fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis
                tickFormatter={xFormatter}
                tick={{ fontSize: isMobile ? 10 : 13 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                width={isMobile ? 45 : 70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 11 : 14 }}
              />

              {/* Stack assets — largest final value on bottom */}
              {orderedAssets.map((asset) => (
                <Area
                  key={asset.key}
                  type="monotone"
                  dataKey={asset.key}
                  name={t(asset.nameKey)}
                  stackId="assets"
                  stroke={asset.color}
                  fill={asset.color}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

