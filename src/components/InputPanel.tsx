import type { SimulationParams } from '../types'

interface InputPanelProps {
  params: SimulationParams
  onParamsChange: (params: SimulationParams) => void
}

const inputCls =
  'w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors'

const checkboxCls =
  'rounded border-gray-300 text-blue-600 focus:ring-blue-500/20'

function MiniField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  className,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputCls}
        />
        {suffix && <span className="text-xs text-gray-400 shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{children}</h3>
  )
}

export default function InputPanel({ params, onParamsChange }: InputPanelProps) {
  const set = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) =>
    onParamsChange({ ...params, [key]: value })

  return (
    <aside className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-4 w-64 flex flex-col">
      <div className="flex flex-col justify-between flex-1 gap-3">

        {/* ── Savings ── */}
        <div className="space-y-1.5">
          <GroupLabel>Savings</GroupLabel>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-0.5">Current</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={params.currentSavings}
                  min={0}
                  step={10000}
                  onChange={(e) => set('currentSavings', Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-0.5">Per month</label>
              <input
                type="number"
                value={params.savingsPerMonth}
                min={0}
                step={500}
                onChange={(e) => set('savingsPerMonth', Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={params.isDeposit}
              onChange={(e) => set('isDeposit', e.target.checked)}
              className={checkboxCls}
            />
            deposit (protect from inflation)
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Invest rate</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={params.investmentsRate}
                min={0}
                max={100}
                step={0.5}
                onChange={(e) => set('investmentsRate', Number(e.target.value))}
                className={inputCls}
              />
              <span className="text-xs text-gray-400 shrink-0">%</span>
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={params.incomeTax}
                  onChange={(e) => set('incomeTax', e.target.checked)}
                  className={checkboxCls}
                />
                tax
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Property ── */}
        <div className="space-y-1.5">
          <GroupLabel>Property</GroupLabel>

          <div className="grid grid-cols-2 gap-2">
            <MiniField
              label="Price"
              value={params.realEstatePrice}
              onChange={(v) => set('realEstatePrice', v)}
              min={0}
              step={50000}
            />
            <MiniField
              label="Rent / mo"
              value={params.rentPerMonth}
              onChange={(v) => set('rentPerMonth', v)}
              min={0}
              step={100}
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Mortgage ── */}
        <div className="space-y-1.5">
          <GroupLabel>Mortgage</GroupLabel>

          <div className="grid grid-cols-3 gap-2">
            <MiniField
              label="Down"
              value={params.downPaymentPercent}
              onChange={(v) => set('downPaymentPercent', v)}
              min={0}
              max={100}
              step={1}
              suffix="%"
            />
            <MiniField
              label="Years"
              value={params.mortgageYears}
              onChange={(v) => set('mortgageYears', v)}
              min={1}
              max={50}
              step={1}
            />
            <MiniField
              label="Rate"
              value={params.mortgageRate}
              onChange={(v) => set('mortgageRate', v)}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── General ── */}
        <div className="space-y-1.5">
          <GroupLabel>General</GroupLabel>

          <div className="grid grid-cols-2 gap-2">
            <MiniField
              label="Horizon"
              value={params.planningHorizon}
              onChange={(v) => set('planningHorizon', v)}
              min={1}
              max={50}
              step={1}
              suffix="yr"
            />
            <MiniField
              label="Inflation"
              value={params.inflationRate}
              onChange={(v) => set('inflationRate', v)}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />
          </div>
        </div>

      </div>
    </aside>
  )
}


