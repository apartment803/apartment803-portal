import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import AdminClientsTable from '@/components/admin/AdminClientsTable'

export default async function AdminClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard/calls')

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id, name, email, status, minute_limit, created_at,
      users (count),
      call_logs (count)
    `)
    .order('created_at', { ascending: false })

  // Get agent counts from Retell for each client
  const clientsWithStats = clients?.map(c => ({
    ...c,
    userCount: c.users?.[0]?.count || 0,
    callCount: c.call_logs?.[0]?.count || 0,
  })) || []

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-auto">
        <AdminClientsTable clients={clientsWithStats} />
      </main>
    </div>
  )
}
