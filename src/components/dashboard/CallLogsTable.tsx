'use client'
import { useState } from 'react'
import { Phone, PhoneIncoming, PhoneOutgoing, Search, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

interface CallLog {
  id: string; direction: string; caller_number: string; duration_seconds: number
  outcome: string; transcript: string; created_at: string; agent_name?: string
  recording_url?: string | null
}

function formatDuration(s: number) {
  if (!s) return '0:00'
  return Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0')
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    appointment_booked: { bg:'#F0FDF4', color:'#16A34A', label:'Booked' },
    lead_qualified:     { bg:'#EFF6FF', color:'#2563EB', label:'Qualified' },
    transferred:        { bg:'#F5F3FF', color:'#7C3AED', label:'Transferred' },
    completed:          { bg:'#F8F8F8', color:'#8E8E93', label:'Completed' },
    voicemail:          { bg:'#F8F8F8', color:'#8E8E93', label:'Voicemail' },
    missed:             { bg:'#FFF5F5', color:'#FF453A', label:'Missed' },
  }
  const s = map[outcome] || { bg:'#F8F8F8', color:'#8E8E93', label: outcome }
  return (
    <span style={{ background:s.bg, color:s.color, fontSize:10, fontWeight:500, padding:'3px 9px', borderRadius:20, display:'inline-block' }}>
      {s.label}
    </span>
  )
}

export default function CallLogsTable({ calls, clientName }: { calls: CallLog[], clientName: string }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string|null>(null)

  const filtered = calls.filter(c =>
    (c.caller_number||'').includes(search) ||
    (c.outcome||'').toLowerCase().includes(search.toLowerCase())
  )

  const totalMin = Math.round(calls.reduce((s,c) => s+(c.duration_seconds||0), 0)/60)
  const booked = calls.filter(c => c.outcome==='appointment_booked').length
  const qualified = calls.filter(c => c.outcome==='lead_qualified').length
  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'16px 16px 14px' }

  return (
    <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:3 }}>Call Logs</h1>
          <p style={{ fontSize:12, color:'#AEAEB2' }}>Complete history of all interactions handled by your AI agents.</p>
        </div>
        <div style={{ fontSize:11, color:'#AEAEB2' }}>{clientName}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {[
          { label:'Total Calls', val:calls.length, sub:'all time' },
          { label:'Minutes Used', val:totalMin, sub:'this month' },
          { label:'Appts Booked', val:booked, sub:calls.length ? Math.round((booked/calls.length)*100)+'% rate' : '0% rate' },
          { label:'Leads Qualified', val:qualified, sub:calls.length ? Math.round((qualified/calls.length)*100)+'% rate' : '0% rate' },
        ].map(({ label, val, sub }) => (
          <div key={label} style={card}>
            <div style={{ fontSize:10, color:'#AEAEB2', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
            <div style={{ fontSize:32, fontWeight:300, color:'#1C1C1E', lineHeight:1, letterSpacing:'-0.03em', marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:10, color:'#AEAEB2' }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ position:'relative', maxWidth:300, marginBottom:16 }}>
        <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#AEAEB2', pointerEvents:'none' }} />
        <input style={{ width:'100%', background:'#F8F8F8', border:'0.5px solid #F0F0F0', borderRadius:10, padding:'9px 12px 9px 34px', fontSize:13, color:'#1C1C1E', outline:'none', fontFamily:'Inter, system-ui, sans-serif' }} placeholder="Search calls..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ background:'#F8F8F8', borderRadius:14, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'0.5px solid #EFEFEF' }}>
              {['Caller','Direction','Agent','Duration','Outcome','Date & Time',''].map(h => (
                <th key={h} style={{ fontSize:10, fontWeight:500, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', padding:'10px 14px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 20px', color:'#AEAEB2', fontSize:13 }}>
                <Phone size={22} style={{ margin:'0 auto 12px', display:'block', color:'#E5E5E5' }} />
                {search ? 'No calls match your search.' : 'No calls yet. Your AI agents are live and ready.'}
              </td></tr>
            ) : filtered.map(call => (
              <>
                <tr key={call.id} onClick={() => call.transcript && setExpanded(expanded===call.id ? null : call.id)}
                  style={{ borderBottom:'0.5px solid #EFEFEF', cursor:call.transcript?'pointer':'default' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'#1C1C1E', fontFamily:'monospace' }}>{call.caller_number||'Unknown'}</div>
                    <div style={{ fontSize:10, color:'#AEAEB2', marginTop:2 }}>inbound</div>
                  </td>
                  <td style={{ padding:'13px 14px' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#AEAEB2' }}>
                      {call.direction==='inbound' ? <PhoneIncoming size={11} color="#30D158" /> : <PhoneOutgoing size={11} color="#0A84FF" />}
                      {call.direction==='inbound' ? 'Inbound' : 'Outbound'}
                    </span>
                  </td>
                  <td style={{ padding:'13px 14px', fontSize:11, color:'#AEAEB2' }}>{call.agent_name||'AI Receptionist'}</td>
                  <td style={{ padding:'13px 14px' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#AEAEB2', fontFamily:'monospace' }}>
                      <Clock size={10} color="#E5E5E5" />{formatDuration(call.duration_seconds)}
                    </span>
                  </td>
                  <td style={{ padding:'13px 14px' }}><OutcomeBadge outcome={call.outcome} /></td>
                  <td style={{ padding:'13px 14px', fontSize:11, color:'#AEAEB2' }}>{format(new Date(call.created_at), 'MMM d, yyyy, hh:mm a')}</td>
                  <td style={{ padding:'13px 14px' }}>
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    {call.recording_url && (
      <audio controls src={call.recording_url}
        style={{ height:28, width:160, accentColor:'#1C1C1E' }}
        onClick={e => e.stopPropagation()}
      />
    )}
    {call.transcript && <span style={{ color:'#AEAEB2' }}>{expanded===call.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>}
  </div>
</td>
                </tr>
                {expanded===call.id && call.transcript && (
                  <tr key={call.id+'-tx'} style={{ borderBottom:'0.5px solid #EFEFEF' }}>
                    <td colSpan={7} style={{ padding:'0 14px 14px' }}>
                      <div style={{ background:'#FFFFFF', borderRadius:10, padding:'14px 16px' }}>
                        <div style={{ fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Call Transcript</div>
                        <p style={{ fontSize:12, color:'#3C3C43', lineHeight:1.7, whiteSpace:'pre-line', fontFamily:'monospace' }}>{call.transcript}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
