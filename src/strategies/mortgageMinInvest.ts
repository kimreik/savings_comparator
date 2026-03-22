import type { SavingsStrategy, SimulationParams, YearlyResult } from '../types'
import { registerStrategy } from './registry'

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Mortgage min payment + Invest
 *
 * Same as "mortgage min payment + cash", but surplus money goes into
 * an investment portfolio (e.g. stock market) that grows at the
 * inflation-adjusted investment rate each month.
 */
const mortgageMinInvest: SavingsStrategy = {
  id: 'mortgage-min-invest',
  name: 'mortgage min payment + invest',
  nameKey: 'strategy.mortgageMinInvest',
  color: '#f59e0b', // amber
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

    const downPayment = realEstatePrice * (downPaymentPercent / 100)
    const loanAmount = realEstatePrice - downPayment
    const monthlyPayment = calcMonthlyPayment(loanAmount, mortgageRate, mortgageYears)
    const monthlyInflation = Math.pow(1 + inflationRate / 100, 1 / 12) - 1
    const monthlyRate = mortgageRate / 100 / 12

    // Real monthly investment return (strip out inflation)
    const realAnnualReturn = (1 + investmentsRate / 100) / (1 + inflationRate / 100) - 1
    const realMonthlyReturn = Math.pow(1 + realAnnualReturn, 1 / 12) - 1

    const results: YearlyResult[] = []
    let portfolio = 0          // invested amount (real terms, grows by real return)
    let cash = currentSavings  // cash waiting to be deployed / used for down payment
    let totalContributed = 0   // total money put into portfolio (for tax calc)
    let hasMortgage = false
    let remainingDebt = 0
    let bankrupt = false
    let purchaseYear: number | null = null
    let purchaseMonth: number | null = null
    let totalPaidToBank = 0

    for (let year = 0; year <= planningHorizon; year++) {
      // Portfolio value after tax on gains
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

        // Portfolio grows each month regardless of phase
        portfolio *= (1 + realMonthlyReturn)

        if (!hasMortgage) {
          // Phase 1: saving for down payment — keep cash liquid
          // Cash erodes by inflation while waiting (unless deposit)
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
            // Move remaining cash into the portfolio
            totalContributed += cash
            portfolio += cash
            cash = 0
          }
        } else {
          const monthlyBudget = savingsPerMonth + rentPerMonth
          if (remainingDebt > 0) {
            const interestThisMonth = remainingDebt * monthlyRate
            if (monthlyBudget >= monthlyPayment) {
              // Surplus goes to portfolio
              const surplus = monthlyBudget - monthlyPayment
              portfolio += surplus
              totalContributed += surplus
              const principalPaid = monthlyPayment - interestThisMonth
              remainingDebt -= principalPaid
              totalPaidToBank += monthlyPayment
            } else {
              // Need to sell investments to cover shortfall
              const shortfall = monthlyPayment - monthlyBudget
              if (portfolio >= shortfall) {
                portfolio -= shortfall
              } else {
                // Not enough in portfolio — bankrupt
                bankrupt = true
                break
              }
              const principalPaid = monthlyPayment - interestThisMonth
              remainingDebt -= principalPaid
              totalPaidToBank += monthlyPayment
            }
            if (remainingDebt <= 0.01) {
              remainingDebt = 0
            }
          } else {
            // Mortgage paid off — invest the entire budget
            portfolio += monthlyBudget
            totalContributed += monthlyBudget
          }
        }
      }
    }

    // If we never managed to buy, flag the final result
    if (!hasMortgage) {
      results[results.length - 1].neverBought = true
    }

    const finalGain = Math.max(0, portfolio - totalContributed)
    const finalTax = incomeTax ? finalGain * 0.2 : 0
    const finalNetWorth = results[results.length - 1].netWorth
    console.log(`[mortgage min + invest]`, {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      monthlyBudgetAfterBuy: savingsPerMonth + rentPerMonth,
      monthlySurplus: Math.round(savingsPerMonth + rentPerMonth - monthlyPayment),
      realAnnualReturn: `${(realAnnualReturn * 100).toFixed(2)}%`,
      purchasedAt: purchaseYear !== null ? `year ${purchaseYear}, month ${purchaseMonth}` : 'never',
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

registerStrategy(mortgageMinInvest)

