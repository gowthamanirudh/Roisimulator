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

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>ROI Simulator</h1>
      <p style={{ marginTop: 0, color: '#555' }}>Enter your monthly figures to see savings, payback, and ROI.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label>Labor cost (manual)</label>
          <input inputMode="decimal" placeholder="e.g., 5000" value={inputs.labor_cost_manual} onChange={onNum('labor_cost_manual')} style={{ width: '100%', padding: 10, marginTop: 6 }} />

          <label style={{ marginTop: 12, display: 'block' }}>Error savings</label>
          <input inputMode="decimal" placeholder="e.g., 1500" value={inputs.error_savings} onChange={onNum('error_savings')} style={{ width: '100%', padding: 10, marginTop: 6 }} />

          <label style={{ marginTop: 12, display: 'block' }}>Automation cost</label>
          <input inputMode="decimal" placeholder="e.g., 2000" value={inputs.auto_cost} onChange={onNum('auto_cost')} style={{ width: '100%', padding: 10, marginTop: 6 }} />

          <label style={{ marginTop: 12, display: 'block' }}>Implementation cost (one-time)</label>
          <input inputMode="decimal" placeholder="optional" value={inputs.implementation_cost} onChange={onNum('implementation_cost')} style={{ width: '100%', padding: 10, marginTop: 6 }} />
        </div>

        <div>
          <div style={{ border: '1px solid #e3e3e3', borderRadius: 8, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            {!canSimulate && <p style={{ color: '#777' }}>Enter values to see results.</p>}
            {error && <p style={{ color: '#b00020' }}>{error}</p>}
            {results && (
              <ul>
                <li><strong>Monthly savings:</strong> ${results.monthly_savings?.toLocaleString()}</li>
                <li><strong>Payback (months):</strong> {results.payback_months ?? '—'}</li>
                <li><strong>ROI (%):</strong> {results.roi_percentage ?? '—'}</li>
                <li style={{ color: '#777' }}><small>Includes boost factor {results.boost_factor}</small></li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


