import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', session.id)

        const userId = session.metadata?.supabase_user_id
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        // Get subscription to determine tier
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Map price ID to tier
        let tier = 'free'
        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          tier = 'pro'
        } else if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) {
          tier = 'business'
        }

        console.log(`Upgrading user ${userId} to ${tier}`)

        // Update user's subscription in database
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', userId)

        if (error) {
          console.error('Failed to update profile:', error)
        } else {
          console.log('Profile updated successfully')
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', profile.id)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', subscription.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          // Downgrade to free tier
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'cancelled',
            })
            .eq('id', profile.id)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}