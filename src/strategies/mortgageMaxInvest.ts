import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

/**
 * Mortgage max payment + Invest
 *
 * Throw all available money at the mortgage to pay it off ASAP.
 * Once paid off, invest everything at the inflation-adjusted investment rate.
 */
const mortgageMaxInvest: SavingsStrategy = {
  id: 'mortgage-max-invest',
  name: 'mortgage max payment + invest',
  color: '#228B22', // dark green
  calculate(params: SimulationParams): YearlyResult[] {
    const {
      currentSavings,
      savingsPerMonth,
      investmentsRate,
      planningHorizon,
      realEstatePrice,
      downPaymentPercent,
      mortgageYears,
      mortgageRate,
      rentPerMonth,
      isDeposit,
      inflationRate,
      incomeTax,
    } = params

    const minDownPayment = realEstatePrice * (downPaymentPercent / 100)
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1
    const monthlyRate = mortgageRate / 100 / 12

    const realAnnualReturn = (1 + investmentsRate / 100) / (1 + inflationRate / 100) - 1
    const realMonthlyReturn = Math.pow(1 + realAnnualReturn, 1 / 12) - 1

    const results: YearlyResult[] = []
    let cash = currentSavings
    let portfolio = 0
    let totalContributed = 0
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
      const gain = Math.max(0, portfolio - totalContributed)
      const tax = incomeTax ? gain * 0.2 : 0
      const portfolioAfterTax = portfolio - tax

      if (bankrupt) {
        results.push({ year, netWorth: -1 })
      } else if (!hasMortgage) {
        results.push({ year, netWorth: Math.round(cash + portfolioAfterTax) })
      } else {
        results.push({ year, netWorth: Math.round(realEstatePrice + cash + portfolioAfterTax - remainingDebt) })
      }

      if (year === planningHorizon || bankrupt) continue

      for (let m = 0; m < 12; m++) {
        if (bankrupt) break

        // Portfolio grows each month
        portfolio *= (1 + realMonthlyReturn)

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
            // If bought outright (no debt), move leftover cash into portfolio
            if (remainingDebt === 0) {
              paymentsRemaining = 0
              paidOffYear = year
              paidOffMonth = m
              if (cash > 0) {
                portfolio += cash
                totalContributed += cash
                cash = 0
              }
            }
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

          const totalPayment = Math.min(remainingDebt + interestThisMonth, totalAvailable)
          const principalPaid = totalPayment - interestThisMonth
          remainingDebt -= principalPaid
          totalPaidToBank += totalPayment

          const usedFromCash = Math.max(0, totalPayment - monthlyBudget)
          cash -= usedFromCash

          if (remainingDebt <= 0.01) {
            remainingDebt = 0
            paymentsRemaining = 0
            paidOffYear = year
            paidOffMonth = m
            // Invest leftover from this month's budget
            const leftover = monthlyBudget - totalPayment + usedFromCash
            if (leftover > 0) {
              portfolio += leftover
              totalContributed += leftover
            }
            // Move any remaining cash into portfolio
            if (cash > 0) {
              portfolio += cash
              totalContributed += cash
              cash = 0
            }
          } else {
            paymentsRemaining--
          }
        } else {
          // Phase 3: mortgage paid off — invest everything
          const monthlyBudget = savingsPerMonth + rentPerMonth
          portfolio += monthlyBudget
          totalContributed += monthlyBudget
        }
      }
    }

    const finalGain = Math.max(0, portfolio - totalContributed)
    const finalTax = incomeTax ? finalGain * 0.2 : 0
    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage max + invest]`, {
      minDownPayment: Math.round(minDownPayment),
      actualDownPayment: Math.round(actualDownPayment),
      loanAmount: Math.round(realEstatePrice - actualDownPayment),
      monthlyBudgetAfterBuy: savingsPerMonth + rentPerMonth,
      realAnnualReturn: `${(realAnnualReturn * 100).toFixed(2)}%`,
      purchasedAt: purchaseYear !== null ? `year ${purchaseYear}, month ${purchaseMonth}` : 'never',
      paidOffAt: paidOffYear !== null ? `year ${paidOffYear}, month ${paidOffMonth}` : 'never',
      realEstateValue: realEstatePrice,
      remainingDebt: Math.round(remainingDebt),
      portfolioAtEnd: Math.round(portfolio),
      totalContributed: Math.round(totalContributed),
      investmentGain: Math.round(finalGain),
      incomeTax: incomeTax ? `20% → ${Math.round(finalTax)}` : 'off',
      portfolioAfterTax: Math.round(portfolio - finalTax),
      cashAtEnd: Math.round(cash),
      bankrupt,
      totalPaidToBank: Math.round(totalPaidToBank),
      finalNetWorth,
    })

    return results
  },
}

registerStrategy(mortgageMaxInvest)

