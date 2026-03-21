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
    const monthlyRate = mortgageRate / 100 / 12

    const results: YearlyResult[] = []
    let cash = currentSavings
    let hasMortgage = false
    let remainingDebt = 0
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
        results.push({ year, netWorth: Math.round(realEstatePrice + cash - remainingDebt) })
      }

      if (year === planningHorizon || bankrupt) continue

      for (let m = 0; m < 12; m++) {
        if (bankrupt) break

        if (!hasMortgage) {
          if (!isDeposit) {
            cash /= (1 + monthlyInflation)
          }
          cash += savingsPerMonth
          if (cash >= downPayment) {
            cash -= downPayment
            hasMortgage = true
            remainingDebt = loanAmount
            purchaseYear = year
            purchaseMonth = m
          }
        } else {
          // Erode existing cash first (month passes)
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
          const monthlyBudget = savingsPerMonth + rentPerMonth
          if (remainingDebt > 0) {
            const interestThisMonth = remainingDebt * monthlyRate
            if (monthlyBudget >= monthlyPayment) {
              cash += (monthlyBudget - monthlyPayment)
              const principalPaid = monthlyPayment - interestThisMonth
              remainingDebt -= principalPaid
              totalPaidToBank += monthlyPayment
            } else {
              const shortfall = monthlyPayment - monthlyBudget
              cash -= shortfall
              const principalPaid = monthlyPayment - interestThisMonth
              remainingDebt -= principalPaid
              totalPaidToBank += monthlyPayment
              if (cash < 0) {
                bankrupt = true
                break
              }
            }
            if (remainingDebt <= 0.01) {
              remainingDebt = 0
            }
          } else {
            // Mortgage paid off — save the entire budget
            cash += monthlyBudget
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
      remainingDebt: Math.round(remainingDebt),
      cashAtEnd: Math.round(cash),
      bankrupt,
      totalPaidToBank: Math.round(totalPaidToBank),
      finalNetWorth,
    })

    return results
  },
}

registerStrategy(mortgageMinCash)

