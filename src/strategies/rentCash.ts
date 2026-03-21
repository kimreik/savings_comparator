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
  color: '#3498db',
  calculate(params: SimulationParams): YearlyResult[] {
    const { currentSavings, savingsPerMonth, inflationRate, planningHorizon, isDeposit } = params
    const annualInflation = inflationRate / 100
    const yearlySavings = savingsPerMonth * 12

    const results: YearlyResult[] = []
    let nominalNewCash = 0

    for (let year = 0; year <= planningHorizon; year++) {
      const realInitial = isDeposit
        ? currentSavings
        : currentSavings / Math.pow(1 + annualInflation, year)

      const realNewCash = nominalNewCash / Math.pow(1 + annualInflation, year)

      results.push({ year, netWorth: Math.round(realInitial + realNewCash) })

      nominalNewCash += yearlySavings
    }

    const finalNominal = currentSavings + yearlySavings * planningHorizon
    const finalReal = results[results.length - 1].netWorth
    console.log(`[rent + cash]`, {
      totalNominalSaved: finalNominal,
      finalRealValue: finalReal,
      lostToInflation: finalNominal - finalReal,
      deposit: isDeposit,
    })

    return results
  },
}

registerStrategy(rentCash)

