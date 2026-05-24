'use client'
import { CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react'

interface Props { clientName: string; minuteLimit: number; minutesUsed: number }

const invoices = [
  { date:'May 1, 2026',  amount:'$647.00',   status:'Paid', id:'INV-2026-005', note:'' },
  { date:'Apr 1, 2026',  amount:'$647.00',   status:'Paid', id:'INV-2026-004', note:'' },
  { date:'Mar 1, 2026',  amount:'$647.00',   status:'Paid', id:'INV-2026-003', note:'' },
  { date:'Feb 1, 2026',  amount:'$647.00',   status:'Paid', id:'INV-2026-002', note:'' },
  { date:'Jan 1, 2026',  amount:'$3,147.00', status:'Paid', id:'INV-2026-001', note:'Includes $2,500 setup fee' },
]

export default function BillingPage({ clientName, minuteLimit, minutesUsed }: Props) {
  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'18px 20px' }
  const minPct = Math.min(100, Math.round((minutesUsed/minuteLimit)*100))
  const currentPlan = minuteLimit <= 300 ? 'Always Answered' : minuteLimit <= 600 ? 'Intake & Convert' : 'Full AI Front Desk'
  const currentPrice = minuteLimit <= 300 ? 397 : minuteLimit <= 600 ? 647 : 1097
  const agentCount = minuteLimit <= 300 ? 2 : minuteLimit <= 600 ? 3 : 4
  const features = [minuteLimit + ' minutes / month', agentCount + ' AI agents deployed', '24/7 call coverage', 'Real-time dashboard', minuteLimit > 300 ? 'CRM integration' : null, minuteLimit > 600 ? 'Custom agent scripts' : null].filter(Boolean) as string[]

  return (
    <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:3 }}>Package & Billing</h1>
        <p style={{ fontSize:12, color:'#AEAEB2' }}>Your current plan, usage, and payment history.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <div style={card}>
          <div style={{ fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Current Plan</div>
          <div style={{ fontSize:28, fontWeight:300, color:'#1C1C1E', letterSpacing:'-0.02em', marginBottom:4 }}>{currentPlan}</div>
          <div style={{ fontSize:13, color:'#AEAEB2', marginBottom:16 }}>${currentPrice}<span style={{ fontSize:11 }}>/mo</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {features.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle size={12} color="#30D158" strokeWidth={2}/>
                <span style={{ fontSize:11, color:'#3C3C43' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>This Month</div>
          <div style={{ fontSize:28, fontWeight:300, color:'#1C1C1E', letterSpacing:'-0.02em', marginBottom:4 }}>{minutesUsed} <span style={{ fontSize:14, color:'#AEAEB2' }}>/ {minuteLimit} min</span></div>
          <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:16 }}>{minPct}% of allowance used</div>
          <div style={{ height:5, borderRadius:3, background:'#E5E5E5', overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:5, borderRadius:3, width:minPct+'%', background:'linear-gradient(90deg, #0A84FF 0%, #30D158 100%)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#C7C7CC', marginBottom:20 }}>
            <span>0</span><span>{minuteLimit-minutesUsed} min remaining</span><span>{minuteLimit}</span>
          </div>
          <div style={{ padding:'12px 14px', background:'#FFFFFF', borderRadius:10 }}>
            <div style={{ fontSize:10, color:'#AEAEB2', marginBottom:4 }}>Overage rate</div>
            <div style={{ fontSize:13, color:'#1C1C1E', fontWeight:500 }}>$1.10 <span style={{ fontWeight:400, color:'#AEAEB2', fontSize:11 }}>per additional minute</span></div>
          </div>
        </div>
      </div>
      <div style={{ ...card, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Clock size={16} color="#0A84FF" strokeWidth={1.75}/>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:'#1C1C1E' }}>Next billing date</div>
            <div style={{ fontSize:11, color:'#AEAEB2', marginTop:2 }}>June 1, 2026</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:20, fontWeight:300, color:'#1C1C1E', letterSpacing:'-0.02em' }}>${currentPrice}.00</div>
          <div style={{ fontSize:10, color:'#AEAEB2', marginTop:2 }}>Auto-renewal</div>
        </div>
      </div>
      <div style={card}>
        <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:2 }}>Payment History</div>
        <div style={{ fontSize:11, color:'#AEAEB2', marginBottom:16 }}>All invoices for your account</div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {invoices.map((inv, i) => (
            <div key={inv.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<invoices.length-1?'0.5px solid #EFEFEF':'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FileText size={14} color="#AEAEB2" strokeWidth={1.75}/>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'#1C1C1E' }}>{inv.id}</div>
                  <div style={{ fontSize:10, color:'#AEAEB2', marginTop:1 }}>{inv.date}{inv.note?' · '+inv.note:''}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:20, background:'#F0FDF4', color:'#16A34A' }}>{inv.status}</span>
                <span style={{ fontSize:13, color:'#1C1C1E' }}>{inv.amount}</span>
                <ChevronRight size={14} color="#C7C7CC"/>
              </div>
            </div>
          ))}
        </div>
      </div>
      {minuteLimit < 1200 && (
        <div style={{ marginTop:10, padding:'16px 20px', background:'#F8F8F8', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', marginBottom:3 }}>Need more capacity?</div>
            <div style={{ fontSize:11, color:'#AEAEB2' }}>Upgrade your plan to unlock more minutes and agents.</div>
          </div>
          <div style={{ fontSize:11, color:'#0A84FF', fontWeight:500, cursor:'pointer' }}>Contact us →</div>
        </div>
      )}
    </div>
  )
}