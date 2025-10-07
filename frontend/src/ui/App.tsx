import React, { useEffect, useMemo, useState } from 'react'

type SimInputs = {
  labor_cost_manual: number | ''
  error_savings: number | ''
  auto_cost: number | ''
  implementation_cost: number | ''
}

type SimResults = {
  monthly_savings: number | null
  payback_months: number | null
  roi_percentage: number | null
  boost_factor: number
}

const initialInputs: SimInputs = {
  labor_cost_manual: '',
  error_savings: '',
  auto_cost: '',
  implementation_cost: '',
}

function isValidNumber(n: number | ''): n is number {
  return typeof n === 'number' && isFinite(n) && n >= 0
}

export const App: React.FC = () => {
  const [inputs, setInputs] = useState<SimInputs>(initialInputs)
  const [results, setResults] = useState<SimResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scenarioName, setScenarioName] = useState<string>("")
  const [scenarios, setScenarios] = useState<Array<{ id: number; scenario_name: string; created_at: string }>>([])
  const [busy, setBusy] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")

  const canSimulate = useMemo(() => (
    isValidNumber(inputs.labor_cost_manual) &&
    isValidNumber(inputs.error_savings) &&
    isValidNumber(inputs.auto_cost)
  ), [inputs])

  useEffect(() => {
    if (!canSimulate) {
      setResults(null)
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setError(null)
        const body: Record<string, number> = {
          labor_cost_manual: Number(inputs.labor_cost_manual),
          error_savings: Number(inputs.error_savings),
          auto_cost: Number(inputs.auto_cost),
        }
        if (isValidNumber(inputs.implementation_cost)) {
          body.implementation_cost = Number(inputs.implementation_cost)
        }
        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Simulation failed')
        }
        const data = await res.json()
        setResults(data.results as SimResults)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        setError(e.message || 'Simulation error')
        setResults(null)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [inputs, canSimulate])

  const onNum = (key: keyof SimInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v === '') {
      setInputs(prev => ({ ...prev, [key]: '' }))
      return
    }
    const n = Number(v)
    if (isNaN(n)) return
    setInputs(prev => ({ ...prev, [key]: n }))
  }

  // Scenarios CRUD helpers
  const refreshScenarios = async () => {
    try {
      const res = await fetch('/api/scenarios')
      const data = await res.json()
      setScenarios(data.scenarios || [])
    } catch {
      // ignore list failures in UI
    }
  }

  useEffect(() => {
    void refreshScenarios()
  }, [])

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      setError('Please enter a scenario name')
      return
    }
    if (!canSimulate) {
      setError('Enter required inputs before saving')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        scenario_name: scenarioName.trim(),
        labor_cost_manual: Number(inputs.labor_cost_manual),
        error_savings: Number(inputs.error_savings),
        auto_cost: Number(inputs.auto_cost),
      }
      if (isValidNumber(inputs.implementation_cost)) {
        body.implementation_cost = Number(inputs.implementation_cost)
      }
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Save failed')
      }
      setScenarioName('')
      await refreshScenarios()
    } catch (e: any) {
      setError(e.message || 'Save error')
    } finally {
      setBusy(false)
    }
  }

  const loadScenario = async (id: number) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/scenarios/${id}`)
      if (!res.ok) throw new Error('Failed to load scenario')
      const data = await res.json()
      // inputs_json is stored as stringified JSON
      const parsed = JSON.parse(data.inputs_json || '{}')
      const next: SimInputs = {
        labor_cost_manual: parsed.labor_cost_manual ?? '',
        error_savings: parsed.error_savings ?? '',
        auto_cost: parsed.auto_cost ?? '',
        implementation_cost: parsed.implementation_cost ?? '',
      }
      setInputs(next)
    } catch (e: any) {
      setError(e.message || 'Load error')
    } finally {
      setBusy(false)
    }
  }

  const deleteScenario = async (id: number) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await refreshScenarios()
    } catch (e: any) {
      setError(e.message || 'Delete error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="">
      <div className="mb-3">
        <h1 className="h2 mb-1">ROI Simulator</h1>
        <p className="text-secondary mb-0">Enter your monthly figures to see savings, payback, and ROI.</p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <label className="form-label">Labor cost (manual)</label>
          <input inputMode="decimal" placeholder="e.g., 5000" value={inputs.labor_cost_manual} onChange={onNum('labor_cost_manual')} className="form-control" />

          <label className="form-label mt-3">Error savings</label>
          <input inputMode="decimal" placeholder="e.g., 1500" value={inputs.error_savings} onChange={onNum('error_savings')} className="form-control" />

          <label className="form-label mt-3">Automation cost</label>
          <input inputMode="decimal" placeholder="e.g., 2000" value={inputs.auto_cost} onChange={onNum('auto_cost')} className="form-control" />

          <label className="form-label mt-3">Implementation cost (one-time)</label>
          <input inputMode="decimal" placeholder="optional" value={inputs.implementation_cost} onChange={onNum('implementation_cost')} className="form-control" />

          <div className="d-flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="form-control"
            />
            <button onClick={saveScenario} disabled={busy} className="btn btn-primary">Save Scenario</button>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h3 className="h5">Results</h3>
              {!canSimulate && <p className="text-secondary">Enter values to see results.</p>}
              {error && <p className="text-danger">{error}</p>}
              {results && (
                <ul className="mb-0">
                  <li><strong>Monthly savings:</strong> ${results.monthly_savings?.toLocaleString()}</li>
                  <li><strong>Payback (months):</strong> {results.payback_months ?? '—'}</li>
                  <li><strong>ROI (%):</strong> {results.roi_percentage ?? '—'}</li>
                  <li className="text-secondary"><small>Includes boost factor {results.boost_factor}</small></li>
                </ul>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h3 className="h5">Saved Scenarios</h3>
              {scenarios.length === 0 ? (
                <p className="text-secondary mb-0">No scenarios yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {scenarios.map(s => (
                    <li key={s.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                      <span>
                        <strong>{s.scenario_name}</strong>
                        <span className="text-secondary ms-2"><small>{new Date(s.created_at).toLocaleString()}</small></span>
                      </span>
                      <span className="d-flex gap-2">
                        <button onClick={() => void loadScenario(s.id)} disabled={busy} className="btn btn-outline-secondary btn-sm">Load</button>
                        <button onClick={() => void deleteScenario(s.id)} disabled={busy} className="btn btn-outline-danger btn-sm">Delete</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h3 className="h5">Download Full Report</h3>
              <p className="text-secondary">Enter a valid email to enable the download.</p>
              <div className="d-flex gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
                <button
                  onClick={async () => {
                  setError(null)
                  const emailOk = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
                  if (!emailOk) {
                    setError('Enter a valid email to download the report')
                    return
                  }
                  if (!canSimulate) {
                    setError('Enter required inputs before generating report')
                    return
                  }
                  try {
                    const body: Record<string, unknown> = {
                      email,
                      labor_cost_manual: Number(inputs.labor_cost_manual),
                      error_savings: Number(inputs.error_savings),
                      auto_cost: Number(inputs.auto_cost),
                    }
                    if (isValidNumber(inputs.implementation_cost)) {
                      body.implementation_cost = Number(inputs.implementation_cost)
                    }
                    const res = await fetch('/api/report/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    })
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}))
                      throw new Error(data.error || 'Report generation failed')
                    }
                    // Try to honor filename from Content-Disposition, fallback
                    const dispo = res.headers.get('Content-Disposition') || ''
                    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(dispo)
                    const filename = decodeURIComponent(match?.[1] || match?.[2] || 'roi_report.txt')
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(url)
                  } catch (e: any) {
                    setError(e.message || 'Report error')
                  }
                }}
                disabled={busy || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)}
                  className="btn btn-success"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


