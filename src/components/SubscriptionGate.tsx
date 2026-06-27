import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface SubscriptionGateProps {
  children: React.ReactNode
  featureName?: string
}

export default function SubscriptionGate({ children, featureName = 'cette fonctionnalité' }: SubscriptionGateProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsSubscribed(false)
        return
      }

      const { data: judoka } = await supabase.from('judokas')
        .select('subscription_active')
        .eq('user_id', user.id)
        .single()

      setIsSubscribed(judoka?.subscription_active ?? false)
    }

    checkSubscription()
  }, [])

  async function handlePayment() {
    setPaymentLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_JUDOKA,
          type: 'judoka',
        }),
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } finally {
      setPaymentLoading(false)
    }
  }

  if (isSubscribed === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-[#C41230] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Abonnement requis</h1>
          <p className="text-[#999999] mb-6">
            {featureName} est réservée aux membres actifs. Rejoignez Hazumi pour 1€/mois.
          </p>
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {paymentLoading ? '…' : 'S\'abonner maintenant'}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
