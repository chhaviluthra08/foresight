import DataQualityBadge from "./DataQualityBadge"

export default function DeferralAlert({ deferral, dataQualityScore }) {
  if (!deferral) return null
  const { should_defer, confidence_score, reason, recommended_scenario, missing_evidence } = deferral
  const pct = Math.round(confidence_score * 100)

  if (should_defer) {
    return (
      <div className="rounded-2xl p-8 shadow-lg bg-amber-50 border-2 border-amber-400">
        <div className="flex items-start gap-4">
          <span className="text-5xl">⚠️</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-800 mb-1">
              Foresight is Not Confident Enough to Recommend
            </h2>
            <p className="text-amber-700 text-base mb-4">{reason}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-amber-800">Confidence Score</span>
                <span className="text-sm font-bold text-amber-800">{pct}%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-3">
                <div
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {missing_evidence && missing_evidence.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-800 mb-2">
                  Missing Evidence ({missing_evidence.length} items):
                </p>
                <ul className="space-y-1">
                  {missing_evidence.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                      <span className="mt-0.5 text-amber-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-8 shadow-lg bg-green-50 border-2 border-green-400">
      <div className="flex items-start gap-4">
        <span className="text-5xl">✅</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-green-800 mb-1">
            Foresight Recommends: {recommended_scenario?.name}
          </h2>
          <p className="text-green-700 text-base mb-4">{reason}</p>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-green-800">Confidence Score</span>
              <span className="text-sm font-bold text-green-800">{pct}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {recommended_scenario && (
            <p className="text-sm text-green-600 italic mt-3">
              {recommended_scenario.assumption}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
