import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Mortgage min payment + Cash
 *
 * Same as "mortgage min payment + memories", but any monthly surplus
 * after paying the mortgage is saved as cash (added to current savings).
 * If deposit is on, all cash holds real value. Otherwise it erodes by inflation.
 */
const mortgageMinCash: SavingsStrategy = {
  id: 'mortgage-min-cash',
  name: 'mortgage min payment + cash',
  color: '#FF8C00', // orange
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
    let totalPaidToBank = 0

    for (let year = 0; year <= planningHorizon; year++) {
      if (bankrupt) {
        results.push({ year, netWorth: -1 })
      } else if (!hasMortgage) {
        results.push({ year, netWorth: Math.round(cash) })
      } else {
        const remainingDebt = monthlyPayment * paymentsRemaining
        results.push({ year, netWorth: Math.round(realEstatePrice + cash - remainingDebt) })
      }

      if (year === planningHorizon || bankrupt) continue

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
          const monthlyBudget = savingsPerMonth + rentPerMonth
          if (paymentsRemaining > 0) {
            if (monthlyBudget >= monthlyPayment) {
              cash += (monthlyBudget - monthlyPayment)
              paymentsRemaining--
              totalPaidToBank += monthlyPayment
            } else {
              const shortfall = monthlyPayment - monthlyBudget
              cash -= shortfall
              paymentsRemaining--
              totalPaidToBank += monthlyPayment
              if (cash < 0) {
                bankrupt = true
                break
              }
            }
          } else {
            // Mortgage paid off — save the entire budget
            cash += monthlyBudget
          }
          // Cash erodes by inflation if not deposit
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
        }
      }
    }

    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage min + cash]`, {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      monthlyBudgetAfterBuy: savingsPerMonth + rentPerMonth,
      monthlySurplus: Math.round(savingsPerMonth + rentPerMonth - monthlyPayment),
      purchasedAt: purchaseYear !== null ? `year ${purchaseYear}, month ${purchaseMonth}` : 'never',
      realEstateValue: realEstatePrice,
      remainingDebt: Math.round(monthlyPayment * paymentsRemaining),
      cashAtEnd: Math.round(cash),
      paymentsRemaining,
      bankrupt,
      totalPaidToBank: Math.round(totalPaidToBank),
      finalNetWorth,
    })

    return results
  },
}

registerStrategy(mortgageMinCash)

