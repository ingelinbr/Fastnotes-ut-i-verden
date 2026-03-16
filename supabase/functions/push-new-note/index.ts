/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import { createClient } from 'npm:@supabase/supabase-js@2'

type NoteRecord = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  user_id: string
  user_email: string | null
  created_at: string
  updated_at: string
}

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: 'public'
  record: NoteRecord
  old_record: NoteRecord | null
}

type PushTokenRow = {
  user_id: string
  expo_push_token: string
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const incomingSecret = req.headers.get('x-webhook-secret')

    if (!WEBHOOK_SECRET || incomingSecret !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const payload: WebhookPayload = await req.json()

    if (payload.type !== 'INSERT' || payload.table !== 'notes') {
      return Response.json({ ok: true, skipped: true })
    }

    const authorId = payload.record.user_id
    const noteTitle = payload.record.title

    const { data, error } = await supabase
      .from('user_push_tokens')
      .select('user_id, expo_push_token')
      .neq('user_id', authorId)

    if (error) {
      console.error('Failed to fetch recipients:', error)
      return new Response(error.message, { status: 500 })
    }

    const recipients: PushTokenRow[] =
      (data as PushTokenRow[] | null)?.filter(
        (row: PushTokenRow) => row.expo_push_token?.startsWith('ExponentPushToken[')
      ) ?? []

    if (recipients.length === 0) {
      return Response.json({ ok: true, sent: 0 })
    }

    const messages = recipients.map((row: PushTokenRow) => ({
      to: row.expo_push_token,
      title: 'Nytt notat',
      body: `Nytt notat: ${noteTitle}`,
      sound: 'default',
      data: {
        noteId: payload.record.id,
        title: noteTitle,
      },
    }))

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const expoJson = await expoResponse.json()

    return Response.json({
      ok: true,
      sent: messages.length,
      expo: expoJson,
    })
  } catch (error) {
    console.error('push-new-note error:', error)
    return new Response(String(error), { status: 500 })
  }
})