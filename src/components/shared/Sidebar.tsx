'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, Phone, Bot, CreditCard, Settings, Users, LogOut } from 'lucide-react'

interface SidebarProps { role: 'admin' | 'client'; clientName?: string }

const adminLinks = [
  { href:'/admin/overview',  icon:LayoutDashboard, label:'Overview' },
  { href:'/admin/clients',   icon:Users,           label:'Clients' },
  { href:'/admin/settings',  icon:Settings,        label:'Settings' },
]
const clientLinks = [
  { href:'/dashboard/overview', icon:LayoutDashboard, label:'Overview' },
  { href:'/dashboard/analytics',icon:BarChart2,       label:'Analytics' },
  { href:'/dashboard/calls',    icon:Phone,           label:'Call Logs' },
  { href:'/dashboard/agents',   icon:Bot,             label:'AI Agents' },
  { href:'/dashboard/billing',  icon:CreditCard,      label:'Package & Billing' },
]

export default function Sidebar({ role, clientName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const links = role === 'admin' ? adminLinks : clientLinks

  return (
    <aside style={{ width:186, background:'#FFFFFF', borderRight:'0.5px solid #F0F0F0', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, flexShrink:0, fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ padding:'22px 18px 18px' }}>
        <div style={{ fontSize:14, fontWeight:500, color:'#1C1C1E', letterSpacing:'-0.01em' }}>Apartment 803</div>
        <div style={{ fontSize:10, color:'#AEAEB2', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {clientName || 'AI Voice Portal'}
        </div>
      </div>
      <div style={{ height:'0.5px', background:'#F0F0F0' }} />
      <nav style={{ flex:1, padding:'8px 8px', display:'flex', flexDirection:'column', gap:1 }}>
        {links.map(({ href, icon:Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href+'/')
          return (
            <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, fontSize:12.5, color:active?'#1C1C1E':'#AEAEB2', fontWeight:active?500:400, background:active?'#F8F8F8':'transparent', textDecoration:'none' }}>
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding:'10px 8px 14px', borderTop:'0.5px solid #F0F0F0' }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, fontSize:12.5, color:'#AEAEB2', background:'transparent', border:'none', cursor:'pointer', width:'100%' }}>
          <LogOut size={14} strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </aside>
  )
}
