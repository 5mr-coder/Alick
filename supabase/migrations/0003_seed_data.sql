-- ============================================================================
-- Alick System Services - 0003_seed_data
-- Stage 3 of 3: initial seed data for the static storefront content.
--
-- Every monetary value is minor-unit NGN kobo stored as bigint, so each
-- whole-Naira value from the TypeScript storefront arrays is multiplied by 100
-- (680000 Naira -> 68000000 kobo).
--
-- Idempotency: every catalog/config table uses ON CONFLICT DO NOTHING on its
-- natural key (slug / slot / id), so a manual re-run can never overwrite live
-- stock, prices, settings or admin-edited content. flash_sales and reviews
-- have no natural unique key, so they are inserted behind guards that skip
-- (never fail) when the seed no longer applies. Re-running this file is safe.
--
-- Intentionally NOT seeded: public.user_roles (admin allow-list is granted
-- manually), public.orders / public.order_items (runtime checkout data),
-- public.contact_messages (customer submissions), public.rate_limits
-- (runtime counters).
-- ============================================================================

-- ============================================================================
-- 1. public.site_settings - single configuration row
--    Contact details from components/Footer.tsx and app/contact/page.tsx.
-- ============================================================================

INSERT INTO public.site_settings (
  id,
  site_name,
  tagline,
  phone,
  email,
  address,
  whatsapp_number,
  social_links,
  shipping_rates,
  high_value_threshold
)
VALUES (
  true,
  'Alick System Services',
  'Smart Tech. Sharp Deals.',
  '+234 803 084 1357',
  'alickmgt@gmail.com',
  '5 Obafemi Awolowo Way, Ikeja, Lagos, 101233, Nigeria',
  '+2348030841357',
  '{"whatsapp": "https://wa.me/2348030841357"}'::jsonb,
  -- Delivery fees are kobo: 0 = Ikeja pickup, 500000 = N5,000 Lagos delivery,
  -- 1500000 = N15,000 interstate. Admins can adjust these in /admin/settings.
  '{"ikeja_pickup": 0, "lagos_delivery": 500000, "interstate_delivery": 1500000}'::jsonb,
  50000000
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. public.site_banners - home hero
--    Source: components/home/HeroParallax.tsx (heroImages, h1, paragraph,
--    primary CTA and the three hero stats).
-- ============================================================================

INSERT INTO public.site_banners (
  slot,
  headline,
  subheadline,
  cta_text,
  cta_link,
  media_urls,
  metadata,
  is_active
)
VALUES (
  'home_hero',
  'Lagos'' Premier Tech Store.',
  'Laptops, desktops, smart gadgets, and expert repairs — all under one roof at Ikeja, Lagos. Quality guaranteed, prices you''ll love.',
  'Shop Laptops',
  '/products',
  ARRAY[
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&q=80'
  ],
  '{"label": "Smart Tech. Sharp Deals.", "stats": [{"value": "500+", "label": "Products Sold"}, {"value": "4.9★", "label": "Customer Rating"}, {"value": "24hr", "label": "Repair Turnaround"}], "secondary_cta": {"text": "Our Services", "link": "/services"}}'::jsonb,
  true
)
ON CONFLICT (slot) DO NOTHING;

-- ============================================================================
-- 3. public.products - the 10 static storefront products
--    Source: product arrays in types/index.ts.
--      * price/old_price are whole Naira there, so both are multiplied by 100.
--      * old_price = 0 in the static data means "no strike-through price", so
--        it becomes NULL rather than 0 kobo.
--      * retail_price stays NULL: no wholesale price exists in local code.
--      * For the three is_flash_sale items, price is seeded at the pre-sale
--        (old_price) amount so trg_validate_flash_sale accepts the sale price
--        below it; compare_at_price stays NULL for those rows (equal to price
--        it would render a pointless strike-through once the sale ends).
--      * is_published maps to is_active; tags are derived from category+brand
--        because the static Tag[] relation is never populated in local code.
-- ============================================================================

INSERT INTO public.products (
  slug,
  name,
  brand,
  model,
  description,
  category,
  tags,
  price,
  retail_price,
  compare_at_price,
  stock_quantity,
  specs,
  images,
  is_featured,
  is_active
)
VALUES
  ('hp-elitebook-840-g9', 'HP EliteBook 840 G9', 'HP', 'EliteBook 840 G9',
   'Business powerhouse with a stunning display, strong security features, and all-day battery life.',
   'laptops', ARRAY['laptops', 'hp'], 68000000, NULL, 75000000, 100,
   '{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "Intel i7"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'],
   true, true),

  ('dell-xps-15-oled', 'Dell XPS 15 OLED', 'Dell', 'XPS 15 9530',
   'The creator''s ultimate laptop with a gorgeous OLED panel, powerful performance, and premium build.',
   'laptops', ARRAY['laptops', 'dell'], 140000000, NULL, NULL, 100,
   '{"RAM": "32GB", "Storage": "1TB SSD", "Processor": "Intel i9"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
   true, true),

  ('lenovo-thinkpad-x1-carbon', 'Lenovo ThinkPad X1 Carbon', 'Lenovo', 'ThinkPad X1 Carbon Gen 11',
   'Ultra-light, ultra-durable business laptop that travels as hard as you do.',
   'laptops', ARRAY['laptops', 'lenovo'], 89000000, NULL, 98000000, 100,
   '{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "Intel i7"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80'],
   true, true),

  ('macbook-air-m3', 'MacBook Air M3', 'Apple', 'MacBook Air 15" M3',
   'Apple silicon at its finest — silent, fast, and incredibly efficient.',
   'laptops', ARRAY['laptops', 'apple'], 155000000, NULL, NULL, 100,
   '{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "Apple M3"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80'],
   true, true),

  ('hp-prodesk-400-g9', 'HP ProDesk 400 G9 SFF', 'HP', 'ProDesk 400 G9',
   'Compact small-form-factor desktop for office work, accounts, and everyday multitasking.',
   'desktops', ARRAY['desktops', 'hp'], 52000000, NULL, 59000000, 40,
   '{"RAM": "8GB", "Storage": "512GB SSD", "Processor": "Intel i5"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80'],
   true, true),

  ('dell-optiplex-7010', 'Dell OptiPlex 7010 Tower', 'Dell', 'OptiPlex 7010',
   'Reliable business desktop with room for upgrades — ideal for offices and cyber cafés.',
   'desktops', ARRAY['desktops', 'dell'], 51000000, NULL, NULL, 22,
   '{"RAM": "16GB", "Storage": "256GB SSD", "Processor": "Intel i5"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80'],
   false, true),

  ('lenovo-thinkcentre-m70q', 'Lenovo ThinkCentre M70q Tiny', 'Lenovo', 'ThinkCentre M70q',
   'Ultra-compact desktop that fits behind a monitor yet handles heavy office workloads.',
   'desktops', ARRAY['desktops', 'lenovo'], 61500000, NULL, NULL, 12,
   '{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "Intel i7"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=600&q=80'],
   false, true),

  ('sony-wf-1000xm5', 'Sony WF-1000XM5 Earbuds', 'Sony', 'WF-1000XM5',
   'Industry-leading noise cancelling earbuds with rich sound and all-day comfort.',
   'smart-gadgets', ARRAY['smart-gadgets', 'sony'], 32000000, NULL, NULL, 30,
   '{"Type": "Wireless earbuds", "Battery": "8 hrs", "ANC": "Yes"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'],
   true, true),

  ('apple-watch-series-9', 'Apple Watch Series 9', 'Apple', 'Watch Series 9 45mm',
   'Health, fitness, and notifications on your wrist with a bright always-on display.',
   'smart-gadgets', ARRAY['smart-gadgets', 'apple'], 42000000, NULL, 46500000, 18,
   '{"Size": "45mm", "Battery": "18 hrs", "Connectivity": "GPS"}'::jsonb,
   ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80'],
   true, true),

  ('anker-powercore-20000', 'Anker PowerCore 20,000mAh', 'Anker', 'PowerCore 20K',
   'High-capacity power bank with fast charging for laptops, phones, and tablets.',
   'smart-gadgets', ARRAY['smart-gadgets', 'anker'], 4800000, NULL, NULL, 60,
   '{"Capacity": "20,000mAh", "Output": "65W", "Ports": "2x USB-C"}'::jsonb,
   ARRAY['/smart-glasses.jpg'],
   false, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 4. public.flash_sales - the three is_flash_sale products
--    Window matches the storefront countdown in components/home/FlashSales.tsx
--    (ends 2026-12-31T23:59:59Z) and is already running at seed time.
--    sale_price is the whole-Naira current price x 100, which is strictly below
--    the pre-sale products.price seeded above, so trg_validate_flash_sale
--    accepts each row. Guarded on (product_id, starts_at) because the table has
--    no natural unique key.
-- ============================================================================

INSERT INTO public.flash_sales (title, product_id, sale_price, starts_at, ends_at, is_active)
SELECT v.title, p.id, v.sale_price, v.starts_at, v.ends_at, true
FROM (
  VALUES
    ('Creator Week: Dell XPS 15 OLED',          'dell-xps-15-oled',   125000000::bigint,
     timestamptz '2026-11-01T00:00:00Z', timestamptz '2026-12-31T23:59:59Z'),
    ('Office Desktop Deal: Dell OptiPlex 7010', 'dell-optiplex-7010',  44500000::bigint,
     timestamptz '2026-11-01T00:00:00Z', timestamptz '2026-12-31T23:59:59Z'),
    ('Audio Steal: Sony WF-1000XM5',            'sony-wf-1000xm5',     28500000::bigint,
     timestamptz '2026-11-01T00:00:00Z', timestamptz '2026-12-31T23:59:59Z')
) AS v (title, slug, sale_price, starts_at, ends_at)
JOIN public.products AS p ON p.slug = v.slug
WHERE
  -- Re-run safety: skip (never fail) when an admin has since deleted the
  -- product, lowered its price to/below the sale price, or created any
  -- overlapping active sale (which would make trg_validate_flash_sale raise).
  p.price > v.sale_price
  AND NOT EXISTS (
    SELECT 1
    FROM public.flash_sales AS fs
    WHERE fs.product_id = p.id
      AND (
        fs.starts_at = v.starts_at
        OR (fs.is_active = true
            AND tstzrange(fs.starts_at, fs.ends_at, '[)') && tstzrange(v.starts_at, v.ends_at, '[)'))
      )
  );

-- ============================================================================
-- 5. public.services - the four static repair services
--    Source: app/services/page.tsx. Icons are stored as serializable names in
--    place of the inline JSX/SVG markup used by the page.
-- ============================================================================

INSERT INTO public.services (
  slug,
  title,
  description,
  starting_price,
  turnaround,
  features,
  icon,
  image_url,
  sort_order,
  is_active
)
VALUES
  ('laptop-repair', 'Laptop Repair',
   'Comprehensive diagnostics and repair for all laptop brands. We identify and fix hardware faults, component failures, and system errors quickly and professionally.',
   500000, NULL,
   ARRAY['Free diagnostic check', 'All major brands', 'Genuine parts used', '90-day repair warranty'],
   'wrench', NULL, 1, true),

  ('general-laptop-repair', 'General Laptop Repair',
   'From cracked screens and broken keyboards to charging port replacements and hinge repairs — our technicians handle all physical laptop damage.',
   800000, NULL,
   ARRAY['Screen replacement', 'Keyboard repair', 'Charging port fix', 'Hinge & casing repair'],
   'laptop', NULL, 2, true),

  ('os-installation', 'OS Installation',
   'Fresh Windows, Linux, or macOS installation with all necessary drivers, updates, and essential software pre-configured for you.',
   500000, NULL,
   ARRAY['Windows 10 & 11', 'Ubuntu / Linux Mint', 'Driver installation', 'Software setup'],
   'server', NULL, 3, true),

  ('ram-memory-upgrades', 'RAM & Memory Upgrades',
   'Dramatically improve your laptop''s speed and multitasking capability with a professional RAM upgrade or SSD installation service.',
   1500000, NULL,
   ARRAY['RAM upgrade (8GB to 32GB)', 'SSD installation', 'Data migration included', 'Before/after benchmark'],
   'cpu', NULL, 4, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 6. public.blog_posts - the three static posts
--    Source: postsStatic in types/index.ts (re-exported as `posts`).
--    The static objects carry no `content` body, so the excerpt is promoted
--    into a single paragraph: public.blog_posts.content is NOT NULL and the
--    storefront detail page renders it as HTML.
-- ============================================================================

INSERT INTO public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  cover_image,
  author,
  category,
  tags,
  is_featured,
  published,
  published_at
)
VALUES
  ('how-to-choose-laptop-lagos', 'How to choose the right laptop in Lagos',
   'A practical buying guide for students, professionals, and small business owners shopping for a laptop in Nigeria.',
   '<p>A practical buying guide for students, professionals, and small business owners shopping for a laptop in Nigeria.</p>',
   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
   'Alick System Services', 'Buying Guide', ARRAY['laptops', 'buying guide'],
   true, true, timestamptz '2026-01-10T00:00:00Z'),

  ('macbook-air-m3-vs-windows-ultrabooks', 'MacBook Air M3 vs Windows ultrabooks',
   'An honest comparison of battery life, performance, and value before you spend big on a new ultrabook.',
   '<p>An honest comparison of battery life, performance, and value before you spend big on a new ultrabook.</p>',
   'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
   'Alick System Services', 'Buying Guide', ARRAY['macbook', 'comparison'],
   false, true, timestamptz '2026-01-15T00:00:00Z'),

  ('keep-laptop-cool-nigerian-heat', 'Keep your laptop cool in Nigerian heat',
   'Simple tips to stop overheating, extend battery life, and avoid costly repairs in a hot climate.',
   '<p>Simple tips to stop overheating, extend battery life, and avoid costly repairs in a hot climate.</p>',
   'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
   'Alick System Services', 'Tech Tips', ARRAY['cooling', 'maintenance'],
   false, true, timestamptz '2026-01-20T00:00:00Z')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 7. public.reviews - the three static storefront testimonials
--    Source: app/reviews/page.tsx. The page renders five gold stars for every
--    testimonial and shows no product link, so these seed as rating = 5,
--    is_approved = true and product_id = NULL (general store feedback).
--    No natural unique key exists, hence the guarded WHERE NOT EXISTS on
--    (author_name, created_at).
-- ============================================================================

INSERT INTO public.reviews (product_id, author_name, rating, comment, image_url, is_approved, created_at)
SELECT
  NULL,
  'Chioma Okonkwo',
  5,
  'I bought a laptop from Alick System Services and it arrived in perfect condition. The team was very helpful and patient with all my questions.',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
  true,
  timestamptz '2026-01-12T00:00:00Z'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.reviews AS r
  WHERE r.author_name = 'Chioma Okonkwo'
    AND r.created_at = timestamptz '2026-01-12T00:00:00Z'
);

INSERT INTO public.reviews (product_id, author_name, rating, comment, image_url, is_approved, created_at)
SELECT
  NULL,
  'Emeka Nwosu',
  5,
  'My laptop battery was dying fast. They replaced it quickly, at a fair price, and now my machine lasts all day again. Highly recommend.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  true,
  timestamptz '2026-01-18T00:00:00Z'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.reviews AS r
  WHERE r.author_name = 'Emeka Nwosu'
    AND r.created_at = timestamptz '2026-01-18T00:00:00Z'
);

INSERT INTO public.reviews (product_id, author_name, rating, comment, image_url, is_approved, created_at)
SELECT
  NULL,
  'Yetunde Adesanya',
  5,
  'I came in with a cracked screen and left with a laptop that looks and feels brand new. Online reviews don''t lie — they really do great work.',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  true,
  timestamptz '2026-01-25T00:00:00Z'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.reviews AS r
  WHERE r.author_name = 'Yetunde Adesanya'
    AND r.created_at = timestamptz '2026-01-25T00:00:00Z'
);
