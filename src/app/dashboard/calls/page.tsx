'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/shared/Sidebar'
import CallLogsTable from '@/components/dashboard/CallLogsTable'

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [clientName, setClientName] = useState('Your Business')
  const [ready, setReady] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/'; return }

        const { data: profile } = await supabase
          .from('users')
          .select('role, client_id')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          window.location.href = '/admin/clients'
          return
        }

        if (profile?.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('name')
            .eq('id', profile.client_id)
            .single()
          if (client?.name) setClientName(client.name)

          const { data: callData } = await supabase
            .from('call_logs')
            .select('*')
            .eq('client_id', profile.client_id)
            .order('created_at', { ascending: false })
            .limit(100)
          setCalls(callData || [])
        }
      } catch(e) {
        console.error(e)
      } finally {
        setReady(true)
      }
    }
    load()
    // Force render after 3 seconds no matter what
    const timer = setTimeout(() => setReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#F7F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ fontSize:'13px', color:'#AAA' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F7F5F0' }}>
      <Sidebar role="client" clientName={clientName} />
      <main style={{ flex:1, overflow:'auto' }}>
        <CallLogsTable calls={calls} clientName={clientName} />
      </main>
    </div>
  )
}
