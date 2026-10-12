import { useState, useEffect } from "react"
import { fetchScenario } from "./api"
import Dashboard from "./components/Dashboard"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const SCENARIOS = [
  {
    key: "normal",
    name: "Mehta Electronics",
    subtitle: "Karol Bagh · Normal",
    dotColor: "bg-emerald-500",
  },
  {
    key: "stressed",
    name: "Ananya Textiles",
    subtitle: "Lajpat Nagar · Stressed",
    dotColor: "bg-amber-500",
  },
  {
    key: "crisis",
    name: "Sharma Catering Co.",
    subtitle: "Rohini · Crisis",
    dotColor: "bg-red-500",
  },
]

export default function App() {
  const [active, setActive] = useState("normal")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendOnline, setBackendOnline] = useState(true)

  // Check backend health on mount
  useEffect(() => {
    fetch(`${BASE_URL}/api/health`)
      .then((res) => {
        if (res.ok) setBackendOnline(true)
        else setBackendOnline(false)
      })
      .catch(() => setBackendOnline(false))
  }, [])

  // Fetch scenario data on change
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchScenario(active)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [active])

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const currentScenario = SCENARIOS.find((s) => s.key === active) || SCENARIOS[0]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] flex flex-col md:flex-row font-sans">
      {/* MOBILE TOP BAR (visible below md: 768px) */}
      <div className="md:hidden bg-[#0f0f1a] border-b border-[#1e1e2e] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white text-base shadow-md shadow-blue-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-white font-bold text-[18px] leading-tight">Foresight</h1>
            <p className="text-[#6b7280] text-[10px] font-medium tracking-wide">
              AI Financial Engine
            </p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`flex-1 min-w-[140px] text-left p-2.5 rounded-xl transition-all duration-200 border-l-[3px] ${
                active === s.key
                  ? "bg-[#1e3a5f] border-[#3b82f6]"
                  : "bg-[#141424] border-transparent hover:bg-[#1a1a2e]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                <span className="text-white text-xs font-semibold truncate">{s.name}</span>
              </div>
              <p className="text-[#6b7280] text-[10px] mt-0.5 truncate">{s.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP FIXED SIDEBAR (260px wide, visible on md and up) */}
      <aside className="hidden md:flex md:fixed md:top-0 md:left-0 md:w-[260px] md:h-screen bg-[#0f0f1a] border-r border-[#1e1e2e] flex-col justify-between p-5 z-20">
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white text-base shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-white font-bold text-[20px] leading-tight">Foresight</h1>
              <p className="text-[#6b7280] text-[11px] font-medium tracking-wide">
                AI Financial Engine
              </p>
            </div>
          </div>

          {/* Section Label */}
          <div className="text-[#6b7280] text-[10px] font-bold uppercase tracking-wider mt-8 mb-3 px-1">
            DEMO BUSINESSES
          </div>

          {/* Business Selector Buttons */}
          <div className="flex flex-col gap-2">
            {SCENARIOS.map((s) => {
              const isActive = active === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-start gap-3 ${
                    isActive
                      ? "bg-[#1e3a5f] border-l-[3px] border-[#3b82f6]"
                      : "bg-transparent border-l-[3px] border-transparent hover:bg-[#1a1a2e]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[14px] font-semibold truncate leading-tight">
                      {s.name}
                    </div>
                    <div className="text-[#6b7280] text-[11px] mt-0.5 truncate">
                      {s.subtitle}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Status Indicator */}
        <div className="pt-4 border-t border-[#1e1e2e] flex items-center gap-2">
          {backendOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[#6b7280] text-[12px] font-medium">Backend Connected</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[#6b7280] text-[12px] font-medium">Backend Offline</span>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-[260px] min-h-screen bg-[#0a0a0f] p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar Header */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-8 pb-6 border-b border-[#1e1e2e]">
            <div>
              <h2 className="text-white text-[28px] font-black tracking-tight leading-tight">
                {data?.business_name || currentScenario.name}
              </h2>
              <p className="text-[#6b7280] text-[14px] mt-1 font-medium">
                {data?.location ? `${data.location} · New Delhi` : currentScenario.subtitle}
              </p>
            </div>
            <div className="text-[#6b7280] text-[14px] font-medium sm:text-right shrink-0 mt-1 sm:mt-0">
              {formattedDate}
            </div>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[380px] gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              <p className="text-[#6b7280] text-[14px] font-medium tracking-wide">
                Analysing financial data...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-[#1a0a0a] border border-red-500/50 rounded-2xl p-6 text-red-400 flex items-start gap-3 shadow-lg">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-300 text-sm">Failed to load financial data</h3>
                <p className="text-xs text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loaded Dashboard Content */}
          {!loading && !error && <Dashboard data={data} />}
        </div>
      </main>
    </div>
  )
}
