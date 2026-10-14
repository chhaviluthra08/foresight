// By default the frontend calls the API on its own origin ("/api/..."):
//   - local dev: Vite proxies /api to the FastAPI server (see vite.config.js)
//   - Vercel:    vercel.json rewrites /api to the backend service
// Set VITE_API_URL only when the backend is hosted on a different domain
// (e.g. VITE_API_URL=https://foresight-backend.onrender.com).
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")

const UNREACHABLE =
  "Can't reach the Foresight backend. Start it with: cd backend && uvicorn main:app --reload --port 8000"

async function getJSON(path) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`)
  } catch {
    // Network-level failure (server down, wrong host, CORS) — the browser's
    // own message is just "Failed to fetch", which isn't actionable.
    throw new Error(UNREACHABLE)
  }

  if (!res.ok) {
    let detail = null
    try {
      detail = (await res.json())?.detail
    } catch {
      // Non-JSON error body: FastAPI never sends these, so it's the dev proxy
      // or the host reporting that the backend itself didn't answer.
    }
    if (detail) throw new Error(`API error ${res.status}: ${detail}`)
    if (res.status >= 500) throw new Error(UNREACHABLE)
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export function fetchScenario(name) {
  return getJSON(`/api/scenario/${name}`)
}

export function fetchHealth() {
  return getJSON("/api/health")
}
