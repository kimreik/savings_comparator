import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

const rentMemories: SavingsStrategy = {
  id: 'rent-memories',
  name: 'rent + memories',
  color: '#9b59b6',
  calculate(params: SimulationParams): YearlyResult[] {
    const { currentSavings, inflationRate, planningHorizon, isDeposit } = params
    const annualInflation = inflationRate / 100

    const data: YearlyResult[] = []
    for (let year = 0; year <= planningHorizon; year++) {
      const realValue = isDeposit
        ? currentSavings
        : currentSavings / Math.pow(1 + annualInflation, year)
      data.push({ year, netWorth: Math.round(realValue) })
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

