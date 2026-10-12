import { useEffect, useState } from "react"

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof target !== "number") return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

export default function MetricCard({ label, value, subtitle, alert = false, animate = false, prefix = "", suffix = "" }) {
  const isNumber = typeof value === "number"
  const counted = useCountUp(animate && isNumber ? value : 0)
  const displayValue = animate && isNumber ? counted : value

  const borderColor = alert ? "border-red-500" : "border-blue-500/20"
  const glowColor = alert ? "shadow-red-500/20" : "shadow-blue-500/10"

  return (
    <div className={`
      relative rounded-2xl p-6 border ${borderColor}
      bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]
      shadow-lg ${glowColor}
      overflow-hidden
      transition-all duration-300 hover:scale-[1.02]
    `}>
      {alert && (
        <div className="absolute inset-0 bg-red-500/5 rounded-2xl" />
      )}

      <div className="relative z-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>

        <div className={`text-3xl font-black mt-2 mb-1 ${alert ? "text-red-400" : "text-white"}`}>
          {prefix}{typeof displayValue === "number"
            ? displayValue.toLocaleString("en-IN")
            : displayValue}{suffix}
        </div>

        {subtitle && (
          <span className="text-xs text-gray-500">{subtitle}</span>
        )}
      </div>

      <div className={`
        absolute bottom-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10
        ${alert ? "bg-red-500" : "bg-blue-500"}
      `} />
    </div>
  )
}
