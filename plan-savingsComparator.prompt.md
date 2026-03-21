## Plan: Savings Comparator — Rent vs. Buy Comparison Tool

A single-page React app (Vite + TypeScript) that compares different savings/housing strategies: renting vs. buying with a mortgage. The user provides financial parameters (current savings, monthly savings capacity, investment rate, real estate price, mortgage terms, rent, inflation) and instantly sees a **horizontal bar chart** ranking the final net worth for each strategy over the planning horizon.

The architecture uses a strategy pattern so new strategies can be plugged in trivially.

### Inputs (all shared, shown on the left side)

| Input | Default | Suffix |
|---|---|---|
| Current savings | 200,000 | |
| Savings per month | 5,000 | |
| Investments rate | 10 | % |
| Planning horizon | 30 | years |
| Real estate price | 1,200,000 | |
| Down payment | 20 | % |
| Mortgage years | 30 | years |
| Mortgage rate | 6 | % |
| Rent per month | 4,000 | |
| Inflation rate | 3 | % |

### Strategies (horizontal bar chart on the right)

1. 🟢 **Rent + Invest** — Rent, invest all remaining savings at the investments rate.
2. 🟡 **Mortgage min payment + Invest** — Buy with mortgage (min monthly payment), invest any leftover savings.
3. 🔴 **Mortgage max payment** — Buy with mortgage, put all extra savings toward paying off mortgage faster.
4. 🟠 **Mortgage min payment + Cash** — Buy with mortgage (min payment), keep leftover as cash (no investment return).
5. 🩵 **Mortgage min payment + Memories** — Buy with mortgage (min payment), spend any leftover (net worth = just real estate equity).
6. 🔵 **Rent + Cash** — Rent, keep remaining savings as cash.
7. 🟣 **Rent + Memories** — Rent, spend all remaining after rent (net worth = 0 growth from savings).

### Steps

1. ~~**Scaffold the project** — Initialize a Vite + React + TypeScript project. Install Tailwind CSS, Recharts.~~ ✅

2. ~~**Define the core types and strategy interface** — `SavingsStrategy`, `SimulationParams`, `YearlyResult`, strategy registry.~~ ✅ (needs update)

3. ~~**Build the input panel component** — `InputPanel.tsx` with shared params.~~ ✅ (needs update)

4. ~~**Build the results area (chart + summary)** — `ComparisonChart.tsx` and `SummaryTable.tsx`.~~ ✅ (needs update)

5. ~~**Compose the page layout in `App.tsx`** — Wire state → strategies → chart.~~ ✅ (needs update)

6. ~~**Update all types and inputs to match the actual design** — Replace generic savings params with rent-vs-buy params. Update `InputPanel` to show all 10 inputs. Change chart from line chart to horizontal bar chart.~~ ✅

7. **Implement strategies one-by-one:**
   - Strategy 1: Rent + Invest
   - Strategy 2: Mortgage min payment + Invest
   - Strategy 3: Mortgage max payment
   - Strategy 4: Mortgage min payment + Cash
   - Strategy 5: Mortgage min payment + Memories
   - Strategy 6: Rent + Cash
   - Strategy 7: Rent + Memories


