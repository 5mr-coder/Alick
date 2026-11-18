-- ============================================================================
-- Alick System Services - 0002_rls_grants_rpc_storage
-- Stage 2 of 3: default-privilege revocations, admin helper, RLS policies,
-- SECURITY DEFINER RPCs, and storage buckets/objects policies.
--
-- Threat model
--   * anon      : storefront reads only (active/published/approved rows), plus
--                 column-limited inserts for reviews and contact messages.
--   * authenticated: the same public surface as anon. Admin capabilities are
--                 gated behind private.is_admin() AND aal2, never behind the
--                 mere presence of a session.
--   * service_role : the only caller of the four RPCs (server-side only).
--   * Everything not granted below is denied: RLS is already enabled on all
--     12 public tables by 0001_initial_schema.sql.
-- ============================================================================

-- ============================================================================
-- 1. Zero-default privileges
--    Supabase grants anon/authenticated broad access by default; strip it all
--    so every capability below is explicit.
-- ============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM public, anon, authenticated;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- The three trigger functions are SECURITY INVOKER but need no EXECUTE grant:
-- Postgres checks EXECUTE only when a trigger is created, not when it fires.
-- They return trigger and cannot be called directly.

-- ============================================================================
-- 2. private.is_admin()
--    SECURITY DEFINER so policies can read public.user_roles (which has no
--    grants at all) without exposing it. Lives outside the exposed schema and
--    is executable by authenticated only.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM public, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
     AND (SELECT auth.jwt() ->> 'aal') = 'aal2'
     AND EXISTS (
       SELECT 1
       FROM public.user_roles AS ur
       WHERE ur.user_id = (SELECT auth.uid())
         AND ur.role = 'admin'
     );
$$;

REVOKE EXECUTE ON FUNCTION private.is_admin() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- ============================================================================
-- 3. Table grants and RLS policies
--    Every admin policy is TO authenticated and wraps the helper in a scalar
--    subquery, so anon never evaluates private.is_admin() and the check runs
--    once per statement instead of once per row.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3a. Public catalog reads
-- ----------------------------------------------------------------------------

GRANT SELECT ON public.products, public.flash_sales, public.site_banners,
                public.services, public.blog_posts, public.reviews
  TO anon, authenticated;

CREATE POLICY products_public_read ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY products_admin_all ON public.products
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY flash_sales_public_read ON public.flash_sales
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND starts_at <= now() AND ends_at > now());

CREATE POLICY flash_sales_admin_all ON public.flash_sales
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY site_banners_public_read ON public.site_banners
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY site_banners_admin_all ON public.site_banners
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY services_public_read ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY services_admin_all ON public.services
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY blog_posts_public_read ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (published = true AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY blog_posts_admin_all ON public.blog_posts
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- ----------------------------------------------------------------------------
-- 3b. Reviews: approved rows are public, submissions are unapproved only.
--     image_url is deliberately not grantable to anon.
-- ----------------------------------------------------------------------------

CREATE POLICY reviews_public_read ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (is_approved = true);

GRANT INSERT (product_id, author_name, rating, comment) ON public.reviews
  TO anon, authenticated;

CREATE POLICY reviews_public_insert ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    is_approved = false
    AND (
      product_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.products AS p
        WHERE p.id = product_id AND p.is_active = true
      )
    )
  );

CREATE POLICY reviews_admin_all ON public.reviews
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- ----------------------------------------------------------------------------
-- 3c. Contact messages: write-only for the public; readable by admins only.
-- ----------------------------------------------------------------------------

GRANT INSERT (name, email, phone, subject, message, service_slug)
  ON public.contact_messages TO anon, authenticated;

CREATE POLICY contact_messages_public_insert ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_resolved = false);

CREATE POLICY contact_messages_admin_all ON public.contact_messages
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- ----------------------------------------------------------------------------
-- 3d. Site settings: single public row, but high_value_threshold is withheld
--     from anon through column-level SELECT. Admins get the whole table.
--     The public-read policy is anon-only: authenticated holds table-level
--     SELECT (for admins), so a policy for authenticated would expose
--     high_value_threshold to any logged-in non-admin. Storefront settings
--     reads must therefore use the anon client or the server service role.
-- ----------------------------------------------------------------------------

