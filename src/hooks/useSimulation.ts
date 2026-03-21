import { useMemo } from 'react'
import type { SimulationParams, StrategyResult } from '../types'
import { getStrategies } from '../strategies/registry'

export function useSimulation(params: SimulationParams): StrategyResult[] {
  const strategies = getStrategies()

  return useMemo(() => {
    return strategies.map((strategy) => {
      const data = strategy.calculate(params)
      const finalNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0

      return {
        strategy,
        data,
        finalNetWorth,
      }
    })
  }, [strategies, params])
}


