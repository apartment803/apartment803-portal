import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import BillingPage from '@/components/dashboard/BillingPage'

export default async function Billing() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('users').select('role, client_id, clients(name, minute_limit, minutes_used)').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin/clients')
  const client = profile?.clients as any
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <Sidebar role="client" clientName={client?.name} />
      <main style={{ flex:1, overflow:'auto' }}>
        <BillingPage clientName={client?.name || 'Your Business'} minuteLimit={client?.minute_limit || 300} minutesUsed={client?.minutes_used || 0} />
      </main>
    </div>
  )
}