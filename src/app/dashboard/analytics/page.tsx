import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role, client_id, clients(name, minute_limit)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin/overview')

  // Fetch last 30 days of calls
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: calls } = await supabase
    .from('call_logs')
    .select('id, duration_seconds, outcome, direction, created_at')
    .eq('client_id', profile?.client_id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const client = profile?.clients as any
  const minuteLimit = client?.minute_limit || 300
  const minutesUsed = Math.round((calls || []).reduce((s: number, c: any) => s + (c.duration_seconds || 0), 0) / 60)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="client" clientName={client?.name} />
      <main className="flex-1 p-8 overflow-auto">
        <AnalyticsDashboard
          calls={calls || []}
          minuteLimit={minuteLimit}
          minutesUsed={minutesUsed}
          
        />
      </main>
    </div>
  )
}
