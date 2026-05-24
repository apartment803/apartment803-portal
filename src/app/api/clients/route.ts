import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Verify admin
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, minute_limit } = await request.json()

  // 1. Create client record
  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .insert({ name, email, minute_limit, status: 'active' })
    .select()
    .single()

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })

  // 2. Create auth user for the client
  const tempPassword = crypto.randomBytes(12).toString('base64')
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // 3. Create user profile with client role
  await adminSupabase.from('users').insert({
    id: authUser.user.id,
    email,
    role: 'client',
    client_id: client.id,
  })

  // 4. Send password reset email so client can set their own password
  await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  return NextResponse.json({ ...client, tempPassword })
}

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data)
}
