export default function DeferralAlert({ deferral, dataQualityScore }) {
  if (!deferral) return null

  const {
    should_defer,
    confidence_score,
    reason,
    recommended_scenario,
    missing_evidence
  } = deferral

  const pct = Math.round(confidence_score * 100)
  const dqPct = Math.round((dataQualityScore || 0) * 100)
  const calibrationScore = Math.min(1, Math.max(0, (confidence_score - (dataQualityScore * 0.5)) / 0.5))
  const calibrationPct = Math.round(calibrationScore * 100)

  if (should_defer) {
    return (
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-[#1a1200] to-[#1a0f00] p-8 shadow-xl shadow-amber-500/10">
        
        <div className="flex items-start gap-5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <span className="text-3xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-400 mb-1">
              Foresight is Not Confident Enough to Recommend
            </h2>
            <p className="text-amber-200/60 text-sm leading-relaxed">{reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-black/20 rounded-xl p-5 border border-amber-500/10">
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-4">
              Confidence Breakdown
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-400 text-xs">Data Quality Score</span>
                  <span className="text-white text-xs font-bold">{dqPct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${dqPct}%`,
                      backgroundColor: dqPct < 50 ? "#ef4444" : dqPct < 75 ? "#f59e0b" : "#22c55e"
                    }}
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  Fraction of expected income in next 14 days that is confirmed
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-400 text-xs">Forecast Calibration</span>
                  <span className="text-white text-xs font-bold">{calibrationPct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700 bg-blue-500"
                    style={{ width: `${calibrationPct}%` }}
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  How narrow the uncertainty band is relative to cash position
                </p>
              </div>

              <div className="pt-2 border-t border-amber-500/10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-amber-400 text-xs font-bold">Overall Confidence</span>
                  <span className="text-amber-400 text-xs font-black">{pct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-700 bg-gradient-to-r from-amber-600 to-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  = (Data Quality × 0.5) + (Calibration × 0.5) · Threshold: 55%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-5 border border-amber-500/10">
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-4">
              Missing Evidence · {missing_evidence?.length || 0} items
            </h3>
            {missing_evidence && missing_evidence.length > 0 ? (
              <ul className="space-y-2">
                {missing_evidence.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-xs">No missing evidence identified.</p>
            )}
            <div className="mt-4 pt-4 border-t border-amber-500/10">
              <p className="text-gray-600 text-xs leading-relaxed">
                Resolving these items would increase data quality score and may push confidence above the 55% threshold required for an automated recommendation.
              </p>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-green-500/40 bg-gradient-to-br from-[#001a0a] to-[#001a10] p-8 shadow-xl shadow-green-500/10">

      <div className="flex items-start gap-5 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
          <span className="text-3xl">✅</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-green-400 mb-1">
            Foresight Recommends: {recommended_scenario?.name}
          </h2>
          <p className="text-green-200/60 text-sm leading-relaxed">{reason}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-black/20 rounded-xl p-5 border border-green-500/10">
          <h3 className="text-green-400 font-bold text-sm uppercase tracking-widest mb-4">
            Confidence Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-xs">Data Quality Score</span>
                <span className="text-white text-xs font-bold">{dqPct}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${dqPct}%`,
                    backgroundColor: dqPct < 50 ? "#ef4444" : dqPct < 75 ? "#f59e0b" : "#22c55e"
                  }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">
                Fraction of expected income in next 14 days that is confirmed
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-xs">Forecast Calibration</span>
                <span className="text-white text-xs font-bold">{calibrationPct}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700 bg-blue-500"
                  style={{ width: `${calibrationPct}%` }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">
                How narrow the uncertainty band is relative to cash position
              </p>
            </div>

            <div className="pt-2 border-t border-green-500/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-green-400 text-xs font-bold">Overall Confidence</span>
                <span className="text-green-400 text-xs font-black">{pct}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700 bg-gradient-to-r from-green-600 to-green-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">
                = (Data Quality × 0.5) + (Calibration × 0.5) · Threshold: 55%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-5 border border-green-500/10">
          <h3 className="text-green-400 font-bold text-sm uppercase tracking-widest mb-4">
            Recommended Action
          </h3>
          {recommended_scenario && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <p className="text-white font-bold text-sm mb-1">
                  {recommended_scenario.name}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {recommended_scenario.description}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/20">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Assumption
                </p>
                <p className="text-gray-400 text-xs italic leading-relaxed">
                  {recommended_scenario.assumption}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/20">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Risk Level
                </p>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                  recommended_scenario.risk_level === "low"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : recommended_scenario.risk_level === "medium"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}>
                  {recommended_scenario.risk_level}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
