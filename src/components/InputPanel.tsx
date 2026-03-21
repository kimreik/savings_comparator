import type { SimulationParams } from '../types'

interface InputPanelProps {
  params: SimulationParams
  onParamsChange: (params: SimulationParams) => void
}

const inputBase =
  'rounded-md border border-gray-300 px-2.5 py-2 text-lg text-gray-900 ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors ' +
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

const inputWide = inputBase + ' w-28'
const inputNarrow = inputBase + ' w-18'

const checkboxCls =
  'size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20'

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-lg font-medium text-gray-600 whitespace-nowrap min-w-0">{label}</label>
      <div className="flex items-center gap-1.5 ml-auto shrink-0">{children}</div>
    </div>
  )
}

function GroupCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/60 rounded-lg px-4 py-3 space-y-2.5">
      <h3 className="text-sm font-bold text-amber-700/70 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

export default function InputPanel({ params, onParamsChange }: InputPanelProps) {
  const set = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) =>
    onParamsChange({ ...params, [key]: value })

  return (
    <aside className="bg-white/30 backdrop-blur-sm rounded-xl shadow-sm border border-amber-300/30 p-2 w-72 flex flex-col min-h-0 overflow-y-auto">
      <div className="flex flex-col justify-between flex-1 gap-1.5">

        {/* ── Savings ── */}
        <GroupCard title="Savings">
          <FieldRow label="Current">
            <input
              type="number"
              value={params.currentSavings}
              min={0}
              step={10000}
              onChange={(e) => set('currentSavings', Number(e.target.value))}
              className={inputWide}
            />
          </FieldRow>
          <FieldRow label="Per month">
            <input
              type="number"
              value={params.savingsPerMonth}
              min={0}
              step={500}
              onChange={(e) => set('savingsPerMonth', Number(e.target.value))}
              className={inputWide}
            />
          </FieldRow>
          <label className="flex items-center gap-2 text-base text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={params.isDeposit}
              onChange={(e) => set('isDeposit', e.target.checked)}
              className={checkboxCls}
            />
            deposit (protect from inflation)
          </label>
          <FieldRow label="Invest rate">
            <input
              type="number"
              value={params.investmentsRate}
              min={0}
              max={100}
              step={0.5}
              onChange={(e) => set('investmentsRate', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-gray-400">%</span>
            <label className="flex items-center gap-1.5 text-base text-gray-500 cursor-pointer select-none whitespace-nowrap ml-1">
              <input
                type="checkbox"
                checked={params.incomeTax}
                onChange={(e) => set('incomeTax', e.target.checked)}
                className={checkboxCls}
              />
              tax
            </label>
          </FieldRow>
        </GroupCard>

        {/* ── Property ── */}
        <GroupCard title="Property">
          <FieldRow label="Price">
            <input
              type="number"
              value={params.realEstatePrice}
              min={0}
              step={50000}
              onChange={(e) => set('realEstatePrice', Number(e.target.value))}
              className={inputWide}
            />
          </FieldRow>
          <FieldRow label="Rent / mo">
            <input
              type="number"
              value={params.rentPerMonth}
              min={0}
              step={100}
              onChange={(e) => set('rentPerMonth', Number(e.target.value))}
              className={inputWide}
            />
          </FieldRow>
        </GroupCard>

        {/* ── Mortgage ── */}
        <GroupCard title="Mortgage">
          <FieldRow label="Down">
            <input
              type="number"
              value={params.downPaymentPercent}
              min={0}
              max={100}
              step={1}
              onChange={(e) => set('downPaymentPercent', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-gray-400">%</span>
          </FieldRow>
          <FieldRow label="Years">
            <input
              type="number"
              value={params.mortgageYears}
              min={1}
              max={50}
              step={1}
              onChange={(e) => set('mortgageYears', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-transparent">%</span>
          </FieldRow>
          <FieldRow label="Rate">
            <input
              type="number"
              value={params.mortgageRate}
              min={0}
              max={30}
              step={0.1}
              onChange={(e) => set('mortgageRate', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-gray-400">%</span>
          </FieldRow>
        </GroupCard>

        {/* ── General ── */}
        <GroupCard title="General">
          <FieldRow label="Horizon">
            <input
              type="number"
              value={params.planningHorizon}
              min={1}
              max={50}
              step={1}
              onChange={(e) => set('planningHorizon', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-gray-400">yr</span>
          </FieldRow>
          <FieldRow label="Inflation">
            <input
              type="number"
              value={params.inflationRate}
              min={0}
              max={30}
              step={0.1}
              onChange={(e) => set('inflationRate', Number(e.target.value))}
              className={inputNarrow}
            />
            <span className="text-lg text-gray-400">%</span>
          </FieldRow>
        </GroupCard>

      </div>
    </aside>
  )
}

