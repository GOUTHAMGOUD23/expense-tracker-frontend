import { useState, useEffect } from 'react'
import { expenseService } from '../services/auth'
import toast from 'react-hot-toast'

const CATEGORIES = ['Food','Transport','Shopping','Utilities','Health','Entertainment','Travel','Education','Housing','Other']
const PAYMENTS   = ['Cash','Card','UPI','Net Banking','Wallet','Other']
const DEFAULT    = { title:'', description:'', amount:'', category:'Food', date: new Date().toISOString().split('T')[0], currency:'INR', paymentMethod:'UPI', tags:'' }

export default function ExpenseForm({ expense, onSuccess, onClose }) {
  const isEdit = Boolean(expense?.id)
  const [form, setForm]       = useState(DEFAULT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (expense) setForm({ title: expense.title||'', description: expense.description||'', amount: expense.amount||'', category: expense.category||'Food', date: expense.date||DEFAULT.date, currency: expense.currency||'INR', paymentMethod: expense.paymentMethod||'UPI', tags: expense.tags||'' })
  }, [expense])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (isEdit) { await expenseService.update(expense.id, payload); toast.success('Expense updated') }
      else        { await expenseService.create(payload);              toast.success('Expense added') }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="e.g. Lunch at Swiggy"
              value={form.title} onChange={set('title')} required maxLength={100} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0.00"
                value={form.amount} onChange={set('amount')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select" value={form.currency} onChange={set('currency')}>
                <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={set('date')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-select" value={form.paymentMethod} onChange={set('paymentMethod')}>
              {PAYMENTS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description <span style={{ color:'var(--text-dim)', textTransform:'none', letterSpacing:0, fontWeight:400 }}>(optional)</span></label>
            <textarea className="form-textarea" placeholder="Add a note…" value={form.description} onChange={set('description')} maxLength={500} style={{ minHeight:72 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Tags <span style={{ color:'var(--text-dim)', textTransform:'none', letterSpacing:0, fontWeight:400 }}>(comma-separated)</span></label>
            <input className="form-input" type="text" placeholder="work, personal, subscriptions"
              value={form.tags} onChange={set('tags')} />
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" />{isEdit ? 'Saving…' : 'Adding…'}</> : isEdit ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}