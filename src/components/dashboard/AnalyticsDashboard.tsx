'use client'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, eachDayOfInterval, subDays } from 'date-fns'

interface Call { id: string; duration_seconds: number; outcome: string; created_at: string }
interface Props { calls: Call[]; minuteLimit: number; minutesUsed: number }

const Tip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:8, padding:'7px 12px', fontSize:11, color:'#3C3C43', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
    <div style={{ color:'#AEAEB2', marginBottom:2 }}>{label}</div>
    <div style={{ fontWeight:500, color:'#1C1C1E' }}>{payload[0].value}</div>
  </div>
) : null

export default function AnalyticsDashboard({ calls, minuteLimit, minutesUsed }: Props) {
  const total = calls.length
  const appts = calls.filter(c => c.outcome==='appointment_booked').length
  const minPct = Math.min(100, Math.round((minutesUsed/minuteLimit)*100))
  const avgDur = total ? Math.round(calls.reduce((s,c) => s+(c.duration_seconds||0),0)/total) : 0
  const roiSaved = Math.round(minutesUsed * 0.75)

  const volData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
    return days.map(d => {
      const lbl = format(d, 'MMM d')
      return { date: lbl, calls: calls.filter(c => format(new Date(c.created_at),'MMM d')===lbl).length }
    })
  }, [calls])

  const minData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
    return days.map(d => {
      const lbl = format(d, 'MMM d')
      const dayMin = Math.round(calls.filter(c => format(new Date(c.created_at),'MMM d')===lbl).reduce((s,c)=>s+(c.duration_seconds||0),0)/60)
      return { date: lbl, minutes: dayMin }
    })
  }, [calls])

  const outcomeData = [
    { name:'Booked',      value: calls.filter(c=>c.outcome==='appointment_booked').length, color:'#30D158' },
    { name:'Qualified',   value: calls.filter(c=>c.outcome==='lead_qualified').length,     color:'#0A84FF' },
    { name:'Completed',   value: calls.filter(c=>c.outcome==='completed').length,          color:'#AEAEB2' },
    { name:'Transferred', value: calls.filter(c=>c.outcome==='transferred').length,        color:'#BF5AF2' },
    { name:'Voicemail',   value: calls.filter(c=>c.outcome==='voicemail').length,          color:'#C7C7CC' },
    { name:'Missed',      value: calls.filter(c=>c.outcome==='missed').length,             color:'#FF453A' },
  ]

  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'16px 16px 14px' }

  return (
    <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:3 }}>Analytics</h1>
        <p style={{ fontSize:12, color:'#AEAEB2' }}>Performance insights across all AI agent interactions.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:8 }}>
        {[
          { label:'Total Calls',    val:total,    sub:'last 30 days',               color:'#1C1C1E' },
          { label:'Appointments',   val:appts,    sub:total?Math.round((appts/total)*100)+'% conversion':'0%', color:'#30D158' },
          { label:'Avg Duration',   val:Math.floor(avgDur/60)+':'+(avgDur%60).toString().padStart(2,'0'), sub:'per call', color:'#0A84FF' },
          { label:'Est. ROI Saved', val:'$'+roiSaved, sub:'vs. human receptionist', color:'#FF9F0A' },
        ].map(({ label, val, sub, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize:10, color:'#AEAEB2', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
            <div style={{ fontSize:32, fontWeight:300, color, lineHeight:1, letterSpacing:'-0.03em', marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:10, color:'#AEAEB2' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginBottom:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:12, color:'#3C3C43' }}>Monthly Minutes</div>
          <div style={{ fontSize:12, color:'#8E8E93' }}>{minutesUsed} / {minuteLimit} min</div>
        </div>
        <div style={{ height:5, borderRadius:3, background:'#E5E5E5', overflow:'hidden' }}>
          <div style={{ height:5, borderRadius:3, width:minPct+'%', background:'linear-gradient(90deg, #0A84FF 0%, #30D158 100%)', transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'#C7C7CC' }}>
          <span style={{ color:'#0A84FF' }}>● Low usage</span>
          <span>{minPct}% used · {minuteLimit-minutesUsed} min remaining</span>
          <span style={{ color:'#FF9F0A' }}>● Near limit</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Call Volume</div>
          <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:14 }}>Daily calls — last 30 days</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volData} margin={{ top:4, right:4, left:-18, bottom:4 }}>
              <XAxis dataKey="date" tick={{ fontSize:9, fill:'#C7C7CC' }} axisLine={false} tickLine={false} interval={6}/>
              <YAxis tick={{ fontSize:9, fill:'#C7C7CC' }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="calls" fill="#0A84FF" fillOpacity={0.8} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Minutes Used Per Day</div>
          <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:14 }}>Daily usage — last 30 days</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={minData} margin={{ top:4, right:4, left:-18, bottom:4 }}>
              <XAxis dataKey="date" tick={{ fontSize:9, fill:'#C7C7CC' }} axisLine={false} tickLine={false} interval={6}/>
              <YAxis tick={{ fontSize:9, fill:'#C7C7CC' }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<Tip/>}/>
              <Line type="monotone" dataKey="minutes" stroke="#30D158" strokeWidth={2} dot={false} activeDot={{ r:3, fill:'#30D158', strokeWidth:0 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Call Outcomes</div>
        <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:16 }}>Breakdown by result</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
          {outcomeData.map(({ name, value, color }) => (
            <div key={name} style={{ textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:300, color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{value}</div>
              <div style={{ fontSize:10, color:'#AEAEB2' }}>{name}</div>
              <div style={{ fontSize:10, color:'#C7C7CC' }}>{total ? Math.round((value/total)*100) : 0}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}