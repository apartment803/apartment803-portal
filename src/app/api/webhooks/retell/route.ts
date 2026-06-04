import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Webhook received:', body.event)

    if (body.event !== 'call_ended') {
      return NextResponse.json({ received: true })
    }

    const call = body.call
    if (!call) return NextResponse.json({ error: 'No call data' }, { status: 400 })

    const extracted = call.call_analysis || {}
    const custom = extracted.custom_analysis_data || {}

    const leadQuality = custom.lead_quality || 'unknown'
    const consultationBooked = custom.consultation_booked === 'yes'

    let outcome = 'completed'
    if (consultationBooked) outcome = 'appointment_booked'
    else if (leadQuality === 'strong' || leadQuality === 'moderate') outcome = 'lead_qualified'
    else if (call.voicemail_detected) outcome = 'voicemail'

    const toNumber = call.to_number || ''
    const { data: phoneRecord } = await supabase
      .from('client_phone_numbers')
      .select('client_id')
      .eq('phone_number', toNumber)
      .single()

    let clientId = phoneRecord?.client_id
    if (!clientId) {
      const { data: firstClient } = await supabase
        .from('clients').select('id').eq('status', 'active').limit(1).single()
      clientId = firstClient?.id
    }

    if (!clientId) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 })
    }

    const duration = call.end_timestamp && call.start_timestamp
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : 0

    const { error } = await supabase.from('call_logs').insert({
      client_id: clientId,
      retell_call_id: call.call_id,
      direction: call.direction === 'outbound' ? 'outbound' : 'inbound',
      caller_number: call.from_number || 'Unknown',
      duration_seconds: duration,
      outcome,
      transcript: call.transcript || extracted.call_summary || '',
recording_url: call.recording_url || null,
      agent_name: 'Sarah — PI Intake',
      created_at: call.start_timestamp
        ? new Date(call.start_timestamp).toISOString()
        : new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Call logged:', call.call_id, 'outcome:', outcome)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
