'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/shared/Sidebar'
import { Clock, Phone, Plus, AlertCircle, ArrowRight, X } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface Lead {
  id: string
  caller_number: string
  caller_name: string | null
  incident_type: string | null
  lead_quality: 'strong' | 'moderate' | 'weak'
  status: 'new' | 'attempting_contact' | 'contacted' | 'consultation_scheduled' | 'retained' | 'lost'
  lost_reason: string | null
  contact_attempts: number
  last_contacted_at: string | null
  notes: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; next: string | null }> = {
  new:                    { label: 'New',                    bg: '#EFF6FF', color: '#2563EB', next: 'attempting_contact' },
  attempting_contact:     { label: 'Attempting Contact',     bg: '#FFF7ED', color: '#EA580C', next: 'contacted' },
  contacted:              { label: 'Contacted',              bg: '#F0FDF4', color: '#16A34A', next: 'consultation_scheduled' },
  consultation_scheduled: { label: 'Consultation Scheduled', bg: '#F5F3FF', color: '#7C3AED', next: 'retained' },
  retained:               { label: 'Retained',               bg: '#F0FDF4', color: '#15803D', next: null },
  lost:                   { label: 'Lost',                   bg: '#FFF5F5', color: '#FF453A', next: null },
}

const QUALITY_CONFIG: Record<string, { label: string; color: string }> = {
  strong:   { label: 'Strong',   color: '#16A34A' },
  moderate: { label: 'Moderate', color: '#EA580C' },
  weak:     { label: 'Weak',     color: '#AEAEB2' },
}

const LOST_REASONS = [
  'No response after multiple attempts',
  'Went with another firm',
  'Not a fit',
  'No budget',
  'Case too old',
  'Other',
]

function UrgencyTimer({ createdAt, status, lastContactedAt }: { createdAt: string; status: string; lastContactedAt?: string | null }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'new' && status !== 'attempting_contact') return
    const base = status === 'attempting_contact' && lastContactedAt ? lastContactedAt : createdAt
    const update = () => setElapsed(Date.now() - new Date(base).getTime())
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [createdAt, status, lastContactedAt])

  if (status !== 'new' && status !== 'attempting_contact') return null

  const hours = elapsed / (1000 * 60 * 60)
  const color = hours < 1 ? '#16A34A' : hours < 24 ? '#EA580C' : '#FF453A'
  const bg = hours < 1 ? '#F0FDF4' : hours < 24 ? '#FFF7ED' : '#FFF5F5'
  const timeLabel = elapsed < 60000 * 60
    ? `${Math.floor(elapsed / 60000)}m ago`
    : formatDistanceToNow(new Date(status === 'attempting_contact' && lastContactedAt ? lastContactedAt : createdAt), { addSuffix: true })
  const label = status === 'attempting_contact' ? `last attempt ${timeLabel}` : timeLabel

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:bg, color, fontSize:10, fontWeight:500, padding:'3px 8px', borderRadius:20, fontFamily:'monospace' }}>
      <Clock size={9} />
      {label}
    </span>
  )
}

function StatusCell({
  lead,
  onAdvance,
  isMobile,
}: {
  lead: Lead
  onAdvance: (id: string) => void
  isMobile: boolean
}) {
  const cfg = STATUS_CONFIG[lead.status]
  const canAdvance = cfg.next !== null

  return (
    <button
      onClick={e => { e.stopPropagation(); if (canAdvance) onAdvance(lead.id) }}
      style={{
        display:'inline-flex', alignItems:'center', gap:5,
        background: cfg.bg, color: cfg.color,
        fontSize:10, fontWeight:500, padding:'4px 10px',
        borderRadius:20, border:'none',
        cursor: canAdvance ? 'pointer' : 'default',
      }}
    >
      {cfg.label}
      {canAdvance && <ArrowRight size={9} />}
    </button>
  )
}

