import { useState, useEffect, useCallback } from 'react'
import { expenseService } from '../services/auth'
import ExpenseForm from './ExpenseForm'
import toast from 'react-hot-toast'

const CATEGORIES = ['','Food','Transport','Shopping','Utilities','Health','Entertainment','Travel','Education','Housing','Other']

const catClass = (c) => ({
  Food:'cat-Food', Transport:'cat-Transport', Shopping:'cat-Shopping',
  Utilities:'cat-Utilities', Health:'cat-Health', Entertainment:'cat-Entertainment',
  Travel:'cat-Travel', Education:'cat-Education', Housing:'cat-Housing',
}[c] || 'badge-gray')

export default function ExpenseList({ refreshTrigger, onDataChange }) {
  const [expenses, setExpenses]     = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(0)
  const [loading, setLoading]       = useState(false)
  const [filters, setFilters]       = useState({ category: '', start: '', end: '' })
  const [editExpense, setEditExpense] = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [deleteId, setDeleteId]     = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 10 }
      if (filters.category) params.category = filters.category
      if (filters.start)    params.start    = filters.start
      if (filters.end)      params.end      = filters.end
      const { data } = await expenseService.getAll(params)
      setExpenses(data.content || [])
      setTotal(data.totalElements || 0)
      setTotalPages(data.totalPages || 1)
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [page, filters, refreshTrigger])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleDelete = async (id) => {
    try {
      await expenseService.remove(id)
      toast.success('Expense deleted')
      setDeleteId(null)
      fetchExpenses()
      onDataChange?.()
    } catch { toast.error('Failed to delete') }
  }

  const handleFormSuccess = () => {
    setShowForm(false); setEditExpense(null)
    fetchExpenses(); onDataChange?.()
  }

  const setFilter = (k) => (e) => { setPage(0); setFilters(p => ({ ...p, [k]: e.target.value })) }
  const hasFilter = filters.category || filters.start || filters.end

  const fmt = (amount, currency) =>
    new Intl.NumberFormat('en-IN', { style:'currency', currency: currency||'INR', maximumFractionDigits:2 }).format(amount)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="badge badge-gray">{total} expenses</span>

          <select className="form-select" value={filters.category} onChange={setFilter('category')}
            style={{ width: 140, padding: '7px 12px', fontSize: 13 }}>
            <option value="">All categories</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
          </select>

          <input className="form-input" type="date" value={filters.start} onChange={setFilter('start')}
            style={{ width: 142, padding: '7px 12px', fontSize: 13 }} />
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
          <input className="form-input" type="date" value={filters.end} onChange={setFilter('end')}
            style={{ width: 142, padding: '7px 12px', fontSize: 13 }} />

          {hasFilter && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ category:'', start:'', end:'' }); setPage(0) }}>
              Clear
            </button>
          )}
        </div>

        <button className="btn btn-primary btn-sm"
          onClick={() => { setEditExpense(null); setShowForm(true) }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add expense
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Expense</th><th>Category</th><th>Payment</th>
              <th style={{ textAlign: 'right' }}>Amount</th><th style={{ width: 72 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding: 48 }}>
                <div style={{ display:'flex', justifyContent:'center' }}><div className="spinner spinner-lg" /></div>
              </td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/>
                    </svg>
                  </div>
                  <h3>No expenses found</h3>
                  <p>Add your first expense or adjust the filters above</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { setEditExpense(null); setShowForm(true) }}>
                    Add expense
                  </button>
                </div>
              </td></tr>
            ) : expenses.map(exp => (
              <tr key={exp.id}>
                <td style={{ color:'var(--text-muted)', fontSize:13, whiteSpace:'nowrap' }}>{exp.date}</td>
                <td>
                  <div style={{ fontWeight:500, color:'var(--text)', fontSize:14 }}>{exp.title}</div>
                  {exp.description && <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:2 }}>{exp.description.slice(0,60)}</div>}
                  {exp.tags && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{exp.tags}</div>}
                </td>
                <td>
                  <span className={`badge ${catClass(exp.category)}`}>{exp.category}</span>
                </td>
                <td style={{ color:'var(--text-muted)', fontSize:13 }}>{exp.paymentMethod || '—'}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text)', whiteSpace:'nowrap' }}>
                  {fmt(exp.amount, exp.currency)}
                </td>
                <td>
                  <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                    <button className="btn btn-ghost btn-icon" title="Edit"
                      onClick={() => { setEditExpense(exp); setShowForm(true) }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="btn btn-danger btn-icon" title="Delete" onClick={() => setDeleteId(exp.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p-1)}>← Prev</button>
          <span className="page-info">{page+1} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)}>Next →</button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && <ExpenseForm expense={editExpense} onSuccess={handleFormSuccess} onClose={() => { setShowForm(false); setEditExpense(null) }} />}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:360 }}>
            <div style={{ textAlign:'center', padding: '8px 0 24px' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:'var(--red-dim)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:8 }}>Delete expense?</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>This action cannot be undone.</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}