import { LineChart, Line, ResponsiveContainer, ReferenceLine } from "recharts"

function RiskBadge({ level }) {
  const styles = {
    low: "bg-green-500/10 text-green-400 border border-green-500/30",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    high: "bg-red-500/10 text-red-400 border border-red-500/30",
  }
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full 
      text-xs font-bold uppercase tracking-wide
      whitespace-nowrap shrink-0
      ${styles[level] || styles.medium}
    `}>
      {level} risk
    </span>
  )
}

function Sparkline({ data }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={70}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={1.5} dot={false} />
        <ReferenceLine y={20000} stroke="#ef4444" strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function ScenarioPanel({ scenarios }) {
  if (!scenarios || scenarios.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-4">What-If Scenarios</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-white text-sm leading-tight flex-1">{s.name}</h4>
              <RiskBadge level={s.risk_level} />
            </div>
            <p className="text-xs text-gray-500">{s.description}</p>
            <div>
              {s.shortage_day !== null ? (
                <span className="text-xs font-semibold text-red-600">
                  ⚠ Shortage on Day {s.shortage_day}
                </span>
              ) : (
                <span className="text-xs font-semibold text-green-600">
                  ✓ No shortage predicted
                </span>
              )}
            </div>
            <Sparkline data={s.cash_curve} />
            <p className="text-xs text-gray-400 italic">{s.assumption}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
