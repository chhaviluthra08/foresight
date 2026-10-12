import {
  ComposedChart, Line, Area, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

function formatINR(value) {
  if (value === null || value === undefined) return ""
  const abs = Math.abs(value)
  let str
  if (abs >= 100000) {
    str = (abs / 100000).toFixed(1) + "L"
  } else if (abs >= 1000) {
    str = (abs / 1000).toFixed(0) + "K"
  } else {
    str = abs.toString()
  }
  return (value < 0 ? "-₹" : "₹") + str
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
}

export default function CashFlowChart({ forecast }) {
  if (!forecast || forecast.length === 0) return null

  const today = new Date().toISOString().split("T")[0]

  const data = forecast.map(item => ({
    date: item.date?.split("T")[0] || item.date,
    pastBalance: !item.is_forecast ? item.balance : null,
    forecastBalance: item.is_forecast ? item.balance : null,
    lower: item.is_forecast ? item.lower_bound : null,
    upper: item.is_forecast ? item.upper_bound : null,
    band: item.is_forecast ? [item.lower_bound, item.upper_bound] : null,
  }))

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Cash Flow Forecast</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            interval={6}
          />
          <YAxis
            tickFormatter={formatINR}
            tick={{ fontSize: 11 }}
            width={60}
          />
          <Tooltip
            formatter={(value, name) => [formatINR(value), name]}
            labelFormatter={(label) => formatDate(label)}
          />
          <Legend />
          <ReferenceLine y={20000} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "Min Reserve", fontSize: 11, fill: "#ef4444" }} />
          <ReferenceLine x={today} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Today", fontSize: 11, fill: "#6366f1" }} />
          <Area
            dataKey="band"
            fill="#bfdbfe"
            stroke="none"
            fillOpacity={0.4}
            name="Uncertainty Band"
            connectNulls={false}
          />
          <Line
            dataKey="pastBalance"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Actual Balance"
            connectNulls={false}
          />
          <Line
            dataKey="forecastBalance"
            stroke="#2563eb"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Forecast Balance"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
