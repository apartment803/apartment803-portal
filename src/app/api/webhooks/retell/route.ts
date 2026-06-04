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

    // New post-call extraction fields
    const leadQuality = custom.lead_quality || 'unknown'
    const transferAttempted = custom.transfer_attempted === true
    const transferSuccessful = custom.transfer_successful === true
    const callerEmail = custom.caller_email || null
    const callerPhone = custom.caller_phone || null
    const callerName = custom.caller_name || null
    const incidentType = custom.incident_type || null
    const otherPartyInvolved = custom.other_party_involved === true

    // Determine call outcome
    let outcome = 'completed'
    if (transferSuccessful) outcome = 'transferred'
    else if (transferAttempted && !transferSuccessful) outcome = 'transfer_failed'
    else if (leadQuality === 'strong' || leadQuality === 'moderate') outcome = 'lead_qualified'
    else if (call.voicemail_detected) outcome = 'voicemail'

    // Find client by phone number
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

    // Insert call log
    const { error: callLogError } = await supabase.from('call_logs').insert({
      client_id: clientId,
      retell_call_id: call.call_id,
      direction: call.direction === 'outbound' ? 'outbound' : 'inbound',
      caller_number: call.from_number || 'Unknown',
      duration_seconds: duration,
      outcome,
      transcript: call.transcript || extracted.call_summary || '',
      recording_url: call.recording_url || null,
      agent_name: 'Sara — PI Intake',
      created_at: call.start_timestamp
        ? new Date(call.start_timestamp).toISOString()
        : new Date().toISOString(),
    })

    if (callLogError) {
      console.error('Call log error:', callLogError.message)
      return NextResponse.json({ error: callLogError.message }, { status: 500 })
    }

    // Auto-create lead for strong, moderate, or transferred calls
    if (
      leadQuality === 'strong' ||
      leadQuality === 'moderate' ||
      transferAttempted
    ) {
      // If transfer was successful, lead enters as 'contacted' — attorney already spoke to them
      // If transfer failed or not attempted, lead enters as 'new' — needs follow-up
      const leadStatus = transferSuccessful ? 'contacted' : 'new'

      const { error: leadError } = await supabase.from('leads').insert({
        client_id: clientId,
        caller_number: call.from_number || 'Unknown',
        caller_name: callerName,
        caller_email: callerEmail,
        incident_type: incidentType,
        lead_quality: leadQuality === 'unknown' ? 'moderate' : leadQuality,
        status: leadStatus,
        contact_attempts: transferSuccessful ? 1 : 0,
        last_contacted_at: transferSuccessful ? new Date().toISOString() : null,
        notes: transferSuccessful
          ? 'Lead transferred successfully to attorney during call.'
          : transferAttempted
          ? 'Transfer attempted but failed — attorney not available. Follow up required.'
          : null,
        created_at: call.start_timestamp
          ? new Date(call.start_timestamp).toISOString()
          : new Date().toISOString(),
      })

      if (leadError) {
        console.error('Lead creation error:', leadError.message)
        // Don't fail the webhook — call log already saved
      } else {
        console.log('Lead created:', call.from_number, 'status:', leadStatus, 'quality:', leadQuality)
      }
    }

    console.log('Call logged:', call.call_id, 'outcome:', outcome)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
