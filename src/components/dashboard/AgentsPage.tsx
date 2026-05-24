'use client'
import { Bot, Phone, Bell, UserCheck, CheckCircle, Circle } from 'lucide-react'

interface Props { clientName: string; minuteLimit: number }

const agents = [
  { icon: 'phone', name:'AI Receptionist', type:'Inbound Calls', status:'active', color:'#0A84FF',
    description:'Answers every inbound call instantly, 24/7. Greets callers professionally, collects their name and reason for calling, and routes them appropriately.',
    capabilities:['Answers calls 24/7','Caller identification','Smart call routing','Natural conversation'] },
  { icon: 'usercheck', name:'Intake Agent', type:'Lead Qualification', status:'active', color:'#30D158',
    description:'Qualifies inbound leads by asking the right questions. Determines case viability, collects key information, and scores each lead automatically.',
    capabilities:['Lead scoring','Case qualification','Data collection','CRM logging'] },
  { icon: 'bell', name:'Reminder Agent', type:'Outbound Calls', status:'active', color:'#FF9F0A',
    description:'Proactively calls clients to confirm upcoming appointments, reducing no-show rates and keeping your schedule full.',
    capabilities:['Appointment reminders','Confirmation collection','Reschedule requests','SMS follow-up'] },
  { icon: 'bot', name:'Follow-Up Agent', type:'Post-Call Outreach', status:'inactive', color:'#BF5AF2',
    description:"Follows up with leads who didn't convert on the first call. Re-engages cold prospects and nurtures them toward booking a consultation.",
    capabilities:['Lead re-engagement','Follow-up sequencing','Sentiment tracking','Booking assistance'] },
]

function AgentIcon({ type, color }: { type: string, color: string }) {
  const props = { size:18, color, strokeWidth:1.75 }
  if (type === 'phone') return <Phone {...props}/>
  if (type === 'usercheck') return <UserCheck {...props}/>
  if (type === 'bell') return <Bell {...props}/>
  return <Bot {...props}/>
}

export default function AgentsPage({ clientName, minuteLimit }: Props) {
  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'20px 20px 18px' }
  return (
    <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:3 }}>AI Agents</h1>
        <p style={{ fontSize:12, color:'#AEAEB2' }}>Your deployed AI agents and their current status.</p>
      </div>
      <div style={{ ...card, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#30D158', display:'inline-block', boxShadow:'0 0 0 2px rgba(48,209,88,0.2)' }}/>
          <span style={{ fontSize:12, color:'#3C3C43' }}>3 agents active · 1 inactive</span>
        </div>
        <div style={{ fontSize:11, color:'#AEAEB2' }}>{clientName}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {agents.map(agent => (
          <div key={agent.name} style={{ ...card, opacity:agent.status==='inactive'?0.65:1 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <AgentIcon type={agent.icon} color={agent.color}/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E' }}>{agent.name}</div>
                  <div style={{ fontSize:11, color:'#AEAEB2', marginTop:2 }}>{agent.type}</div>
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:500, padding:'3px 9px', borderRadius:20, background:agent.status==='active'?'#F0FDF4':'#F8F8F8', color:agent.status==='active'?'#16A34A':'#8E8E93' }}>
                {agent.status==='active'?'● Active':'○ Inactive'}
              </span>
            </div>
            <p style={{ fontSize:12, color:'#3C3C43', lineHeight:1.6, marginBottom:16 }}>{agent.description}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {agent.capabilities.map(cap => (
                <div key={cap} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {agent.status==='active' ? <CheckCircle size={12} color={agent.color} strokeWidth={2}/> : <Circle size={12} color="#C7C7CC" strokeWidth={2}/>}
                  <span style={{ fontSize:11, color:agent.status==='active'?'#3C3C43':'#AEAEB2' }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, padding:'14px 18px', background:'#F8F8F8', borderRadius:14, display:'flex', alignItems:'center', gap:10 }}>
        <Bot size={14} color="#AEAEB2" strokeWidth={1.75}/>
        <span style={{ fontSize:11, color:'#AEAEB2' }}>Agent configuration is managed by your Apartment 803 account manager. Contact us to adjust scripts, add questions, or activate new agents.</span>
      </div>
    </div>
  )
}