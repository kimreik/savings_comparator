import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Mortgage max payment
 *
 * Same mortgage setup, but every month we throw ALL available money at the mortgage:
 * savingsPerMonth + rentPerMonth (no rent after buying) + any remaining cash.
 * Once the mortgage is paid off early, we spend freely (memories) — no more saving.
 * Remaining cash after mortgage payoff erodes by inflation unless deposit.
 */
const mortgageMaxPayment: SavingsStrategy = {
  id: 'mortgage-max-payment',
  name: 'mortgage max payment + memories',
  color: '#FF0000', // red
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
    const minMonthlyPayment = calcMonthlyPayment(loanAmount, mortgageRate, mortgageYears)
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1

    const results: YearlyResult[] = []
    let cash = currentSavings
    let hasMortgage = false
    let paymentsRemaining = 0
    let remainingDebt = 0
    let bankrupt = false
    let purchaseYear: number | null = null
    let purchaseMonth: number | null = null
    let paidOffYear: number | null = null
    let paidOffMonth: number | null = null
    let totalPaidToBank = 0

    // We need to track actual remaining principal for overpayments.
    // With the annuity formula, the monthly interest rate is:
    const monthlyRate = mortgageRate / 100 / 12

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
          // Phase 1: saving for down payment
          cash += savingsPerMonth
          if (!isDeposit) {
            cash /= (1 + monthlyInflation)
          }
          if (cash >= downPayment) {
            cash -= downPayment
            hasMortgage = true
            paymentsRemaining = mortgageYears * 12
            remainingDebt = loanAmount
            purchaseYear = year
            purchaseMonth = m
          }
        } else if (remainingDebt > 0) {
          // Phase 2: paying mortgage — throw everything at it
          const monthlyBudget = savingsPerMonth + rentPerMonth

          // Interest accrues on remaining principal
          const interestThisMonth = remainingDebt * monthlyRate
          const totalAvailable = monthlyBudget + cash

          if (totalAvailable < interestThisMonth) {
            bankrupt = true
            break
          }

          // Pay as much as possible toward debt
          const totalPayment = Math.min(remainingDebt + interestThisMonth, totalAvailable)
          const principalPaid = totalPayment - interestThisMonth
          remainingDebt -= principalPaid
          totalPaidToBank += totalPayment

          // Deduct from budget first, then cash
          const usedFromCash = Math.max(0, totalPayment - monthlyBudget)
          cash -= usedFromCash

          if (remainingDebt <= 0.01) {
            remainingDebt = 0
            paymentsRemaining = 0
            paidOffYear = year
            paidOffMonth = m
          } else {
            paymentsRemaining--
          }

          // After max payment, any leftover cash erodes
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
        } else {
          // Phase 3: mortgage paid off — spend freely (memories), no saving
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
        }
      }
    }

    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage max payment]`, {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      minMonthlyPayment: Math.round(minMonthlyPayment),
      monthlyBudgetAfterBuy: savingsPerMonth + rentPerMonth,
      purchasedAt: purchaseYear !== null ? `year ${purchaseYear}, month ${purchaseMonth}` : 'never',
      paidOffAt: paidOffYear !== null ? `year ${paidOffYear}, month ${paidOffMonth}` : 'never',
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

registerStrategy(mortgageMaxPayment)






