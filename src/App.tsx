import { useState } from 'react'
import type { SimulationParams } from './types'
import { useSimulation } from './hooks/useSimulation'
import InputPanel from './components/InputPanel'
import ComparisonChart from './components/ComparisonChart'

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
    <div className="h-screen flex flex-col bg-amber-100 overflow-hidden">
      <main className="max-w-7xl w-full mx-auto px-4 py-4 flex flex-col flex-1 min-h-0">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 shrink-0">Saving types comparison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 flex-1 min-h-0">
          <InputPanel
            params={params}
            onParamsChange={setParams}
          />

          <ComparisonChart results={results} />
        </div>
      </main>
    </div>
  )
}

export default App



