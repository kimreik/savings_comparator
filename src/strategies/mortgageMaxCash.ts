import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

/**
 * Mortgage max payment + Cash
 *
 * Throw all available money at the mortgage to pay it off ASAP.
 * Once paid off, save the entire monthly budget (savingsPerMonth + rentPerMonth)
 * as cash. If deposit is on, cash holds real value; otherwise it erodes by inflation.
 */
const mortgageMaxCash: SavingsStrategy = {
  id: 'mortgage-max-cash',
  name: 'mortgage max payment + cash',
  nameKey: 'strategy.mortgageMaxCash',
  color: '#06b6d4', // cyan
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

    const minDownPayment = realEstatePrice * (downPaymentPercent / 100)
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1
    const monthlyRate = mortgageRate / 100 / 12

    const results: YearlyResult[] = []
    let cash = currentSavings
    let hasMortgage = false
    let remainingDebt = 0
    let paymentsRemaining = 0
    let bankrupt = false
    let purchaseYear: number | null = null
    let purchaseMonth: number | null = null
    let paidOffYear: number | null = null
    let paidOffMonth: number | null = null
    let totalPaidToBank = 0
    let actualDownPayment = 0

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
          if (!isDeposit) {
            cash /= (1 + monthlyInflation)
          }
          cash += savingsPerMonth
          if (cash >= minDownPayment) {
            // Aggressive: put all cash toward down payment
            actualDownPayment = Math.min(cash, realEstatePrice)
            cash -= actualDownPayment
            const loanAmount = realEstatePrice - actualDownPayment
            hasMortgage = true
            paymentsRemaining = mortgageYears * 12
            remainingDebt = loanAmount
            purchaseYear = year
            purchaseMonth = m
          }
        } else if (remainingDebt > 0) {
          // Erode existing cash first (month passes)
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }

          // Phase 2: throw everything at the mortgage
          const monthlyBudget = savingsPerMonth + rentPerMonth
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
            // Save the leftover from this month's budget as cash
            const leftover = monthlyBudget - totalPayment + usedFromCash
            if (leftover > 0) {
              cash += leftover
            }
          } else {
            paymentsRemaining--
          }
        } else {
          // Phase 3: mortgage paid off — save the entire budget as cash
          // Erode existing cash first (month passes)
          if (!isDeposit && cash > 0) {
            cash /= (1 + monthlyInflation)
          }
          const monthlyBudget = savingsPerMonth + rentPerMonth
          cash += monthlyBudget
        }
      }
    }

    // If we never managed to buy, flag the final result
    if (!hasMortgage) {
      results[results.length - 1].neverBought = true
    }

    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage max + cash]`, {
      minDownPayment: Math.round(minDownPayment),
      actualDownPayment: Math.round(actualDownPayment),
      loanAmount: Math.round(realEstatePrice - actualDownPayment),
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

registerStrategy(mortgageMaxCash)

