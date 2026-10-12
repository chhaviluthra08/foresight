import MetricCard from "./MetricCard"
import CashFlowChart from "./CashFlowChart"
import DeferralAlert from "./DeferralAlert"
import ScenarioPanel from "./ScenarioPanel"

function formatINR(amount) {
  if (amount === null || amount === undefined) return "—"
  return "₹" + Math.abs(amount).toLocaleString("en-IN")
}

export default function Dashboard({ data }) {
  if (!data) return null

  const {
    business_name, location, current_cash,
    data_quality_score, obligations_14_days,
    shortage_day, forecast, scenarios, deferral
  } = data

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Cash"
          value={current_cash}
          subtitle={`${business_name} · ${location}`}
          animate={true}
          prefix="₹"
        />
        <MetricCard
          label="Obligations Next 14 Days"
          value={obligations_14_days}
          subtitle="Confirmed expenses only"
          animate={true}
          prefix="₹"
        />
        <MetricCard
          label="Predicted Shortage"
          value={shortage_day !== null ? `Day ${shortage_day}` : "None"}
          subtitle={shortage_day !== null ? "Cash below ₹20,000" : "Looking healthy"}
          alert={shortage_day !== null && shortage_day <= 14}
        />
        <MetricCard
          label="Data Quality"
          value={Math.round(data_quality_score * 100)}
          subtitle="Income confirmations in 14 days"
          alert={data_quality_score < 0.5}
          animate={true}
          suffix="%"
        />
      </div>

      <CashFlowChart forecast={forecast} />
      <DeferralAlert deferral={deferral} dataQualityScore={data_quality_score} />
      <ScenarioPanel scenarios={scenarios} />
    </div>
  )
}
