import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

/**
 * Rent + Cash
 *
 * The person rents and saves all their "savings per month" as cash.
 * Rent is effectively ignored (income is indexed to inflation).
 * Each year, the accumulated cash loses purchasing power to inflation.
 *
 * Nominal cash grows by savingsPerMonth * 12 each year,
 * but the real (inflation-adjusted) value shrinks.
 */
const rentCash: SavingsStrategy = {
  id: 'rent-cash',
  name: 'rent + cash',
  nameKey: 'strategy.rentCash',
  color: '#6366f1', // indigo
  calculate(params: SimulationParams): YearlyResult[] {
    const { currentSavings, savingsPerMonth, inflationRate, planningHorizon, isDeposit } = params
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1

    const results: YearlyResult[] = []
    let cash = currentSavings

    for (let year = 0; year <= planningHorizon; year++) {
      results.push({ year, netWorth: Math.round(cash), cash: Math.round(cash), realEstate: 0, stocks: 0, debt: 0 })

      if (year === planningHorizon) continue

      for (let m = 0; m < 12; m++) {
        if (!isDeposit) {
          cash /= (1 + monthlyInflation)
        }
        cash += savingsPerMonth
      }
    }

    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[rent + cash]`, {
      finalRealValue: finalNetWorth,
      deposit: isDeposit,
    })

    return results
  },
}

registerStrategy(rentCash)

