import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_NOT_CONFIGURED', message: 'Payment processing is not yet configured. Please add your Stripe secret key.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json();
    const { items, customer, shipping_address, origin } = body;

    if (!items?.length || !customer?.email || !shipping_address) {
      return new Response(
        JSON.stringify({ error: 'MISSING_FIELDS', message: 'Missing required checkout fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    );
    const shipping_cost = subtotal >= 99 ? 0 : 9.99;
    const total = subtotal + shipping_cost;

    // Persist order as pending before redirecting to Stripe
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
        email: customer.email,
        phone: customer.phone || null,
        shipping_address,
        items,
        subtotal,
        shipping_cost,
        total,
        status: 'pending',
        notes: customer.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'Failed to create order');
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { text: string; size: string; font: string; backing: string; price: number; quantity: number }) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.text ? `"${item.text}" — Custom Neon Sign` : 'Custom Neon Sign',
            description: [item.size, item.font, item.backing || 'Clear Acrylic'].filter(Boolean).join(' · '),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }),
    );

    if (shipping_cost > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: { name: 'UK Standard Delivery' },
          unit_amount: Math.round(shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = (origin ?? 'http://localhost:5173').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      metadata: {
        order_id: order.id,
        order_number: order.order_number ?? '',
      },
      success_url: `${baseUrl}/?order_success=true&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?order_cancelled=true`,
      billing_address_collection: 'auto',
      custom_text: {
        submit: {
          message: 'Your custom LED neon sign will be handcrafted in London and dispatched within 3–4 days.',
        },
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number ?? '',
        },
      },
    });

    // Store Stripe session ID against the order
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
        order_id: order.id,
        order_number: order.order_number,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error('[create-checkout-session]', message);
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
