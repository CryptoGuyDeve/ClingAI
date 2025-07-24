import Stripe from 'stripe';
import { supabase } from '@/services/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

async function buffer(req) {
  const chunks = [];
  for await (const chunk of req.body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req) {
  const buf = await buffer(req);
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;
    if (email) {
      // Only update credits in Supabase
      await supabase.from('Users').update({ credits: 200 }).eq('email', email);
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    // Optionally handle subscription cancellation
    const subscription = event.data.object;
    const customerId = subscription.customer;
    // Find user by stripe_customer_id and set is_subscribed to false
    const { data: users } = await supabase.from('Users').select('*').eq('stripe_customer_id', customerId);
    if (users && users.length > 0) {
      await supabase.from('Users').update({ is_subscribed: false }).eq('stripe_customer_id', customerId);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
} 