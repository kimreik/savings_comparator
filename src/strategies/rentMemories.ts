import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

const rentMemories: SavingsStrategy = {
  id: 'rent-memories',
  name: 'rent + memories',
  nameKey: 'strategy.rentMemories',
  color: '#a78bfa', // violet
  calculate(params: SimulationParams): YearlyResult[] {
    const { currentSavings, inflationRate, planningHorizon, isDeposit } = params
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1

    const data: YearlyResult[] = []
    let cash = currentSavings

    for (let year = 0; year <= planningHorizon; year++) {
      data.push({ year, netWorth: Math.round(cash) })

      if (year === planningHorizon) continue

      for (let m = 0; m < 12; m++) {
        if (!isDeposit) {
          cash /= (1 + monthlyInflation)
        }
      }
    }

    const finalValue = data[data.length - 1].netWorth
    console.log(`[rent + memories]`, {
      initialSavings: currentSavings,
      deposit: isDeposit,
      finalRealValue: finalValue,
      lostToInflation: currentSavings - finalValue,
    })

    return data
  },
}

registerStrategy(rentMemories)

