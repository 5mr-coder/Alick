-- ============================================================================
-- Alick System Services - 0001_initial_schema
-- Stage 1 of 3: extensions, tables, constraints, triggers, indexes, and
-- default-deny RLS enablement.
--
-- Conventions
--   * Every monetary column is minor-unit NGN kobo stored as bigint (int8).
--   * Every timestamp is timestamptz.
--   * Free-form strings are text; length bounds live in CHECK constraints.
--   * RLS is enabled on all tables here. Policies, grants, RPCs and storage
--     arrive in 0002_rls_grants_rpc_storage.sql; seed data in 0003.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ----------------------------------------------------------------------------
-- 1. public.user_roles
--    Admin allow-list. The primary key doubles as the auth.users FK index.
-- ----------------------------------------------------------------------------

CREATE TABLE public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. public.products
-- ----------------------------------------------------------------------------

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  model text,
  description text,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  price bigint NOT NULL CHECK (price >= 0 AND price <= 10000000000000),
  retail_price bigint CHECK (retail_price IS NULL OR retail_price > 0),
  compare_at_price bigint CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  stock_quantity int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_retail_price_lte_price CHECK (retail_price IS NULL OR retail_price <= price)
);

-- ----------------------------------------------------------------------------
-- 3. public.flash_sales
--    Price/overlap integrity is enforced by trg_validate_flash_sale below.
-- ----------------------------------------------------------------------------

CREATE TABLE public.flash_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price bigint NOT NULL CHECK (sale_price > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. public.site_banners
--    media_urls is the only media column; an empty array means "text only".
-- ----------------------------------------------------------------------------

CREATE TABLE public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text UNIQUE NOT NULL,
  headline text NOT NULL,
  subheadline text,
  cta_text text,
  cta_link text,
  media_urls text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. public.site_settings
--    Single-row configuration: the boolean primary key can only ever be true.
-- ----------------------------------------------------------------------------

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  site_name text NOT NULL DEFAULT 'Alick System Services',
  tagline text,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  whatsapp_number text NOT NULL,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  shipping_rates jsonb NOT NULL DEFAULT '{"ikeja_pickup": 0, "lagos_delivery": 500000, "interstate_delivery": 1500000}'::jsonb,
  high_value_threshold bigint NOT NULL DEFAULT 50000000 CHECK (high_value_threshold >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. public.orders
--    Guest checkout: no user_id column by design.
-- ----------------------------------------------------------------------------

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT ('ALK-' || upper(encode(extensions.gen_random_bytes(6), 'hex'))),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 120),
  customer_email text NOT NULL CHECK (char_length(customer_email) <= 150),
  customer_phone text NOT NULL CHECK (char_length(customer_phone) BETWEEN 7 AND 30),
  shipping_zone text NOT NULL,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  sales_mode text NOT NULL DEFAULT 'consumer' CHECK (sales_mode IN ('consumer', 'retail')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  subtotal bigint NOT NULL CHECK (subtotal >= 0),
  shipping_fee bigint NOT NULL CHECK (shipping_fee >= 0),
  total_amount bigint NOT NULL CHECK (total_amount > 0 AND total_amount = subtotal + shipping_fee),
  currency text NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  payment_reference text UNIQUE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'paid_needs_review', 'failed', 'refunded')),
  fulfillment_status text NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  requires_review boolean NOT NULL DEFAULT false,
  tracking_code text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- An order can never be paid / parked for review / refunded without a
  -- payment reference attached.
  CONSTRAINT orders_paid_requires_reference CHECK (
    payment_status NOT IN ('paid', 'paid_needs_review', 'refunded')
    OR payment_reference IS NOT NULL
  )
);

-- ----------------------------------------------------------------------------
-- 7. public.order_items
--    product_name/unit_price are snapshots so history survives edits.
-- ----------------------------------------------------------------------------

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  sales_mode text NOT NULL DEFAULT 'consumer' CHECK (sales_mode IN ('consumer', 'retail')),
  unit_price bigint NOT NULL CHECK (unit_price >= 0),
  quantity int NOT NULL CHECK (quantity > 0),
  UNIQUE (order_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 8. public.services
-- ----------------------------------------------------------------------------

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  starting_price bigint CHECK (starting_price IS NULL OR starting_price >= 0),
  turnaround text,
  features text[] NOT NULL DEFAULT '{}',
  icon text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. public.blog_posts
-- ----------------------------------------------------------------------------

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  author text NOT NULL DEFAULT 'Alick System Services',
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. public.reviews
--     product_id is nullable so reviews outlive a deleted product.
-- ----------------------------------------------------------------------------

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 2 AND 80),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 5 AND 1000),
  image_url text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 11. public.contact_messages
-- ----------------------------------------------------------------------------

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 150),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 2 AND 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 3000),
  service_slug text CHECK (service_slug IS NULL OR char_length(service_slug) <= 100),
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 12. public.rate_limits
--     Fixed-window counters consumed by public.check_rate_limit() in stage 2.
-- ----------------------------------------------------------------------------

CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  hits int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Trigger functions
--   search_path is empty, so every object reference below is schema-qualified.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- A flash sale must undercut its product and must not overlap another active
-- sale window for the same product. The product row is locked first so a
-- concurrent products.price update cannot interleave with the price check.
CREATE OR REPLACE FUNCTION public.validate_flash_sale()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_price bigint;
BEGIN
  SELECT p.price
    INTO v_price
  FROM public.products AS p
  WHERE p.id = NEW.product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'flash sale product % does not exist', NEW.product_id;
  END IF;

  -- Only enforce the undercut for active sales so a stale sale can still be
  -- deactivated after the product price has been lowered.
  IF NEW.is_active AND NEW.sale_price >= v_price THEN
    RAISE EXCEPTION 'flash sale price % must be lower than product price %', NEW.sale_price, v_price;
  END IF;

  IF NEW.is_active THEN
    IF EXISTS (
      SELECT 1
      FROM public.flash_sales AS fs
      WHERE fs.product_id = NEW.product_id
        AND fs.is_active = true
        AND fs.id IS DISTINCT FROM NEW.id
        AND tstzrange(fs.starts_at, fs.ends_at, '[)') && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
    ) THEN
      RAISE EXCEPTION 'flash sale window for product % overlaps an existing active sale', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- A product price may never be lowered to or below a running sale price,
-- otherwise the storefront would charge more than the advertised discount.
CREATE OR REPLACE FUNCTION public.guard_product_price()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_active_sale_price bigint;
BEGIN
  SELECT max(fs.sale_price)
    INTO v_active_sale_price
  FROM public.flash_sales AS fs
  WHERE fs.product_id = NEW.id
    AND fs.is_active = true
    AND fs.ends_at > now();

  IF v_active_sale_price IS NOT NULL AND NEW.price <= v_active_sale_price THEN
    RAISE EXCEPTION 'product price % must be greater than active sale price %', NEW.price, v_active_sale_price;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Payment-status state machine. SECURITY INVOKER on purpose: current_user is
-- the effective role, so definer RPCs (running as the function owner) and the
-- service role are distinguishable from an admin session ('authenticated').
--   * refunded is terminal for everyone.
--   * Everyone: pending -> paid | failed | paid_needs_review,
--               failed -> paid_needs_review, paid -> refunded,
--               paid_needs_review -> paid | refunded.
--   * An admin session may only resolve: pending -> failed,
--     paid_needs_review -> paid | refunded, paid -> refunded. Settling a
--     pending order as paid is the job of fulfill_paid_order (stock, amount
--     and reference checks), never a manual edit.
CREATE OR REPLACE FUNCTION public.guard_order_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.payment_status IS NOT DISTINCT FROM OLD.payment_status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.payment_status = 'pending' AND NEW.payment_status IN ('paid', 'failed', 'paid_needs_review'))
    OR (OLD.payment_status = 'failed' AND NEW.payment_status = 'paid_needs_review')
    OR (OLD.payment_status = 'paid' AND NEW.payment_status = 'refunded')
    OR (OLD.payment_status = 'paid_needs_review' AND NEW.payment_status IN ('paid', 'refunded'))
  ) THEN
    RAISE EXCEPTION 'invalid payment_status transition % -> %', OLD.payment_status, NEW.payment_status;
  END IF;

  IF current_user = 'authenticated' AND NOT (
    (OLD.payment_status = 'pending' AND NEW.payment_status = 'failed')
    OR (OLD.payment_status = 'paid_needs_review' AND NEW.payment_status IN ('paid', 'refunded'))
    OR (OLD.payment_status = 'paid' AND NEW.payment_status = 'refunded')
  ) THEN
    RAISE EXCEPTION 'admins cannot move an order from % to %', OLD.payment_status, NEW.payment_status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_order_payment_status
  BEFORE UPDATE OF payment_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_order_payment_status();

CREATE TRIGGER trg_validate_flash_sale
  BEFORE INSERT OR UPDATE ON public.flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_flash_sale();

CREATE TRIGGER trg_guard_product_price
  BEFORE UPDATE OF price ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_product_price();

CREATE TRIGGER trg_products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_site_banners_set_updated_at
  BEFORE UPDATE ON public.site_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- Indexes
--   Postgres does not index foreign keys automatically, and the composite
--   indexes below back the storefront's filtered lookups.
-- ============================================================================

-- Foreign keys
CREATE INDEX flash_sales_product_id_idx ON public.flash_sales (product_id);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX order_items_product_id_idx ON public.order_items (product_id);
CREATE INDEX reviews_product_id_idx ON public.reviews (product_id);

-- Composite lookup indexes (equality columns first, range/sort last)
CREATE INDEX products_category_is_active_idx ON public.products (category, is_active);
CREATE INDEX blog_posts_published_is_featured_published_at_idx ON public.blog_posts (published, is_featured, published_at DESC);
CREATE INDEX flash_sales_is_active_starts_at_ends_at_idx ON public.flash_sales (is_active, starts_at, ends_at);
CREATE INDEX orders_payment_status_expires_at_idx ON public.orders (payment_status, expires_at);

-- Moderation queues and rate-limit purge
CREATE INDEX contact_messages_is_resolved_created_at_idx ON public.contact_messages (is_resolved, created_at DESC);
CREATE INDEX reviews_is_approved_created_at_idx ON public.reviews (is_approved, created_at DESC);
CREATE INDEX rate_limits_window_start_idx ON public.rate_limits (window_start);

-- ============================================================================
-- Default-deny: RLS on all 12 tables. Policies and grants land in 0002.
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
