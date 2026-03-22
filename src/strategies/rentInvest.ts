import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

/**
 * Rent + Invest
 *
 * Keep renting (rent is indexed to inflation so ignored in real terms).
 * All savings go into a stock-market portfolio that grows at the
 * inflation-adjusted investment rate each month.
 * Current savings are invested immediately.
 * Income tax (20% on gains) applies if the checkbox is on.
 */
const rentInvest: SavingsStrategy = {
  id: 'rent-invest',
  name: 'rent + invest',
  nameKey: 'strategy.rentInvest',
  color: '#10b981', // emerald
  calculate(params: SimulationParams): YearlyResult[] {
    const {
      currentSavings,
      savingsPerMonth,
      investmentsRate,
      planningHorizon,
      inflationRate,
      incomeTax,
    } = params

    // Real monthly investment return (strip out inflation)
    const realAnnualReturn = (1 + investmentsRate / 100) / (1 + inflationRate / 100) - 1
    const realMonthlyReturn = Math.pow(1 + realAnnualReturn, 1 / 12) - 1

    const results: YearlyResult[] = []
    let portfolio = currentSavings  // invest everything from the start
    let totalContributed = currentSavings

    for (let year = 0; year <= planningHorizon; year++) {
      // Portfolio value after tax on gains
      const gain = Math.max(0, portfolio - totalContributed)
      const tax = incomeTax ? gain * 0.2 : 0
      const portfolioAfterTax = portfolio - tax

      results.push({ year, netWorth: Math.round(portfolioAfterTax), cash: 0, realEstate: 0, stocks: Math.round(portfolioAfterTax), debt: 0 })

      if (year === planningHorizon) continue

      for (let m = 0; m < 12; m++) {
        // Portfolio grows each month
        portfolio *= (1 + realMonthlyReturn)
        // Add monthly savings
        portfolio += savingsPerMonth
        totalContributed += savingsPerMonth
      }
    }

    const finalGain = Math.max(0, portfolio - totalContributed)
    const finalTax = incomeTax ? finalGain * 0.2 : 0
    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[rent + invest]`, {
      realAnnualReturn: `${(realAnnualReturn * 100).toFixed(2)}%`,
      portfolioAtEnd: Math.round(portfolio),
      totalContributed: Math.round(totalContributed),
      investmentGain: Math.round(finalGain),
      incomeTax: incomeTax ? `20% → ${Math.round(finalTax)}` : 'off',
      portfolioAfterTax: Math.round(portfolio - finalTax),
      finalNetWorth,
    })

    return results
  },
}

registerStrategy(rentInvest)

