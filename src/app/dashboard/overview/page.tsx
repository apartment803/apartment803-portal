import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import OverviewDashboard from '@/components/dashboard/OverviewDashboard'

export default async function OverviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role, client_id, clients(name, minute_limit)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin/overview')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: calls } = await supabase
    .from('call_logs')
    .select('id, duration_seconds, outcome, direction, created_at, transcript')
    .eq('client_id', profile?.client_id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const client = profile?.clients as any
  const minuteLimit = client?.minute_limit || 300
  const minutesUsed = Math.round((calls || []).reduce((s: number, c: any) => s + (c.duration_seconds || 0), 0) / 60)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar role="client" clientName={client?.name} />
      <main style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
        <OverviewDashboard
          calls={calls || []}
          minuteLimit={minuteLimit}
          minutesUsed={minutesUsed}
          clientName={client?.name || 'Your Business'}
        />
      </main>
    </div>
  )
}
