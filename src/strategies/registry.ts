import type { SavingsStrategy } from '../types'

const strategies: SavingsStrategy[] = []

export function registerStrategy(strategy: SavingsStrategy) {
  strategies.push(strategy)
}

export function getStrategies(): readonly SavingsStrategy[] {
  return strategies
}


