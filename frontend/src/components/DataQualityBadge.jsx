export default function DataQualityBadge({ score }) {
  const pct = Math.round(score * 100)
  const color = score < 0.5
    ? "bg-red-100 text-red-700 border border-red-300"
    : score < 0.75
    ? "bg-amber-100 text-amber-700 border border-amber-300"
    : "bg-green-100 text-green-700 border border-green-300"

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      <span className={`w-2 h-2 rounded-full ${
        score < 0.5 ? "bg-red-500" : score < 0.75 ? "bg-amber-500" : "bg-green-500"
      }`} />
      Data Quality: {pct}%
    </span>
  )
}
