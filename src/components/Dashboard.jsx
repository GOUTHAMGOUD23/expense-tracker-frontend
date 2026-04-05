import { useState, useEffect, useCallback } from 'react'
import { reportService } from '../services/auth'
import { CategoryPieChart, MonthlyBarChart } from './Charts'
import toast from 'react-hot-toast'

export default function Dashboard({ refreshTrigger }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await reportService.summary({})
      setSummary(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [refreshTrigger])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const { data } = type === 'csv' ? await reportService.exportCsv({}) : await reportService.exportPdf({})
      downloadBlob(data, `expenses_${new Date().toISOString().split('T')[0]}.${type}`)
      toast.success(`${type.toUpperCase()} downloaded`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="spinner spinner-lg" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total This Month',  value: fmt(summary?.total),   sub: `${summary?.count || 0} transactions`, color: 'var(--accent)', delay: '0s' },
          { label: 'Average per Txn',   value: fmt(summary?.average), sub: 'per transaction',                     color: 'var(--indigo-hl)', delay: '0.05s' },
          { label: 'Top Category',      value: summary?.topCategory || '—', sub: 'highest spend',               color: 'var(--amber)', delay: '0.10s' },
        ].map(s => (
          <div key={s.label} className="stat-card slide-up" style={{ animationDelay: s.delay }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="card-head">
            <span className="card-title">Spending by Category</span>
            <span className="badge badge-gray">This month</span>
          </div>
          <CategoryPieChart data={summary?.byCategory || {}} />
        </div>
        <div className="card slide-up" style={{ animationDelay: '0.20s' }}>
          <div className="card-head">
            <span className="card-title">Monthly Trend</span>
            <span className="badge badge-gray">Last 6 months</span>
          </div>
          <MonthlyBarChart data={summary?.monthly || {}} />
        </div>
      </div>

      {/* Export */}
      <div className="card slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="card-head">
          <div>
            <div className="card-title">Export Report</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Download your expense data</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => handleExport('csv')} disabled={!!exporting}>
              {exporting === 'csv' ? <span className="spinner" /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>}
              Export CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => handleExport('pdf')} disabled={!!exporting}>
              {exporting === 'pdf' ? <span className="spinner" /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>}
              Export PDF
            </button>
          </div>
        </div>

        {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginTop: 4 }}>
            {Object.entries(summary.byCategory).sort(([,a],[,b]) => b-a).map(([cat, amt]) => (
              <div key={cat} className="budget-row">
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
                  {fmt(amt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}