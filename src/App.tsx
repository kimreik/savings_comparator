import { useState } from 'react'
import type { SimulationParams } from './types'
import { useSimulation } from './hooks/useSimulation'
import InputPanel from './components/InputPanel'
import ComparisonChart from './components/ComparisonChart'
import SummaryTable from './components/SummaryTable'

// Ensure all strategy modules are loaded (they self-register on import)
import './strategies'

const DEFAULT_PARAMS: SimulationParams = {
  currentSavings: 200_000,
  isDeposit: false,
  savingsPerMonth: 5_000,
  investmentsRate: 10,
  incomeTax: false,
  planningHorizon: 30,
  realEstatePrice: 1_200_000,
  downPaymentPercent: 20,
  mortgageYears: 30,
  mortgageRate: 6,
  rentPerMonth: 4_000,
  inflationRate: 3,
}

function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const results = useSimulation(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Saving types comparison</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
          <InputPanel
            params={params}
            onParamsChange={setParams}
          />

          <div className="space-y-8">
            <ComparisonChart results={results} />
            <SummaryTable results={results} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App



