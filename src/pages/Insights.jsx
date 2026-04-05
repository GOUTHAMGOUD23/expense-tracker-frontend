import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { insightService } from '../services/auth'
import toast from 'react-hot-toast'

// ── Markdown-lite renderer (bold, bullets) ────────────────
function AiText({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />
        const isBullet = /^[-•*]\s/.test(line.trim())
        const content  = line.replace(/^[-•*]\s/, '').replace(/\*\*(.*?)\*\*/g, '|||$1|||')
        const parts    = content.split('|||')
        return (
          <div key={i} style={{ display: 'flex', gap: isBullet ? 10 : 0, alignItems: 'flex-start' }}>
            {isBullet && <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2, fontSize: 16 }}>◦</span>}
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
              {parts.map((p, j) =>
                j % 2 === 1
                  ? <strong key={j} style={{ color: 'var(--text)', fontWeight: 700 }}>{p}</strong>
                  : p
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Single insight panel ──────────────────────────────────
function InsightPanel({ title, badge, badgeClass = 'badge-purple', icon, children, loading, onRefresh }) {
  return (
    <div className="card slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={styles.iconBox}>{icon}</div>
          <div>
            <h3 style={styles.panelTitle}>{title}</h3>
            {badge && <span className={`badge ${badgeClass}`} style={{ marginTop: 4 }}>{badge}</span>}
          </div>
        </div>
        {onRefresh && (
          <button className="btn btn-ghost btn-icon" onClick={onRefresh} title="Refresh" disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }}>
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        )}
      </div>
      {loading
        ? <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0' }}>
            <div className="spinner" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analysing your data…</span>
          </div>
        : children
      }
    </div>
  )
}

// ── Anomaly card ──────────────────────────────────────────
function AnomalyCard({ item }) {
  return (
    <div style={styles.anomalyCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</span>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--red)', fontSize: 15 }}>
          ₹{Number(item.amount).toLocaleString('en-IN')}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span className="badge badge-gray">{item.category}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>{item.date}</span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function Insights() {
  const [monthly,   setMonthly]   = useState(null)
  const [anomaly,   setAnomaly]   = useState(null)
  const [budget,    setBudget]    = useState(null)
  const [loadingM,  setLoadingM]  = useState(false)
  const [loadingA,  setLoadingA]  = useState(false)
  const [loadingB,  setLoadingB]  = useState(false)
  const [loadingQ,  setLoadingQ]  = useState(false)
  const [question,  setQuestion]  = useState('')
  const [qaHistory, setQaHistory] = useState([])

  // Load all panels on mount
  useEffect(() => {
    fetchMonthly()
    fetchAnomalies()
    fetchBudget()
  }, [])

  const fetchMonthly = async () => {
    setLoadingM(true)
    try {
      const { data } = await insightService.monthly()
      setMonthly(data)
    } catch { toast.error('Could not load monthly insights') }
    finally { setLoadingM(false) }
  }

  const fetchAnomalies = async () => {
    setLoadingA(true)
    try {
      const { data } = await insightService.anomalies()
      setAnomaly(data)
    } catch { toast.error('Could not load anomaly data') }
    finally { setLoadingA(false) }
  }

  const fetchBudget = async () => {
    setLoadingB(true)
    try {
      const { data } = await insightService.budget()
      setBudget(data)
    } catch { toast.error('Could not load budget suggestions') }
    finally { setLoadingB(false) }
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    const q = question.trim()
    setQuestion('')
    setLoadingQ(true)
    setQaHistory(h => [{ q, a: null, id: Date.now() }, ...h])
    try {
      const { data } = await insightService.ask(q)
      setQaHistory(h => h.map((item, i) => i === 0 ? { ...item, a: data.answer } : item))
    } catch {
      setQaHistory(h => h.map((item, i) => i === 0 ? { ...item, a: 'Sorry, I could not answer that right now.' } : item))
    } finally {
      setLoadingQ(false)
    }
  }

  const fmtINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  return (
    <div className="page">
      <Navbar />
      <main style={{ flex: 1, paddingTop: 32, paddingBottom: 60 }}>
        <div className="container">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ ...styles.iconBox, background: 'rgba(124,106,247,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
                AI Insights
              </h1>
              <span className="badge badge-purple">Powered by Ollama</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500 }}>
              Claude analyses your spending patterns to surface personalised insights, flag anomalies, and suggest smarter budgets.
            </p>
          </div>

          <div style={styles.grid}>

            {/* ── Monthly Insights ── */}
            <div style={{ gridColumn: 'span 2' }}>
              <InsightPanel
                title="Monthly Snapshot"
                badge={monthly ? `${monthly.period}` : null}
                badgeClass="badge-purple"
                loading={loadingM}
                onRefresh={fetchMonthly}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                }
              >
                {monthly && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div style={styles.miniStat}>
                        <span style={styles.miniStatLabel}>Total Spent</span>
                        <span style={{ ...styles.miniStatValue, color: 'var(--accent)' }}>{fmtINR(monthly.total)}</span>
                      </div>
                      <div style={styles.miniStat}>
                        <span style={styles.miniStatLabel}>Transactions</span>
                        <span style={{ ...styles.miniStatValue, color: 'var(--green)' }}>{monthly.expenseCount || 0}</span>
                      </div>
                    </div>
                    <div style={styles.aiBox}>
                      <div style={styles.aiBoxLabel}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        Claude's Analysis
                      </div>
                      <AiText text={monthly.insight} />
                    </div>
                  </div>
                )}
              </InsightPanel>
            </div>

            {/* ── Anomaly Detection ── */}
            <div>
              <InsightPanel
                title="Unusual Spending"
                badge={anomaly ? `${anomaly.anomalies?.length || 0} flagged` : null}
                badgeClass={anomaly?.anomalies?.length > 0 ? 'badge-red' : 'badge-green'}
                loading={loadingA}
                onRefresh={fetchAnomalies}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                }
              >
                {anomaly && (() => {
                  // Backend may return anomalies as a string when no data exists — always normalise to array
                  const anomalyList = Array.isArray(anomaly.anomalies) ? anomaly.anomalies : []
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {anomalyList.length > 0 ? (
                        <>
                          <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                            <div style={styles.miniStat}>
                              <span style={styles.miniStatLabel}>Avg transaction</span>
                              <span style={styles.miniStatValue}>₹{Number(anomaly.mean || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={styles.miniStat}>
                              <span style={styles.miniStatLabel}>Anomaly threshold</span>
                              <span style={{ ...styles.miniStatValue, color: 'var(--red)' }}>₹{Number(anomaly.threshold || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {anomalyList.map(a => <AnomalyCard key={a.id} item={a} />)}
                          </div>
                          <div style={styles.aiBox}>
                            <div style={styles.aiBoxLabel}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                              </svg>
                              Claude's Take
                            </div>
                            <AiText text={anomaly.aiComment} />
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                          <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>No anomalies detected</p>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                            {typeof anomaly.aiComment === 'string' ? anomaly.aiComment : typeof anomaly.anomalies === 'string' ? anomaly.anomalies : 'Your spending looks consistent!'}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </InsightPanel>
            </div>

            {/* ── Budget Suggestions ── */}
            <div>
              <InsightPanel
                title="Smart Budget"
                badge="AI Generated"
                badgeClass="badge-green"
                loading={loadingB}
                onRefresh={fetchBudget}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                }
              >
                {budget && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {budget.currentAverages && Object.keys(budget.currentAverages).length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                          Your Monthly Averages
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {Object.entries(budget.currentAverages).map(([cat, amt]) => (
                            <div key={cat} style={styles.budgetRow}>
                              <span style={{ fontSize: 13 }}>{cat}</span>
                              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>
                                {fmtINR(amt)}/mo
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={styles.aiBox}>
                      <div style={styles.aiBoxLabel}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        Claude's Budget Plan
                      </div>
                      <AiText text={budget.budgetSuggestion} />
                    </div>
                  </div>
                )}
              </InsightPanel>
            </div>

            {/* ── Ask Claude ── */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ ...styles.iconBox, background: 'rgba(124,106,247,0.15)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={styles.panelTitle}>Ask Claude</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Ask anything about your spending history
                    </p>
                  </div>
                </div>

                {/* Example prompts */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    'How much did I spend on Food last month?',
                    'What is my biggest expense category?',
                    'How can I reduce my spending?',
                    'Compare this month vs last month',
                  ].map(prompt => (
                    <button
                      key={prompt}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}
                      onClick={() => setQuestion(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleAsk} style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    placeholder="Ask a question about your expenses…"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    disabled={loadingQ}
                  />
                  <button type="submit" className="btn btn-primary" disabled={loadingQ || !question.trim()}>
                    {loadingQ
                      ? <span className="spinner" />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    }
                  </button>
                </form>

                {/* Q&A history */}
                {qaHistory.length > 0 && (
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {qaHistory.map(item => (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* Question bubble */}
                        <div style={styles.qBubble}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          <p style={{ fontSize: 14 }}>{item.q}</p>
                        </div>
                        {/* Answer */}
                        <div style={styles.aiBox}>
                          {item.a === null
                            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div className="spinner" />
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thinking…</span>
                              </div>
                            : <>
                                <div style={styles.aiBoxLabel}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                                  </svg>
                                  Claude
                                </div>
                                <AiText text={item.a} />
                              </>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    background: 'var(--bg-input)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  panelTitle: {
    fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)',
  },
  aiBox: {
    background: 'rgba(124,106,247,0.06)',
    border: '1px solid rgba(124,106,247,0.15)',
    borderRadius: 12, padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  aiBoxLabel: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontFamily: 'var(--font-head)', fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)',
  },
  miniStat: {
    display: 'flex', flexDirection: 'column', gap: 3,
    background: 'var(--bg-input)', borderRadius: 10, padding: '10px 14px',
  },
  miniStatLabel: {
    fontSize: 11, fontFamily: 'var(--font-head)', fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)',
  },
  miniStatValue: {
    fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800,
    letterSpacing: '-0.02em', color: 'var(--text)',
  },
  anomalyCard: {
    background: 'var(--red-dim)', border: '1px solid rgba(242,107,107,0.2)',
    borderRadius: 10, padding: '12px 14px',
  },
  budgetRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px',
  },
  qBubble: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: 'var(--bg-input)', borderRadius: 10,
    padding: '10px 14px', alignSelf: 'flex-start',
    maxWidth: '80%', color: 'var(--text)',
  },
}