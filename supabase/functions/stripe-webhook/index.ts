import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

function getSupabase() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SERVICE_ROLE_KEY')!)
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  const supabase = getSupabase()

  // Abonnement créé ou renouvelé → activer l'accès
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const active = sub.status === 'active' || sub.status === 'trialing'
    const customerId = sub.customer as string
    const type = sub.metadata?.type

    if (type === 'judoka') {
      const userId = sub.metadata?.user_id
      if (userId) {
        await supabase.from('judokas').update({
          cotisation_paid: active,
          cotisation_paid_at: active ? new Date().toISOString() : null,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
        }).eq('user_id', userId)
      }
    }

    if (type === 'club') {
      const clubId = sub.metadata?.club_id
      if (clubId) {
        await supabase.from('clubs').update({
          plan: active ? 'pro' : 'basic',
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
        }).eq('id', clubId)
      }
    }
  }

  // Abonnement annulé ou impayé → couper l'accès
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const type = sub.metadata?.type

    if (type === 'judoka') {
      const userId = sub.metadata?.user_id
      if (userId) await supabase.from('judokas').update({ cotisation_paid: false }).eq('user_id', userId)
    }

    if (type === 'club') {
      const clubId = sub.metadata?.club_id
      if (clubId) await supabase.from('clubs').update({ plan: 'basic' }).eq('id', clubId)
    }
  }

  // Paiement échoué → notifier (on coupe à subscription.deleted)
  if (event.type === 'invoice.payment_failed') {
    console.log('Paiement échoué pour customer:', (event.data.object as Stripe.Invoice).customer)
  }

  return new Response('ok')
})