function LostModal({ lead, onClose, onConfirm }: { lead: Lead; onClose: () => void; onConfirm: (id: string, reason: string) => void }) {
  const [reason, setReason] = useState('')

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#FFFFFF', borderRadius:16, padding:'24px', width:360, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:15, fontWeight:500, color:'#1C1C1E', marginBottom:4 }}>Mark as Lost</div>
        <div style={{ fontSize:12, color:'#AEAEB2', marginBottom:18 }}>
          {lead.caller_name || lead.caller_number} — {lead.incident_type || 'Unknown incident'}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {LOST_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ textAlign:'left', padding:'10px 14px', borderRadius:10, border:`0.5px solid ${reason === r ? '#1C1C1E' : '#F0F0F0'}`, background: reason === r ? '#F8F8F8' : '#FFFFFF', fontSize:13, color: reason === r ? '#1C1C1E' : '#AEAEB2', cursor:'pointer', fontFamily:'Inter, system-ui, sans-serif' }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:10, border:'0.5px solid #F0F0F0', background:'#F8F8F8', fontSize:13, color:'#AEAEB2', cursor:'pointer' }}>Cancel</button>
          <button onClick={() => { if (reason) { onConfirm(lead.id, reason); onClose() } }}
            disabled={!reason}
            style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#1C1C1E', fontSize:13, color:'#FFFFFF', cursor: reason ? 'pointer' : 'not-allowed', opacity: reason ? 1 : 0.4 }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function AddLeadModal({ clientId, onClose, onAdd }: { clientId: string; onClose: () => void; onAdd: () => void }) {
  const supabase = createClient()
  const [form, setForm] = useState({ caller_number: '', caller_name: '', incident_type: '', lead_quality: 'strong' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.caller_number) return
    setSaving(true)
    await supabase.from('leads').insert({
      client_id: clientId,
      caller_number: form.caller_number,
      caller_name: form.caller_name || null,
      incident_type: form.incident_type || null,
      lead_quality: form.lead_quality,
      status: 'new',
    })
    setSaving(false)
    onAdd()
    onClose()
  }

  const field: React.CSSProperties = { width:'100%', background:'#F8F8F8', border:'0.5px solid #F0F0F0', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#1C1C1E', outline:'none', fontFamily:'Inter, system-ui, sans-serif', boxSizing:'border-box' }
  const labelStyle: React.CSSProperties = { fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5, display:'block' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#FFFFFF', borderRadius:16, padding:'24px', width:380, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:15, fontWeight:500, color:'#1C1C1E', marginBottom:18 }}>Add Lead Manually</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <span style={labelStyle}>Phone Number *</span>
            <input style={field} placeholder="+1 305 000 0000" value={form.caller_number} onChange={e => setForm(f => ({ ...f, caller_number: e.target.value }))} />
          </div>
          <div>
            <span style={labelStyle}>Name (optional)</span>
            <input style={field} placeholder="Caller's name" value={form.caller_name} onChange={e => setForm(f => ({ ...f, caller_name: e.target.value }))} />
          </div>
          <div>
            <span style={labelStyle}>Incident Type</span>
            <select style={field} value={form.incident_type} onChange={e => setForm(f => ({ ...f, incident_type: e.target.value }))}>
              <option value="">Select type</option>
              <option value="Auto Accident">Auto Accident</option>
              <option value="Workplace Injury">Workplace Injury</option>
              <option value="Slip & Fall">Slip & Fall</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <span style={labelStyle}>Lead Quality</span>
            <select style={field} value={form.lead_quality} onChange={e => setForm(f => ({ ...f, lead_quality: e.target.value }))}>
              <option value="strong">Strong</option>
              <option value="moderate">Moderate</option>
              <option value="weak">Weak</option>
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:10, border:'0.5px solid #F0F0F0', background:'#F8F8F8', fontSize:13, color:'#AEAEB2', cursor:'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#1C1C1E', fontSize:13, color:'#FFFFFF', cursor:'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Adding...' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [clientId, setClientId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('Your Business')
  const [ready, setReady] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [lostModalLead, setLostModalLead] = useState<Lead | null>(null)
  const [filter, setFilter] = useState<string>('active')
  const [isMobile, setIsMobile] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: profile } = await supabase.from('users').select('role, client_id').eq('id', user.id).single()
      if (profile?.role === 'admin') { window.location.href = '/admin/clients'; return }
      if (profile?.client_id) {
        setClientId(profile.client_id)
        const { data: client } = await supabase.from('clients').select('name').eq('id', profile.client_id).single()
        if (client?.name) setClientName(client.name)
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false })
        setLeads(leadsData || [])
      }
    } catch(e) { console.error(e) }
    finally { setReady(true) }
  }, [])

  useEffect(() => { load() }, [load])

  const advanceStatus = async (id: string) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    const next = STATUS_CONFIG[lead.status].next
    if (!next) return
    const update: any = { status: next }
    if (next === 'contacted' || next === 'attempting_contact') {
      update.last_contacted_at = new Date().toISOString()
      update.contact_attempts = (lead.contact_attempts || 0) + 1
    }
    await supabase.from('leads').update(update).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
  }

  const markLost = async (id: string, reason: string) => {
    const update = { status: 'lost' as const, lost_reason: reason }
    await supabase.from('leads').update(update).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
  }

  const activeLeads = leads.filter(l => !['retained', 'lost'].includes(l.status))
  const retainedLeads = leads.filter(l => l.status === 'retained')
  const lostLeads = leads.filter(l => l.status === 'lost')
  const newLeads = leads.filter(l => l.status === 'new')
  const needsFollowUp = leads.filter(l => l.status === 'new' && (Date.now() - new Date(l.created_at).getTime()) > 3600000)

  const displayLeads = filter === 'active' ? activeLeads
    : filter === 'retained' ? retainedLeads
    : filter === 'lost' ? lostLeads
    : leads

  const sortedLeads = [...displayLeads].sort((a, b) => {
    if (a.status === 'new' && b.status !== 'new') return -1
    if (b.status === 'new' && a.status !== 'new') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const card: React.CSSProperties = { background:'#F8F8F8', borderRadius:14, padding:'16px 16px 14px' }

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#F7F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ fontSize:13, color:'#AAA' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F7F5F0' }}>
      <Sidebar role="client" clientName={clientName} />
      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ padding:'22px 22px 32px', background:'#FFFFFF', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:3 }}>Lead Pipeline</h1>
              <p style={{ fontSize:12, color:'#AEAEB2' }}>Every qualified lead from Sara, tracked from first call to retained client.</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {needsFollowUp.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6, background:'#FFF5F5', color:'#FF453A', fontSize:11, fontWeight:500, padding:'6px 12px', borderRadius:20 }}>
                  <AlertCircle size={11} />
                  {needsFollowUp.length} lead{needsFollowUp.length > 1 ? 's' : ''} need follow-up
                </div>
              )}
              <button onClick={() => setShowAddModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'#1C1C1E', color:'#FFFFFF', fontSize:12, fontWeight:500, padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer' }}>
                <Plus size={13} />
                Add Lead
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
            {[
              { label:'New Leads',       val: newLeads.length,      sub:'need follow-up' },
              { label:'Active Pipeline', val: activeLeads.length,   sub:'in progress' },
              { label:'Retained',        val: retainedLeads.length, sub:'this month' },
              { label:'Lost',            val: lostLeads.length,     sub: leads.length ? Math.round((lostLeads.length/leads.length)*100)+'% loss rate' : '0% loss rate' },
            ].map(({ label, val, sub }) => (
              <div key={label} style={card}>
                <div style={{ fontSize:10, color:'#AEAEB2', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                <div style={{ fontSize:32, fontWeight:300, color:'#1C1C1E', lineHeight:1, letterSpacing:'-0.03em', marginBottom:4 }}>{val}</div>
                <div style={{ fontSize:10, color:'#AEAEB2' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:16 }}>
            {[
              { key:'active',   label:'Active' },
              { key:'retained', label:'Retained' },
              { key:'lost',     label:'Lost' },
              { key:'all',      label:'All' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight: filter===key ? 500 : 400, color: filter===key ? '#1C1C1E' : '#AEAEB2', background: filter===key ? '#F8F8F8' : 'transparent', border: filter===key ? '0.5px solid #E5E5E5' : '0.5px solid transparent', cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background:'#F8F8F8', borderRadius:14, overflow:'visible' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'0.5px solid #EFEFEF' }}>
                  {['Caller','Incident','Quality','Status','Attempts','Received',''].map(h => (
                    <th key={h} style={{ fontSize:10, fontWeight:500, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', textAlign:'left', padding:'10px 14px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedLeads.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 20px', color:'#AEAEB2', fontSize:13 }}>
                    <Phone size={22} style={{ margin:'0 auto 12px', display:'block', color:'#E5E5E5' }} />
                    No leads yet. Sara will populate this automatically as calls come in.
                  </td></tr>
                ) : sortedLeads.map(lead => (
                  <tr key={lead.id}
                    style={{ borderBottom:'0.5px solid #EFEFEF' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = '#FAFAFA'
                      const btn = (e.currentTarget as HTMLElement).querySelector('.lost-btn') as HTMLElement
                      if (btn) btn.style.opacity = '1'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                      const btn = (e.currentTarget as HTMLElement).querySelector('.lost-btn') as HTMLElement
                      if (btn) btn.style.opacity = '0'
                    }}>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ fontSize:12, fontWeight:500, color:'#1C1C1E', fontFamily:'monospace' }}>{lead.caller_name || lead.caller_number}</div>
                      {lead.caller_name && <div style={{ fontSize:10, color:'#AEAEB2', marginTop:2, fontFamily:'monospace' }}>{lead.caller_number}</div>}
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:11, color:'#AEAEB2' }}>{lead.incident_type || '—'}</td>
                    <td style={{ padding:'13px 14px' }}>
                      <span style={{ fontSize:11, fontWeight:500, color: QUALITY_CONFIG[lead.lead_quality]?.color || '#AEAEB2' }}>
                        {QUALITY_CONFIG[lead.lead_quality]?.label || lead.lead_quality}
                      </span>
                    </td>
                    <td style={{ padding:'13px 14px' }}>
                      <StatusCell
                        lead={lead}
                        onAdvance={advanceStatus}
                        isMobile={isMobile}
                      />
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:11, color:'#AEAEB2', fontFamily:'monospace' }}>
                      {lead.contact_attempts > 0 ? `${lead.contact_attempts}x` : '—'}
                    </td>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ fontSize:11, color:'#AEAEB2' }}>{format(new Date(lead.created_at), 'MMM d, hh:mm a')}</div>
                      <div style={{ marginTop:4 }}>
                        <UrgencyTimer
                          createdAt={lead.created_at}
                          status={lead.status}
                          lastContactedAt={lead.last_contacted_at}
                        />
                      </div>
                      {lead.status === 'lost' && lead.lost_reason && (
                        <div style={{ fontSize:10, color:'#AEAEB2', marginTop:4 }}>{lead.lost_reason}</div>
                      )}
                    </td>
                    <td style={{ padding:'13px 14px', textAlign:'right' }}>
                      {!['retained','lost'].includes(lead.status) && (
                        <button
                          className="lost-btn"
                          onClick={e => { e.stopPropagation(); setLostModalLead(lead) }}
                          style={{ opacity: isMobile ? 1 : 0, transition:'opacity 0.15s', display:'inline-flex', alignItems:'center', gap:4, background:'none', border:'0.5px solid #E5E5E5', borderRadius:20, padding:'3px 10px', fontSize:10, color:'#AEAEB2', cursor:'pointer' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#FF453A'; (e.currentTarget as HTMLElement).style.borderColor='#FF453A' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#AEAEB2'; (e.currentTarget as HTMLElement).style.borderColor='#E5E5E5' }}
                        >
                          <X size={9} /> Lost
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {showAddModal && clientId && (
        <AddLeadModal clientId={clientId} onClose={() => setShowAddModal(false)} onAdd={load} />
      )}
      {lostModalLead && (
        <LostModal lead={lostModalLead} onClose={() => setLostModalLead(null)} onConfirm={markLost} />
      )}
    </div>
  )
}
