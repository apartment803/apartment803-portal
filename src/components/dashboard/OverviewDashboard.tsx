'use client'
import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, eachDayOfInterval, subDays } from 'date-fns'
import { Phone, ThumbsUp, ThumbsDown, Calendar, Clock } from 'lucide-react'

interface Call { id: string; duration_seconds: number; outcome: string; direction: string; created_at: string }
interface Props { calls: Call[]; minuteLimit: number; minutesUsed: number; clientName: string }

const Tip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:8, padding:'7px 12px', fontSize:11, color:'#3C3C43', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
    <div style={{ color:'#AEAEB2', marginBottom:2 }}>{label}</div>
    <div style={{ fontWeight:500, color:'#1C1C1E' }}>{payload[0].value} calls</div>
  </div>
) : null

const PeakDot = (props: any) => {
  const { cx, cy, value, data } = props
  if (!data) return null
  const max = Math.max(...data.map((d: any) => d.calls))
  if (value !== max || max === 0) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#0A84FF" fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={3.5} fill="#0A84FF" />
    </g>
  )
}

export default function OverviewDashboard({ calls, minuteLimit, minutesUsed, clientName }: Props) {
  const total = calls.length
  const posLeads = calls.filter(c => ['lead_qualified','appointment_booked'].includes(c.outcome)).length
  const negLeads = calls.filter(c => c.outcome === 'missed').length
  const appts = calls.filter(c => c.outcome === 'appointment_booked').length
  const other = total - posLeads
  const posRate = total ? Math.round((posLeads/total)*100) : 0
  const negRate = total ? Math.round((negLeads/total)*100) : 0
  const apptRate = total ? Math.round((appts/total)*100) : 0
  const minPct = Math.min(100, Math.round((minutesUsed/minuteLimit)*100))
  const otherPct = 100 - posRate

  const volData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
    return days.map(d => {
      const lbl = format(d, 'MMM d')
      return { date: lbl, calls: calls.filter(c => format(new Date(c.created_at),'MMM d') === lbl).length }
    })
  }, [calls])

  const sentData = [
    { name:'Positive', value: posLeads || 0,                          color:'#30D158' },
    { name:'Other',    value: other > 0 ? other : (total === 0 ? 1 : 0), color:'#E5E5E5' },
  ]

  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'16px 16px 14px' }

  return (
    <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* Live badge */}
      <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:'#AEAEB2', marginBottom:18 }}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#30D158', boxShadow:'0 0 0 2px rgba(48,209,88,0.2)', display:'inline-block' }} />
        Live performance · AI agents active
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:8 }}>
        {[
          { label:'Total Calls',    icon:<Phone size={12}/>,       val:total,    s:`last 30 days`,           color:'#1C1C1E', lc:'#AEAEB2' },
          { label:'Positive Leads', icon:<ThumbsUp size={12}/>,   val:posLeads, s:`${posRate}% rate`,        color:'#30D158', lc:'#30D158' },
          { label:'Negative Leads', icon:<ThumbsDown size={12}/>, val:negLeads, s:`${negRate}% rate`,        color:'#FF453A', lc:'#FF453A' },
          { label:'Appointments',   icon:<Calendar size={12}/>,   val:appts,    s:`${apptRate}% conversion`, color:'#0A84FF', lc:'#0A84FF' },
        ].map(({ label, icon, val, s, color, lc }) => (
          <div key={label} style={card}>
            <div style={{ fontSize:10, color:lc, marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ color:lc }}>{icon}</span>{label}
            </div>
            <div style={{ fontSize:36, fontWeight:300, lineHeight:1, letterSpacing:'-0.03em', marginBottom:4, color }}>{val}</div>
            <div style={{ fontSize:10, color:'#AEAEB2' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Minute bar */}
      <div style={{ ...card, marginBottom:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:12, color:'#3C3C43', display:'flex', alignItems:'center', gap:6 }}>
            <Clock size={13} color="#AEAEB2" strokeWidth={1.75} /> Minute Allowance
          </div>
          <div style={{ fontSize:12, color:'#8E8E93' }}>{minutesUsed}.0 / {minuteLimit} min</div>
        </div>
        <div style={{ height:5, borderRadius:3, background:'#E5E5E5', overflow:'hidden' }}>
          <div style={{ height:5, borderRadius:3, width:`${minPct}%`, background:'linear-gradient(90deg, #0A84FF 0%, #30D158 100%)', transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'#C7C7CC' }}>
          <span style={{ color:'#0A84FF' }}>● Low usage</span>
          <span>{minPct}% used · {minuteLimit - minutesUsed} min remaining</span>
          <span style={{ color:'#FF9F0A' }}>● Near limit</span>
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 210px', gap:8 }}>

        {/* Call Volume */}
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Call Volume</div>
          <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:14 }}>Daily calls — last 14 days</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={volData} margin={{ top:8, right:4, left:-18, bottom:4 }}>
              <defs>
                <linearGradient id="vertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0A84FF" stopOpacity={1}/>
                  <stop offset="60%"  stopColor="#0A84FF" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="#0A84FF" stopOpacity={0.12}/>
                </linearGradient>
                <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0A84FF" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#0A84FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize:9, fill:'#C7C7CC', fontFamily:'Inter' }} axisLine={false} tickLine={false} interval={2}/>
              <YAxis tick={{ fontSize:9, fill:'#C7C7CC', fontFamily:'Inter' }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<Tip/>}/>
              <Area
                type="monotone" dataKey="calls"
                stroke="url(#vertGrad)" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round"
                fill="url(#areaFade)"
                dot={(props: any) => <PeakDot {...props} data={volData}/>}
                activeDot={{ r:3, fill:'#0A84FF', strokeWidth:0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize:9, color:'#AEAEB2', marginTop:4 }}>
            Line intensity reflects call volume — brighter at peak activity
          </div>
        </div>

        {/* Sentiment — 2 segment */}
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Sentiment</div>
          <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:10 }}>{total} total calls</div>
          <div style={{ position:'relative', display:'flex', justifyContent:'center', alignItems:'center', width:130, height:130, margin:'0 auto 12px' }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={sentData} cx="50%" cy="50%" innerRadius={46} outerRadius={62} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                  {sentData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', textAlign:'center', pointerEvents:'none' }}>
              <div style={{ fontSize:26, fontWeight:300, color:'#1C1C1E', lineHeight:1, letterSpacing:'-0.02em' }}>{posRate}%</div>
              <div style={{ fontSize:9, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 }}>Positive</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {[
              { dot:'#30D158', label:'Positive', count:posLeads,  pct:posRate  },
              { dot:'#E5E5E5', label:'Other',    count:other,     pct:otherPct },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#3C3C43' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:r.dot, display:'inline-block' }}/>
                  {r.label}
                </div>
                <div style={{ fontSize:11.5, color:'#AEAEB2' }}>{r.count} ({r.pct}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View all */}
      <div style={{ textAlign:'center', paddingTop:14 }}>
        <a href="/dashboard/calls" style={{ fontSize:11.5, color:'#AEAEB2', textDecoration:'none' }}>
          View all {total} calls →
        </a>
      </div>
    </div>
  )
}
