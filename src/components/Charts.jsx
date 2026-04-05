import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const PALETTE = ['#10b981','#6366f1','#f59e0b','#f43f5e','#3b82f6','#a78bfa','#fb923c','#34d399','#2dd4bf','#c084fc']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-md)', borderRadius:10, padding:'10px 14px', fontSize:13, boxShadow:'var(--shadow)' }}>
      <p style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:4, color:'var(--text)' }}>{payload[0].name}</p>
      <p style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:600 }}>
        {new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(payload[0].value)}
      </p>
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-md)', borderRadius:10, padding:'10px 14px', fontSize:13, boxShadow:'var(--shadow)' }}>
      <p style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:4, color:'var(--text)' }}>{label}</p>
      <p style={{ color:'var(--indigo-hl)', fontFamily:'var(--font-display)', fontWeight:600 }}>
        {new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(payload[0].value)}
      </p>
    </div>
  )
}

export function CategoryPieChart({ data = {} }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value: Number(value) }))
  if (!chartData.length) return (
    <div className="empty-state" style={{ padding:40 }}>
      <p style={{ fontSize:13, color:'var(--text-dim)' }}>No category data yet</p>
    </div>
  )
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={88}
            paddingAngle={3} dataKey="value" nameKey="name" strokeWidth={0}>
            {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px', justifyContent:'center', marginTop:12 }}>
        {chartData.map((item, i) => (
          <div key={item.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: PALETTE[i % PALETTE.length], flexShrink:0 }} />
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthlyBarChart({ data = {} }) {
  const chartData = Object.entries(data).slice(-6).map(([month, total]) => ({ month: month.substring(5), total: Number(total) }))
  if (!chartData.length) return (
    <div className="empty-state" style={{ padding:40 }}>
      <p style={{ fontSize:13, color:'var(--text-dim)' }}>No monthly data yet</p>
    </div>
  )
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top:4, right:4, left:-20, bottom:0 }} barSize={26}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:12, fontFamily:'var(--font-display)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-display)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<BarTooltip />} cursor={{ fill:'rgba(99,102,241,0.07)', radius:6 }} />
        <Bar dataKey="total" fill="var(--indigo)" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}