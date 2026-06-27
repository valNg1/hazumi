import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401, headers: corsHeaders })

    const { priceId, type } = await req.json()
    // type = 'judoka' | 'club'

    const origin = req.headers.get('origin') ?? 'https://hazumi.app'

    let customerEmail = user.email
    let metadata: Record<string, string> = { user_id: user.id, type }

    if (type === 'judoka') {
      const { data: judoka } = await supabase.from('judokas').select('id, stripe_customer_id').eq('user_id', user.id).single()
      if (!judoka) return new Response(JSON.stringify({ error: 'Judoka introuvable' }), { status: 400, headers: corsHeaders })
      metadata.judoka_id = judoka.id

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        metadata,
        success_url: `${origin}/eleve/accueil?payment=success`,
        cancel_url: `${origin}/eleve/accueil?payment=cancelled`,
      }
      if (judoka.stripe_customer_id) {
        sessionParams.customer = judoka.stripe_customer_id
      } else {
        sessionParams.customer_email = user.email ?? customerEmail
      }
      const session = await stripe.checkout.sessions.create(sessionParams)
      return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'type invalide' }), { status: 400, headers: corsHeaders })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})
