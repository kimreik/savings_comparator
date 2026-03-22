import { useState } from 'react'
import type { SimulationParams, StrategyResult } from './types'
import { useSimulation } from './hooks/useSimulation'
import InputPanel from './components/InputPanel'
import ComparisonChart from './components/ComparisonChart'
import DetailChart from './components/DetailChart'
import { t } from './i18n'

// Ensure all strategy modules are loaded (they self-register on import)
import './strategies'

const DEFAULT_PARAMS: SimulationParams = {
  currentSavings: 200_000,
  isDeposit: false,
  savingsPerMonth: 5_000,
  investmentsRate: 14,
  incomeTax: false,
  planningHorizon: 30,
  realEstatePrice: 1_000_000,
  downPaymentPercent: 20,
  mortgageYears: 30,
  mortgageRate: 6,
  rentPerMonth: 4_000,
  inflationRate: 3,
}

function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const [mobileTab, setMobileTab] = useState<'chart' | 'settings'>('chart')
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const results = useSimulation(params)

  // Look up the selected strategy from fresh results so it updates when params change
  const selectedStrategy = selectedStrategyId
    ? results.find((r) => r.strategy.id === selectedStrategyId) ?? null
    : null

  const handleSelectStrategy = (result: StrategyResult) => {
    setSelectedStrategyId(result.strategy.id)
  }

  const handleBack = () => {
    setSelectedStrategyId(null)
  }

  return (
    <div className="h-dvh flex flex-col bg-amber-100 overflow-hidden" style={{ height: '100dvh' }}>
      {/* ── Mobile tab bar ── */}
      <div className="lg:hidden flex border-b border-amber-300/40 shrink-0">
        <button
          onClick={() => setMobileTab('chart')}
          className={`flex-1 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors ${
            mobileTab === 'chart'
              ? 'text-amber-800 border-b-2 border-amber-600 bg-white/30'
              : 'text-gray-500'
          }`}
        >
          {t('app.tab.chart')}
        </button>
        <button
          onClick={() => setMobileTab('settings')}
          className={`flex-1 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors ${
            mobileTab === 'settings'
              ? 'text-amber-800 border-b-2 border-amber-600 bg-white/30'
              : 'text-gray-500'
          }`}
        >
          {t('app.tab.settings')}
        </button>
      </div>

      <main className="max-w-7xl w-full mx-auto px-3 py-3 lg:px-4 lg:py-4 flex flex-col flex-1 min-h-0">
        <h1 className="hidden lg:block text-3xl font-bold text-gray-800 mb-4 shrink-0">
          {t('app.title')}
        </h1>

        {/* ── Desktop: side-by-side ── */}
        <div className="hidden lg:grid lg:grid-cols-[auto_1fr] gap-6 flex-1 min-h-0">
          <InputPanel params={params} onParamsChange={setParams} />
          {selectedStrategy ? (
            <DetailChart result={selectedStrategy} onBack={handleBack} />
          ) : (
            <ComparisonChart results={results} onSelectStrategy={handleSelectStrategy} />
          )}
        </div>

        {/* ── Mobile: tab content ── */}
        <div className="lg:hidden flex-1 min-h-0 flex flex-col">
          {mobileTab === 'chart' ? (
            selectedStrategy ? (
              <DetailChart result={selectedStrategy} onBack={handleBack} />
            ) : (
              <ComparisonChart results={results} onSelectStrategy={handleSelectStrategy} />
            )
          ) : (
            <div className="flex-1 overflow-y-auto overscroll-contain pb-6">
              <InputPanel params={params} onParamsChange={setParams} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
