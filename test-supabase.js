import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'loaded' : 'missing')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function run() {
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test@sentinel.dev',
    password: 'test1234'
  })

  if (loginError) {
    console.error('Login failed:', loginError)
    return
  }

  const { error } = await supabase.from('fraud_events').insert({
    user_id: '17979d3c-5c88-438e-886f-256fd1d9b368',
    event_type: 'client-test',
    risk_score: 40
  })

  console.log('Insert error:', error)
}

run()
