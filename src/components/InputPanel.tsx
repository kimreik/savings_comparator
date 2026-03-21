import type { SimulationParams } from '../types'

interface InputPanelProps {
  params: SimulationParams
  onParamsChange: (params: SimulationParams) => void
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 w-44 shrink-0 text-right">
        {label}:
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                   transition-colors"
      />
      {suffix && (
        <span className="text-sm text-gray-500">{suffix}</span>
      )}
    </div>
  )
}

export default function InputPanel({ params, onParamsChange }: InputPanelProps) {
  const set = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) =>
    onParamsChange({ ...params, [key]: value })

  return (
    <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit lg:sticky lg:top-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 w-44 shrink-0 text-right">
            Current savings:
          </label>
          <input
            type="number"
            value={params.currentSavings}
            min={0}
            step={10000}
            onChange={(e) => set('currentSavings', Number(e.target.value))}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                       transition-colors"
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={params.isDeposit}
              onChange={(e) => set('isDeposit', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            />
            deposit
          </label>
        </div>
        <Field
          label="Savings per month"
          value={params.savingsPerMonth}
          onChange={(v) => set('savingsPerMonth', v)}
          min={0}
          step={500}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 w-44 shrink-0 text-right">
            Investments rate:
          </label>
          <input
            type="number"
            value={params.investmentsRate}
            min={0}
            max={100}
            step={0.5}
            onChange={(e) => set('investmentsRate', Number(e.target.value))}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                       transition-colors"
          />
          <span className="text-sm text-gray-500">%</span>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={params.incomeTax}
              onChange={(e) => set('incomeTax', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            />
            tax 20%
          </label>
        </div>
        <Field
          label="Planning horizon"
          value={params.planningHorizon}
          onChange={(v) => set('planningHorizon', v)}
          min={1}
          max={50}
          step={1}
          suffix="years"
        />

        <div className="border-t border-gray-100 my-2" />

        <Field
          label="Real estate price"
          value={params.realEstatePrice}
          onChange={(v) => set('realEstatePrice', v)}
          min={0}
          step={50000}
        />
        <Field
          label="Down payment"
          value={params.downPaymentPercent}
          onChange={(v) => set('downPaymentPercent', v)}
          min={0}
          max={100}
          step={1}
          suffix="%"
        />
        <Field
          label="Mortgage years"
          value={params.mortgageYears}
          onChange={(v) => set('mortgageYears', v)}
          min={1}
          max={50}
          step={1}
          suffix="years"
        />
        <Field
          label="Mortgage rate"
          value={params.mortgageRate}
          onChange={(v) => set('mortgageRate', v)}
          min={0}
          max={30}
          step={0.1}
          suffix="%"
        />

        <div className="border-t border-gray-100 my-2" />

        <Field
          label="Rent per month"
          value={params.rentPerMonth}
          onChange={(v) => set('rentPerMonth', v)}
          min={0}
          step={100}
        />
        <Field
          label="Inflation rate"
          value={params.inflationRate}
          onChange={(v) => set('inflationRate', v)}
          min={0}
          max={30}
          step={0.1}
          suffix="%"
        />
      </div>
    </aside>
  )
}


