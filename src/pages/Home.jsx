import { useState } from 'react'
import Navbar from '../components/Navbar'
import Dashboard from '../components/Dashboard'
import ExpenseList from '../components/ExpenseList'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k + 1)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page">
      <Navbar />
      <main style={{ flex: 1, padding: '32px 0 64px' }}>
        <div className="container">

          {/* Header */}
          <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
                {greeting}
              </p>
              <h1 className="page-title">{user?.name?.split(' ')[0]}'s Dashboard</h1>
              <p className="page-subtitle">Track · Analyse · Optimise your spending</p>
            </div>

            <div className="tabs">
              {[
                { id: 'Overview', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                { id: 'Transactions', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
              ].map(t => (
                <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.icon}{t.id}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="fade-in" key={tab}>
            {tab === 'Overview'      && <Dashboard refreshTrigger={refreshKey} />}
            {tab === 'Transactions'  && <ExpenseList refreshTrigger={refreshKey} onDataChange={refresh} />}
          </div>
        </div>
      </main>
    </div>
  )
}