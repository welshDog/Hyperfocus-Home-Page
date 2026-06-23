-- ════════════════════════════════════════════════════════════════════
-- WelshDog Designs — PRODUCT SEED (DRAFT — NOT YET RUN)
-- ════════════════════════════════════════════════════════════════════
-- 19 products derived from the 8 named lines in WELSHDOG-SHOP-PLAN.md.
--
-- Every row is intentionally:
--    price  = 0          ← FILL IN real £ price
--    active = false       ← flip to true ONLY after price + description are real
--    images = '{}'        ← add image URLs (Supabase Storage or hosted) later
--    stock  = 0           ← set real stock when activating
--
-- Descriptions are placeholders prefixed with "TODO:" so you can see exactly
-- what to replace. Nothing here is invented pricing — all prices are 0.
--
-- Re-runnable & safe: ON CONFLICT (slug) DO NOTHING means running this twice
-- won't duplicate or overwrite rows you've since edited.
--
-- ⚠️  DO NOT run against the live DB until prices/descriptions are confirmed.
--     This DB (yhtmuibgdnxhbgboajhc) is shared with the live HyperVibe course.
-- ════════════════════════════════════════════════════════════════════

insert into public.products (name, slug, description, price, category, stock, active, images) values

-- ───────────────── 3D Prints (4) ─────────────────
('WD Coaster Stack of 4',          'wd-coaster-stack-of-4',          'TODO: real description — set of 4 stacking 3D-printed WelshDog coasters.',                 0, '3D Prints', 0, false, '{}'),
('WD Headphone Stand',             'wd-headphone-stand',             'TODO: real description — sturdy 3D-printed desk headphone stand.',                          0, '3D Prints', 0, false, '{}'),
('Princess Vanity Trio',           'princess-vanity-trio',           'TODO: real description — three-piece princess vanity display set.',                         0, '3D Prints', 0, false, '{}'),
('Crown Stand',                    'crown-stand',                    'TODO: real description — 3D-printed crown / tiara display stand.',                          0, '3D Prints', 0, false, '{}'),

-- ───────────────── Mugs — Dyslexia / ADHD range (4) ─────────────────
('"Beware I''m Dyslexic" Mug',     'beware-im-dyslexic-mug',         'TODO: real description — ceramic mug, WelshDog "Beware I''m Dyslexic" design.',             0, 'Mugs', 0, false, '{}'),
('"Hyperfocus Mode On" Mug',       'hyperfocus-mode-on-mug',         'TODO: real description — ceramic mug, "Hyperfocus Mode On" design.',                        0, 'Mugs', 0, false, '{}'),
('"ADHD: Now Where Was I?" Mug',   'adhd-now-where-was-i-mug',       'TODO: real description — ceramic mug, ADHD humour design.',                                 0, 'Mugs', 0, false, '{}'),
('"Embrace Neurodiversity" Mug',   'embrace-neurodiversity-mug',     'TODO: real description — ceramic mug, "Embrace Neurodiversity" design.',                    0, 'Mugs', 0, false, '{}'),

-- ───────────────── Gifts — Personalised Drip Wall Plate (1) ─────────────────
('Personalised Drip Wall Plate',   'personalised-drip-wall-plate',   'TODO: real description — personalised drip-effect wall plate. Specify name/text at order.', 0, 'Gifts', 0, false, '{}'),

-- ───────────────── Gifts — Rosette Cuddle Bears (2) ─────────────────
('Rosette Cuddle Bear',            'rosette-cuddle-bear',            'TODO: real description — rosette cuddle bear keepsake.',                                    0, 'Gifts', 0, false, '{}'),
('Rosette Cuddle Bear (Personalised)', 'rosette-cuddle-bear-personalised', 'TODO: real description — personalised rosette cuddle bear with name/date.',            0, 'Gifts', 0, false, '{}'),

-- ───────────────── Gifts — Name & Text range (4) ─────────────────
('Personalised Name Plaque',       'personalised-name-plaque',       'TODO: real description — custom name plaque. Specify name/text at order.',                  0, 'Gifts', 0, false, '{}'),
('Custom Text Keyring',            'custom-text-keyring',            'TODO: real description — personalised keyring with your text.',                             0, 'Gifts', 0, false, '{}'),
('Personalised Name Night Light',  'personalised-name-night-light',  'TODO: real description — LED name night light. Specify name at order.',                     0, 'Gifts', 0, false, '{}'),
('Custom Text Desk Sign',          'custom-text-desk-sign',          'TODO: real description — personalised desk sign with your text.',                           0, 'Gifts', 0, false, '{}'),

-- ───────────────── Bundles (4) ─────────────────
('Neurodivergent Starter Bundle',  'neurodivergent-starter-bundle',  'TODO: real description + what''s included + bundle saving.',                                0, 'Bundles', 0, false, '{}'),
('Desk Setup Bundle',              'desk-setup-bundle',              'TODO: real description — Headphone Stand + Coaster Stack bundle. Confirm contents.',        0, 'Bundles', 0, false, '{}'),
('Mug of Tee Bundle',              'mug-of-tee-bundle',              'TODO: real description — mug + tee bundle. Confirm contents.',                              0, 'Bundles', 0, false, '{}'),
('Princess Vanity Bundle',         'princess-vanity-bundle',         'TODO: real description — Princess Vanity Trio + Crown Stand bundle. Confirm contents.',     0, 'Bundles', 0, false, '{}')

on conflict (slug) do nothing;

-- After filling prices + descriptions, activate sellable items with e.g.:
--   update public.products set active = true where slug = 'wd-coaster-stack-of-4';
