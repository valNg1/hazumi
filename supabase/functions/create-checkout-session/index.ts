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

    const { data: judoka } = await supabase.from('judokas').select('id, full_name, email, cotisation_paid').eq('user_id', user.id).single()

    if (judoka?.cotisation_paid) {
      return new Response(JSON.stringify({ error: 'Cotisation déjà réglée' }), { status: 400, headers: corsHeaders })
    }

    const { amount } = await req.json()
    const unitAmount = amount ?? 12000 // 120€ par défaut

    const origin = req.headers.get('origin') ?? 'https://hazumi.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: {
            name: 'Cotisation Hazumi',
            description: `Cotisation annuelle — ${judoka?.full_name ?? user.email}`,
          },
        },
      }],
      customer_email: judoka?.email || user.email,
      metadata: { judoka_id: judoka?.id, user_id: user.id },
      success_url: `${origin}/eleve/profil?paid=1`,
      cancel_url: `${origin}/eleve/profil?cancelled=1`,
    })

    // Stocker l'ID de session pour rapprochement webhook
    await supabase.from('judokas').update({ cotisation_session_id: session.id }).eq('user_id', user.id)

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})
