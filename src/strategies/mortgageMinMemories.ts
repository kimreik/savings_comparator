import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

/**
 * Calculate fixed monthly mortgage payment (annuity formula).
 */
function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Mortgage min payment + Memories
 *
 * All monetary flows (salary, rent, mortgage payment) are assumed to be indexed
 * to inflation, so we work entirely in real (today's money) terms.
 * The only inflation effect: idle cash (non-deposit) loses value each year.
 *
 * Phase 1 — saving for down payment:
 *   Each year, add savingsPerMonth * 12 to cash. Cash erodes by inflation if not deposit.
 *   Once cash >= downPayment, buy the property.
 *
 * Phase 2 — mortgage:
 *   Stop paying rent → monthly budget becomes savingsPerMonth + rentPerMonth.
 *   Pay the fixed monthly mortgage payment from that budget.
 *   If budget < payment, dip into cash. If cash runs out → bankrupt (netWorth = -1).
 *   "Memories" = any surplus is spent, not saved.
 *
 * Net worth = realEstatePrice + cash − remainingMortgage  (all in real terms)
 */
const mortgageMinMemories: SavingsStrategy = {
  id: 'mortgage-min-memories',
  name: 'mortgage min payment + memories',
  color: '#87CEEB', // light blue
  calculate(params: SimulationParams): YearlyResult[] {
    const {
      currentSavings,
      savingsPerMonth,
      planningHorizon,
      realEstatePrice,
      downPaymentPercent,
      mortgageYears,
      mortgageRate,
      rentPerMonth,
      isDeposit,
      inflationRate,
    } = params

    const downPayment = realEstatePrice * (downPaymentPercent / 100)
    const loanAmount = realEstatePrice - downPayment
    const monthlyPayment = calcMonthlyPayment(loanAmount, mortgageRate, mortgageYears)
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1

    const results: YearlyResult[] = []
    let cash = currentSavings
    let hasMortgage = false
    let paymentsRemaining = 0
    let bankrupt = false
    let purchaseYear: number | null = null
    let purchaseMonth: number | null = null

    for (let year = 0; year <= planningHorizon; year++) {
      // --- Snapshot net worth at the start of this year ---
      if (bankrupt) {
        results.push({ year, netWorth: -1 })
      } else if (!hasMortgage) {
        results.push({ year, netWorth: Math.round(cash) })
      } else {
        const remainingDebt = monthlyPayment * paymentsRemaining
        results.push({ year, netWorth: Math.round(realEstatePrice + cash - remainingDebt) })
      }

      if (year === planningHorizon || bankrupt) continue

      // --- Simulate 12 months ---
      for (let m = 0; m < 12; m++) {
        if (bankrupt) break

        if (!hasMortgage) {
          cash += savingsPerMonth
          if (!isDeposit) {
            cash /= (1 + monthlyInflation)
          }
          if (cash >= downPayment) {
            cash -= downPayment
            hasMortgage = true
            paymentsRemaining = mortgageYears * 12
            purchaseYear = year
            purchaseMonth = m
          }
        } else {
          if (paymentsRemaining > 0) {
            const monthlyBudget = savingsPerMonth + rentPerMonth
            if (monthlyBudget >= monthlyPayment) {
              paymentsRemaining--
            } else {
              const shortfall = monthlyPayment - monthlyBudget
              cash -= shortfall
              paymentsRemaining--
              if (cash < 0) {
                bankrupt = true
                break
              }
            }
          }
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
        }
      }
    }

    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage min + memories]`, {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      monthlyBudgetAfterBuy: savingsPerMonth + rentPerMonth,
      monthlySurplus: Math.round(savingsPerMonth + rentPerMonth - monthlyPayment),
      purchasedAt: purchaseYear !== null ? `year ${purchaseYear}, month ${purchaseMonth}` : 'never',
      realEstateValue: realEstatePrice, // constant in real terms (grows >= inflation)
      remainingDebt: Math.round(monthlyPayment * paymentsRemaining),
      cashAtEnd: Math.round(cash),
      paymentsRemaining,
      bankrupt,
      finalNetWorth,
    })

    return results
  },
}

registerStrategy(mortgageMinMemories)


