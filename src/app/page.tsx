'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      window.location.href = profile?.role === 'admin' ? '/admin/clients' : '/dashboard/calls'
    } catch { setError('Login failed.'); setLoading(false) }
  }

  const inp = { width:'100%', background:'#F8F8F8', border:'0.5px solid #F0F0F0', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#1C1C1E', outline:'none', fontFamily:'Inter, system-ui, sans-serif', display:'block', marginBottom:14 }

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ width:220, flexShrink:0, background:'#F8F8F8', borderRight:'0.5px solid #F0F0F0', display:'flex', flexDirection:'column', padding:'28px 26px', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em' }}>Apartment 803</div>
          <div style={{ fontSize:10, color:'#AEAEB2', marginTop:2 }}>AI Voice Portal</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {[['24/7','Coverage'],['4','AI agents'],['14','Days to launch']].map(([n,l],i,arr) => (
            <div key={l} style={{ display:'flex', alignItems:'baseline', gap:10, padding:'13px 0', borderBottom:i<arr.length-1?'0.5px solid #EFEFEF':'none' }}>
              <div style={{ fontSize:22, fontWeight:300, color:'#1C1C1E', lineHeight:1, letterSpacing:'-0.02em', minWidth:42 }}>{n}</div>
              <div style={{ fontSize:11, color:'#AEAEB2', lineHeight:1.3 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:10, color:'#C7C7CC' }}>© 2026 Apartment 803</div>
      </div>
      <div style={{ flex:1, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:280 }}>
          <h1 style={{ fontSize:20, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em', marginBottom:4 }}>Welcome back</h1>
          <p style={{ fontSize:12, color:'#AEAEB2', marginBottom:28 }}>Sign in to your portal</p>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column' }}>
            <label style={{ fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Email</label>
            <input type="email" style={inp} placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            <label style={{ fontSize:10, color:'#AEAEB2', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Password</label>
            <input type="password" style={inp} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <div style={{ fontSize:12, color:'#FF453A', background:'#FFF5F5', borderRadius:8, padding:'10px 14px', marginBottom:14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ background:'#1C1C1E', color:'#FFFFFF', border:'none', borderRadius:10, padding:12, fontSize:13, fontWeight:500, cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, marginTop:4, fontFamily:'Inter, system-ui, sans-serif' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center', marginTop:20 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#30D158', display:'inline-block' }} />
            <span style={{ fontSize:10, color:'#C7C7CC' }}>Secure portal · Apartment 803</span>
          </div>
        </div>
      </div>
    </div>
  )
}