const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchScenario(name) {
  const res = await fetch(`${BASE_URL}/api/scenario/${name}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
