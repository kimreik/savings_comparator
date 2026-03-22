export interface SimulationParams {
  /** Current total savings */
  currentSavings: number
  /** Whether current savings are in a bank deposit (protected from inflation) */
  isDeposit: boolean
  /** Monthly amount available for saving / payments */
  savingsPerMonth: number
  /** Expected annual return on investments (e.g. 10 = 10%) */
  investmentsRate: number
  /** Whether 20% income tax is applied on investment gains */
  incomeTax: boolean
  /** Planning horizon in years */
  planningHorizon: number
  /** Total price of the real estate */
  realEstatePrice: number
  /** Down payment as percentage of real estate price (e.g. 20 = 20%) */
  downPaymentPercent: number
  /** Mortgage term in years */
  mortgageYears: number
  /** Annual mortgage interest rate (e.g. 6 = 6%) */
  mortgageRate: number
  /** Monthly rent cost */
  rentPerMonth: number
  /** Annual inflation rate (e.g. 3 = 3%) */
  inflationRate: number
}

export interface YearlyResult {
  year: number
  netWorth: number
  /** Set on final year for mortgage strategies that never accumulated enough for a down payment */
  neverBought?: boolean
}

export interface SavingsStrategy {
  id: string
  name: string
  /** i18n key for the strategy name */
  nameKey?: string
  color: string
  /** Run the calculation and return net worth per year (year 0 = start) */
  calculate(params: SimulationParams): YearlyResult[]
}

export interface StrategyResult {
  strategy: SavingsStrategy
  data: YearlyResult[]
  finalNetWorth: number
  /** True if a mortgage strategy never accumulated enough for the down payment */
  neverBought?: boolean
}


