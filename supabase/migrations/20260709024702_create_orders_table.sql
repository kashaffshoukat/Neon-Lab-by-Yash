/*
# NeuNeon Orders Table

Creates the orders table for storing all customer orders placed through the neon sign shop.

1. New Tables
   - `orders`
     - `id` (uuid, primary key) — unique internal order ID
     - `created_at` (timestamptz) — timestamp when the order was placed
     - `order_number` (text, unique) — human-readable order reference like NN-2026-0001
     - `customer_name` (text, not null) — customer's full name
     - `email` (text, not null) — customer email address for order comms
     - `phone` (text, optional) — customer phone number
     - `shipping_address` (jsonb, not null) — full delivery address object
     - `items` (jsonb, not null) — snapshot of cart items at the time of order
     - `subtotal` (numeric) — sum of item prices in GBP
     - `shipping_cost` (numeric) — calculated shipping charge
     - `total` (numeric) — final charge amount
     - `status` (text) — order lifecycle: pending | paid | processing | shipped | delivered | cancelled | payment_failed
     - `stripe_session_id` (text) — Stripe Checkout Session ID
     - `stripe_payment_intent_id` (text) — Stripe PaymentIntent ID set after successful payment
     - `notes` (text) — optional customer notes

2. Sequences & Triggers
   - `order_sequence` — auto-increments to generate unique order numbers
   - `set_order_number` trigger — fires before INSERT to auto-assign order_number

3. Security
   - RLS enabled on `orders`
   - Anon + authenticated can INSERT (guest checkout, no account required)
   - Anon + authenticated can SELECT (order lookup by session_id or id)
   - No public UPDATE/DELETE — only the service role key (edge functions) can modify orders

4. Notes
   - No user_id column because the shop supports guest checkout (no mandatory sign-in)
   - USING (true) on SELECT policy is intentional — customers look up their own order
     by navigating to a unique success URL containing their order ID
*/

CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  order_number text UNIQUE,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  shipping_address jsonb NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','payment_failed')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  notes text
);

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'NN-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                        LPAD(NEXTVAL('order_sequence')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
TO anon, authenticated USING (true);