GRANT SELECT (id, site_name, tagline, phone, email, address, whatsapp_number,
              social_links, shipping_rates, updated_at)
  ON public.site_settings TO anon;

CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT TO anon
  USING (id = true);

GRANT SELECT, UPDATE ON public.site_settings TO authenticated;

CREATE POLICY site_settings_admin_all ON public.site_settings
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- ----------------------------------------------------------------------------
-- 3e. Orders: no customer-facing table access at all. Guests read their own
--     order through public.get_guest_order(); checkout goes through the RPC.
--     Admins may list and update orders (fulfilment, tracking, status).
-- ----------------------------------------------------------------------------

-- Admins may resolve payment state and manage fulfilment, but money fields,
-- payment_reference and order_items stay immutable (read-only).
GRANT SELECT ON public.orders, public.order_items TO authenticated;
GRANT UPDATE (payment_status, fulfillment_status, tracking_code, requires_review)
  ON public.orders TO authenticated;

CREATE POLICY orders_admin_all ON public.orders
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY order_items_admin_all ON public.order_items
  FOR ALL TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- ----------------------------------------------------------------------------
-- 3f. Admin write access to the remaining catalog tables.
--     public.user_roles and public.rate_limits intentionally receive no grant
--     and no policy: RLS with zero policies denies everyone except the
--     SECURITY DEFINER code paths that own them.
-- ----------------------------------------------------------------------------

-- reviews / contact_messages deliberately get NO table-level INSERT for
-- authenticated: that would override the column-limited INSERT grants above
-- (letting a logged-in user set id, created_at, image_url). Admin-authored
-- reviews with image_url go through the service role.
GRANT INSERT, UPDATE, DELETE ON public.products, public.flash_sales,
                                public.site_banners, public.services,
                                public.blog_posts
  TO authenticated;
GRANT UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- ============================================================================
-- 4. SECURITY DEFINER RPCs
--    Each is server-only: EXECUTE is revoked from PUBLIC, anon and
--    authenticated, then granted to service_role. search_path is empty, so
--    every object reference is schema-qualified.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4a. public.create_checkout_order()
--     Prices and stock are read inside the transaction under row locks, so the
--     client can never dictate either. Prices are minor-unit kobo bigints.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_items jsonb,
  p_sales_mode text,
  p_shipping_zone text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_notes text,
  p_payment_reference text DEFAULT NULL
)
RETURNS TABLE (order_id uuid, order_number text, total_amount bigint, currency text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_mode text := lower(btrim(coalesce(p_sales_mode, '')));
  v_zone text := btrim(coalesce(p_shipping_zone, ''));
  v_agg jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_item record;
  v_name text;
  v_price bigint;
  v_retail_price bigint;
  v_sale_price bigint;
  v_unit_price bigint;
  v_stock int;
  v_active boolean;
  v_count int;
  v_rates jsonb;
  v_threshold bigint;
  v_shipping_fee bigint;
  v_subtotal bigint := 0;
  v_total bigint;
  v_order_id uuid;
  v_order_number text;
  v_currency text;
  v_cust_name text := btrim(coalesce(p_customer_name, ''));
  v_cust_email text := lower(btrim(coalesce(p_customer_email, '')));
  v_cust_phone text := btrim(coalesce(p_customer_phone, ''));
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_ref text := nullif(btrim(coalesce(p_payment_reference, '')), '');
BEGIN
  IF v_mode NOT IN ('consumer', 'retail') THEN
    RAISE EXCEPTION 'sales mode must be consumer or retail';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'items must be a JSON array of 1-100 lines';
  END IF;

  IF p_shipping_address IS NOT NULL
     AND (jsonb_typeof(p_shipping_address) <> 'object'
          OR pg_column_size(p_shipping_address) > 4096) THEN
    RAISE EXCEPTION 'shipping address must be a small JSON object';
  END IF;

  -- Customer fields: validated against the table CHECK bounds up front so the
  -- caller gets a clean message instead of a constraint-violation error, and
  -- control characters (tabs, newlines, NULs, ESC...) never reach the table.
  IF char_length(v_cust_name) NOT BETWEEN 2 AND 120
     OR char_length(v_cust_email) NOT BETWEEN 5 AND 150
     OR char_length(v_cust_phone) NOT BETWEEN 7 AND 30 THEN
    RAISE EXCEPTION 'customer name (2-120), email (5-150) and phone (7-30) are required';
  END IF;

  IF concat_ws('', v_cust_name, v_cust_email, v_cust_phone, v_notes, v_zone, v_ref)
       ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'control characters are not allowed in checkout fields';
  END IF;

  IF v_cust_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'customer email is not valid';
  END IF;

  IF v_cust_phone !~ '^[0-9+() -]{7,30}$' THEN
    RAISE EXCEPTION 'customer phone is not valid';
  END IF;

  IF v_notes IS NOT NULL AND char_length(v_notes) > 500 THEN
    RAISE EXCEPTION 'notes must be at most 500 characters';
  END IF;

  -- An empty reference means "none yet"; a supplied one must be well formed
  -- and unused (it is UNIQUE and later bound to this order by fulfilment).
  IF v_ref IS NOT NULL THEN
    IF v_ref !~ '^[A-Za-z0-9._=-]{1,100}$' THEN
      RAISE EXCEPTION 'payment reference is malformed';
    END IF;
    IF EXISTS (SELECT 1 FROM public.orders AS o WHERE o.payment_reference = v_ref) THEN
      RAISE EXCEPTION 'payment reference is already in use';
    END IF;
  END IF;

  -- Every line must be an object with a well-formed UUID and a 1-9999 whole
  -- quantity. Only regex tests run here (no casts), so malformed input fails
  -- with this clean message instead of a raw cast error, and the aggregated
  -- quantity below can never overflow int.
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_items) AS it
    WHERE jsonb_typeof(it) <> 'object'
       OR coalesce(it ->> 'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       OR coalesce(it ->> 'quantity', '') !~ '^[1-9][0-9]{0,3}$'
  ) THEN
    RAISE EXCEPTION 'each item needs a valid product_id and a positive integer quantity';
  END IF;

  -- Collapse duplicate product_id lines so a split cart cannot bypass the
  -- per-SKU quantity bounds below.
  SELECT jsonb_agg(
           jsonb_build_object('product_id', a.product_id, 'qty', a.qty)
           ORDER BY a.product_id
         )
    INTO v_agg
  FROM (
    SELECT (it ->> 'product_id')::uuid AS product_id,
           sum((it ->> 'quantity')::int) AS qty
    FROM jsonb_array_elements(p_items) AS it
    GROUP BY 1
  ) AS a;

  SELECT jsonb_array_length(v_agg) INTO v_count;

  IF v_count < 1 OR v_count > 25 THEN
    RAISE EXCEPTION 'an order must contain between 1 and 25 distinct products';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_agg) AS it
    WHERE (it ->> 'qty')::int < CASE WHEN v_mode = 'consumer' THEN 1 ELSE 10 END
       OR (it ->> 'qty')::int > CASE WHEN v_mode = 'consumer' THEN 9 ELSE 100 END
  ) THEN
    RAISE EXCEPTION 'quantity is outside the % bounds for % orders',
      CASE WHEN v_mode = 'consumer' THEN '1-9' ELSE '10-100' END, v_mode;
  END IF;

  -- Lock every product in a deterministic order (deadlock avoidance) before
  -- reading price or stock.
  PERFORM 1
  FROM public.products AS p
  WHERE p.id IN (
    SELECT (it ->> 'product_id')::uuid FROM jsonb_array_elements(v_agg) AS it
  )
  ORDER BY p.id
  FOR UPDATE;

  FOR v_item IN
    SELECT (it ->> 'product_id')::uuid AS product_id, (it ->> 'qty')::int AS qty
    FROM jsonb_array_elements(v_agg) AS it
    ORDER BY 1
  LOOP
    SELECT p.name, p.price, p.retail_price, p.stock_quantity, p.is_active
      INTO v_name, v_price, v_retail_price, v_stock, v_active
    FROM public.products AS p
    WHERE p.id = v_item.product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product % does not exist', v_item.product_id;
    END IF;

    IF NOT v_active THEN
      RAISE EXCEPTION 'product % is not available', v_name;
    END IF;

    IF v_stock < v_item.qty THEN
      RAISE EXCEPTION 'insufficient stock for %', v_name;
    END IF;

    -- A running flash sale wins over both list prices.
    SELECT fs.sale_price
      INTO v_sale_price
    FROM public.flash_sales AS fs
    WHERE fs.product_id = v_item.product_id
      AND fs.is_active = true
      AND fs.starts_at <= now()
      AND fs.ends_at > now()
    ORDER BY fs.sale_price
    LIMIT 1;

    -- A running flash sale wins over list pricing, but in retail mode a buyer
    -- never pays more than the retail price (least of sale and retail).
    IF v_mode = 'retail' THEN
      v_unit_price := coalesce(v_retail_price, v_price);
      IF v_sale_price IS NOT NULL THEN
        v_unit_price := least(v_sale_price, v_unit_price);
      END IF;
    ELSIF v_sale_price IS NOT NULL THEN
      v_unit_price := v_sale_price;
    ELSE
      v_unit_price := v_price;
    END IF;

    v_subtotal := v_subtotal + (v_unit_price * v_item.qty);

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_item.product_id,
      'product_name', v_name,
      'unit_price', v_unit_price,
      'qty', v_item.qty
    );
  END LOOP;

  SELECT s.shipping_rates, s.high_value_threshold
    INTO v_rates, v_threshold
  FROM public.site_settings AS s
  WHERE s.id = true;

  IF v_rates IS NULL THEN
    RAISE EXCEPTION 'site settings are not configured';
  END IF;

  IF v_zone = '' OR NOT (v_rates ? v_zone) THEN
    RAISE EXCEPTION 'unknown shipping zone: %', left(v_zone, 50);
  END IF;

  -- Rates are stored as non-negative integer kobo, never as floats.
  IF (v_rates ->> v_zone) !~ '^[0-9]{1,12}$' THEN
    RAISE EXCEPTION 'shipping zone % has an invalid rate', left(v_zone, 50);
  END IF;

  v_shipping_fee := (v_rates ->> v_zone)::bigint;
  v_total := v_subtotal + v_shipping_fee;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'order total must be positive';
  END IF;

  INSERT INTO public.orders (
    customer_name,
    customer_email,
    customer_phone,
    shipping_zone,
    shipping_address,
    sales_mode,
    notes,
    subtotal,
    shipping_fee,
    total_amount,
    requires_review,
    payment_reference
  )
  VALUES (
    v_cust_name,
    v_cust_email,
    v_cust_phone,
    v_zone,
    coalesce(p_shipping_address, '{}'::jsonb),
    v_mode,
    v_notes,
    v_subtotal,
    v_shipping_fee,
    v_total,
    (v_total >= v_threshold),
    v_ref
  )
  RETURNING orders.id, orders.order_number, orders.total_amount, orders.currency
  INTO v_order_id, v_order_number, v_total, v_currency;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    sales_mode,
    unit_price,
    quantity
  )
  SELECT v_order_id,
         (l ->> 'product_id')::uuid,
         l ->> 'product_name',
         v_mode,
         (l ->> 'unit_price')::bigint,
         (l ->> 'qty')::int
  FROM jsonb_array_elements(v_lines) AS l;

  RETURN QUERY SELECT v_order_id, v_order_number, v_total, v_currency;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_checkout_order(jsonb, text, text, text, text, text, jsonb, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(jsonb, text, text, text, text, text, jsonb, text, text)
  TO service_role;

-- ----------------------------------------------------------------------------
-- 4b. public.fulfill_paid_order()
--     Never raises on payment mismatch: the order is parked in
--     paid_needs_review and the caller decodes the text result.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fulfill_paid_order(
  p_order_id uuid,
  p_payment_reference text,
  p_paid_amount bigint,
  p_currency text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reference text := btrim(coalesce(p_payment_reference, ''));
  v_order_id uuid;
  v_total_amount bigint;
  v_currency text;
  v_payment_status text;
  v_fulfillment_status text;
  v_expires_at timestamptz;
  v_missing_stock boolean;
  v_existing_ref text;
BEGIN
  IF v_reference = '' THEN
    RAISE EXCEPTION 'payment reference is required';
  END IF;

  -- Serialise concurrent callers using the same reference so the duplicate
  -- check below is race-free (otherwise the UNIQUE constraint would throw).
  PERFORM pg_advisory_xact_lock(hashtextextended(v_reference, 0));

  -- A reference is single-use across the whole order book.
  IF EXISTS (
    SELECT 1
    FROM public.orders AS o
    WHERE o.payment_reference = v_reference
      AND o.id <> p_order_id
  ) THEN
    RETURN 'duplicate_reference';
  END IF;

  SELECT o.total_amount, o.currency, o.payment_status,
         o.fulfillment_status, o.expires_at, o.payment_reference
    INTO v_total_amount, v_currency, v_payment_status,
         v_fulfillment_status, v_expires_at, v_existing_ref
  FROM public.orders AS o
  WHERE o.id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  -- A late webhook must never resurrect a refunded order.
  IF v_payment_status = 'refunded' THEN
    RETURN 'refunded';
  END IF;

  -- Same reference replayed = idempotent; a different reference on an order
  -- that is already paid is a second charge and must be surfaced.
  IF v_payment_status IN ('paid', 'paid_needs_review') THEN
    RETURN CASE WHEN v_existing_ref IS NOT DISTINCT FROM v_reference
                THEN 'already_paid' ELSE 'duplicate_payment' END;
  END IF;

  -- A reference bound to this order at checkout is authoritative: a webhook
  -- carrying a different one must never overwrite it. Park the order for a
  -- human (keeping the bound reference) and tell the caller to alert.
  IF v_existing_ref IS NOT NULL AND v_existing_ref <> v_reference THEN
    UPDATE public.orders AS o
       SET payment_status = 'paid_needs_review'
     WHERE o.id = p_order_id;
    RETURN 'reference_mismatch';
  END IF;

  IF p_paid_amount IS DISTINCT FROM v_total_amount
     OR upper(btrim(coalesce(p_currency, ''))) <> upper(v_currency) THEN
    UPDATE public.orders AS o
       SET payment_status = 'paid_needs_review',
           payment_reference = v_reference
     WHERE o.id = p_order_id;
    RETURN 'amount_mismatch';
  END IF;

  IF v_payment_status <> 'pending'
     OR v_fulfillment_status = 'cancelled'
     OR now() > v_expires_at THEN
    UPDATE public.orders AS o
       SET payment_status = 'paid_needs_review',
           payment_reference = v_reference
     WHERE o.id = p_order_id;
    RETURN 'paid_needs_review';
  END IF;

  -- Deterministic lock order across the products in this order.
  PERFORM 1
  FROM public.products AS p
  JOIN public.order_items AS oi ON oi.product_id = p.id
  WHERE oi.order_id = p_order_id
  ORDER BY p.id
  FOR UPDATE OF p;

  SELECT EXISTS (
    SELECT 1
    FROM public.order_items AS oi
    JOIN public.products AS p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
      AND (p.is_active = false OR p.stock_quantity < oi.quantity)
  )
  INTO v_missing_stock;

  IF v_missing_stock THEN
    UPDATE public.orders AS o
       SET payment_status = 'paid_needs_review',
           payment_reference = v_reference
     WHERE o.id = p_order_id;
    RETURN 'paid_needs_review';
  END IF;

  UPDATE public.products AS p
     SET stock_quantity = p.stock_quantity - oi.quantity
  FROM public.order_items AS oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p.id;

  UPDATE public.orders AS o
     SET payment_status = 'paid',
         payment_reference = v_reference
   WHERE o.id = p_order_id;

  RETURN 'paid';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fulfill_paid_order(uuid, text, bigint, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_paid_order(uuid, text, bigint, text)
  TO service_role;

-- ----------------------------------------------------------------------------
-- 4c. public.get_guest_order()
--     Order number plus email is the guest credential. The projection is
--     deliberately narrow: no shipping_address, customer_phone or email.
--     Both columns are stored normalised (upper-case order number, lower-case
--     trimmed email), so the comparison is index-friendly. Order numbers carry
--     48 bits of entropy: the server MUST call check_rate_limit() per caller
--     IP and per order number before every lookup.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_guest_order(
  p_order_number text,
  p_email text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'order_number', o.order_number,
    'payment_status', o.payment_status,
    'fulfillment_status', o.fulfillment_status,
    'tracking_code', o.tracking_code,
    'total_amount', o.total_amount,
    'currency', o.currency,
    'created_at', o.created_at,
    'items', coalesce(
      (
        SELECT jsonb_agg(
                 jsonb_build_object(
                   'product_name', oi.product_name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price
                 )
                 ORDER BY oi.product_name
               )
        FROM public.order_items AS oi
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    )
  )
  FROM public.orders AS o
  WHERE o.order_number   = upper(btrim(p_order_number))
    AND o.customer_email = lower(btrim(p_email))
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_guest_order(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_order(text, text)
  TO service_role;

-- ----------------------------------------------------------------------------
-- 4d. public.check_rate_limit()
--     Single atomic upsert per hit: no read-then-write race, and the caller
--     only learns allowed/denied.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max_hits int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hits int;
BEGIN
  IF p_key IS NULL OR btrim(p_key) = '' OR char_length(p_key) > 200 THEN
    RAISE EXCEPTION 'rate limit key is required and must be at most 200 characters';
  END IF;

  IF p_max_hits IS NULL OR p_max_hits NOT BETWEEN 1 AND 1000000
     OR p_window_seconds IS NULL OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'p_max_hits must be 1-1000000 and p_window_seconds 1-86400';
  END IF;

  -- Opportunistic, bounded cleanup: every call also drops a few rows whose
  -- window_start is older than the longest allowed window (1 day), so an
  -- attacker flooding unique keys between scheduled purges cannot grow the
  -- table faster than it is trimmed. Expired rows are equivalent to absent
  -- ones, so this never changes a verdict. SKIP LOCKED avoids contention.
  DELETE FROM public.rate_limits AS rl
  WHERE rl.key IN (
    SELECT x.key
    FROM public.rate_limits AS x
    WHERE x.window_start < now() - interval '1 day'
    ORDER BY x.window_start
    LIMIT 25
    FOR UPDATE SKIP LOCKED
  );

  INSERT INTO public.rate_limits AS rl (key, hits, window_start)
  VALUES (btrim(p_key), 1, now())
  ON CONFLICT (key) DO UPDATE
     SET hits = CASE
                  WHEN rl.window_start <= now() - make_interval(secs => p_window_seconds)
                    THEN 1
                  ELSE least(rl.hits + 1, 1000000)
                END,
         window_start = CASE
                  WHEN rl.window_start <= now() - make_interval(secs => p_window_seconds)
                    THEN now()
                  ELSE rl.window_start
                END
  RETURNING rl.hits INTO v_hits;

  RETURN v_hits <= p_max_hits;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, int, int)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int)
  TO service_role;

-- Housekeeping: attacker-chosen keys would otherwise grow rate_limits forever.
-- Call hourly from pg_cron or a server cron route (service_role only).
CREATE OR REPLACE FUNCTION public.purge_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.rate_limits AS rl
  WHERE rl.window_start < now() - interval '1 day';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_rate_limits()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_rate_limits()
  TO service_role;

-- ============================================================================
-- 5. Storage
--    Both buckets are public-read (the storefront renders the URLs), so writes
--    are the only thing policies must protect. RLS is already enabled on
--    storage.objects by Supabase; do not re-enable it here.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-media', 'product-media', true, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('blog-media', 'blog-media', true, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
   SET public = EXCLUDED.public,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY storage_media_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('product-media', 'blog-media')
    AND (SELECT private.is_admin())
  );

-- Object names are restricted to a safe charset, no '..' segments, and image
-- extensions only. The bucket MIME allow-list alone trusts the client-declared
-- Content-Type, so an .svg/.html uploaded as image/png is rejected by name.
CREATE POLICY storage_media_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('product-media', 'blog-media')
    AND name ~* '^[a-z0-9][a-z0-9/_.-]{0,200}\.(jpe?g|png|webp)$'
    AND name !~ '\.\.'
    AND (SELECT private.is_admin())
  );

CREATE POLICY storage_media_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('product-media', 'blog-media')
    AND (SELECT private.is_admin())
  )
  WITH CHECK (
    bucket_id IN ('product-media', 'blog-media')
    AND name ~* '^[a-z0-9][a-z0-9/_.-]{0,200}\.(jpe?g|png|webp)$'
    AND name !~ '\.\.'
    AND (SELECT private.is_admin())
  );

CREATE POLICY storage_media_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('product-media', 'blog-media')
    AND (SELECT private.is_admin())
  );
