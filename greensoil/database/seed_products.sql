-- ============================================================
-- GREEN SOIL — Product Seed Data
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Ensure categories exist
-- ─────────────────────────────────────────────────────────────
insert into product_categories (name, slug, description, sort_order, status) values
  ('Fertilizers',       'fertilizers',       'Nitrogen, Phosphorus and Potassium fertilizers', 1, 'ACTIVE'),
  ('Soil Conditioners', 'soil-conditioners', 'Humic acid and organic soil improvement products', 2, 'ACTIVE'),
  ('Micronutrients',    'micronutrients',    'Zinc sulphate and trace element products', 3, 'ACTIVE')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 2. Insert products
-- ─────────────────────────────────────────────────────────────

-- Product 1: Green Calcium Nitrate (کین) — image1.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Green Calcium Nitrate (کین)',
  'green-calcium-nitrate-kain',
  'GS-CAN-50',
  (select id from product_categories where slug = 'fertilizers'),
  'Calcium Ammonium Nitrate — Nitrogen 26% — 50 KG granular fertilizer for fast nitrogen supply.',
  'Green Calcium Nitrate (کین) is a premium granular fertilizer manufactured and distributed by Green Soil Agri Services (Pvt.) Ltd. It contains 26% Nitrogen in the form of Calcium Ammonium Nitrate, making it ideal for all types of crops requiring rapid nitrogen availability. The granular form ensures easy spreading and uniform distribution across fields. It improves soil structure, enhances root development, and boosts crop yield significantly.',
  3500, 3800,
  500, 50,
  '50 KG Bag', 'KG', 'Green Soil',
  'Calcium Ammonium Nitrate (Granular) — Nitrogen (N): 26%',
  'PUBLISHED', true,
  '["Fast nitrogen availability for crops","Improves soil calcium levels","Granular form for easy application","Suitable for all crops and soil types","Enhances root development and yield","Reduces soil acidity"]'::jsonb,
  '{"Nitrogen (N)": "26%", "Form": "Granular", "Net Weight": "50 KG", "Type": "Calcium Ammonium Nitrate"}'::jsonb
);

-- Product 2: Sultan 20L Soil Conditioner — image2.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Sultan Soil Conditioner (20 Litre)',
  'sultan-soil-conditioner-20ltr',
  'GS-SUL-20L',
  (select id from product_categories where slug = 'soil-conditioners'),
  'Sultan liquid soil conditioner — 20 Litre can. Potassium Humic Acid for improved soil health.',
  'Sultan is a premium liquid soil conditioner by Green Soil Agri Services (Pvt.) Ltd. Available in a convenient 20-litre can, it is formulated with Potassium Humic Acid to improve soil structure, water retention, and nutrient uptake. Sultan stimulates microbial activity in the soil, promotes healthy root growth, and increases the availability of nutrients to plants. Suitable for use on all types of crops including vegetables, fruits, cotton, wheat, and rice.',
  8500, 9200,
  150, 20,
  '20 Litre Can', 'Litre', 'Green Soil',
  'Potassium Humic Acid (Liquid)',
  'PUBLISHED', true,
  '["Improves soil structure and water retention","Stimulates beneficial soil microbial activity","Enhances nutrient uptake efficiency","Promotes strong root development","Compatible with all irrigation systems","Suitable for all crops"]'::jsonb,
  '{"Type": "Soil Conditioner", "Form": "Liquid", "Net Volume": "20 Litres", "Active Ingredient": "Potassium Humic Acid"}'::jsonb
);

-- Product 3: Sultan 4L Potassium Humic Acid — image3.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Sultan Potassium Humic Acid 13.50% (4 Litre)',
  'sultan-potassium-humic-acid-4ltr',
  'GS-SUL-4L',
  (select id from product_categories where slug = 'soil-conditioners'),
  'Sultan soil conditioner — Potassium Humic Acid 13.50% — 4 Litre. Humic Acid 100g/L, Potassium (K₂O) 30g/L.',
  'Sultan 4 Litre is a concentrated liquid soil conditioner containing 13.50% Potassium Humic Acid. Distributed by Green Soil Agri Services (Pvt.) Ltd., it is registered under SOA standards. The product contains Humic Acid at 100g/L (10% w/w) and Potassium (K₂O) at 30g/L (3.5% w/v). Sultan improves the physical, chemical, and biological properties of the soil, resulting in better crop performance and higher yields. Ideal for drip irrigation and foliar application.',
  2200, 2500,
  300, 30,
  '4 Litre Can', 'Litre', 'Green Soil',
  'Humic Acid: 100g/L (10% w/w), Potassium (K₂O): 30g/L (3.5% w/v)',
  'PUBLISHED', false,
  '["Potassium Humic Acid 13.50% concentration","Improves soil nutrient holding capacity","Enhances potassium availability to plants","Suitable for drip and foliar application","Improves water use efficiency","Registered product — certified quality"]'::jsonb,
  '{"Humic Acid": "100g/L (10% w/w)", "Potassium (K₂O)": "30g/L (3.5% w/v)", "Net Volume": "4 Litres", "Form": "Liquid", "Type": "Soil Conditioner"}'::jsonb
);

-- Product 4: Green BOP — Bio Organic Phosphate — image4.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Green BOP — Bio Organic Phosphate (گرین بی اوپی)',
  'green-bop-bio-organic-phosphate',
  'GS-BOP-50',
  (select id from product_categories where slug = 'fertilizers'),
  'Bio Organic Phosphate (BOP) — Total Phosphorus (P₂O₅): 20% Min, Organic Matter: 15% Min — 50 KG bag.',
  'Green BOP (گرین بی اوپی) is a Bio Organic Phosphate fertilizer distributed by Green Soil Agri Services (Pvt.) Ltd. It is formulated to supply readily available phosphorus along with organic matter to improve soil fertility. With a minimum of 20% Total Phosphorus (P₂O₅) and 15% Total Organic Matter on a dry weight basis, it is an excellent choice for phosphorus-deficient soils. Bio Organic Phosphate improves root proliferation, enhances flowering and fruiting, and contributes to overall plant health.',
  2800, 3100,
  400, 40,
  '50 KG Bag', 'KG', 'Green Soil',
  'Total Phosphorus (P₂O₅): 20% Min (dry wt basis), Total Organic Matter: 15% Min (dry wt basis)',
  'PUBLISHED', true,
  '["High phosphorus content — 20% P₂O₅ minimum","Contains organic matter for soil improvement","Promotes root growth and plant establishment","Enhances flowering, fruiting, and grain filling","Improves phosphorus use efficiency","Suitable for all crops and soil types"]'::jsonb,
  '{"Total Phosphorus (P₂O₅)": "20% Min", "Total Organic Matter": "15% Min", "Net Weight": "50 KG", "Basis": "Dry weight"}'::jsonb
);

-- Product 5: Green SSP — Single Super Phosphate — image5.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Green SSP — Single Super Phosphate (گرین ایس ایس پی)',
  'green-ssp-single-super-phosphate',
  'GS-SSP-50',
  (select id from product_categories where slug = 'fertilizers'),
  'Single Super Phosphate — Phosphorus (P₂O₅): 18%, Gypsum (CaSO₄): 46% — 50 KG bag.',
  'Green SSP (گرین ایس ایس پی) is a Single Super Phosphate fertilizer manufactured and distributed by Green Soil Agri Services (Pvt.) Ltd. It contains 18% available Phosphorus (P₂O₅) and 46% Gypsum (CaSO₄). The dual nutrient composition makes it particularly valuable for crops requiring both phosphorus and sulphur. It improves root establishment, protein synthesis, and energy transfer within plants. The gypsum content also helps to improve sodic and saline soils.',
  2200, 2500,
  600, 60,
  '50 KG Bag', 'KG', 'Green Soil',
  'Phosphorus (P.O₅): 18%, Gypsum (C.S.): 46%',
  'PUBLISHED', false,
  '["Dual nutrient — Phosphorus and Sulphur","Improves root development and plant establishment","Gypsum content improves saline/sodic soils","Enhances protein synthesis in crops","Cost-effective phosphorus source","Suitable for wheat, cotton, rice, and vegetables"]'::jsonb,
  '{"Phosphorus (P₂O₅)": "18%", "Gypsum (CaSO₄)": "46%", "Net Weight": "50 KG", "Type": "Single Super Phosphate"}'::jsonb
);

-- Product 6: Super Power — Zinc Coated Urea — image6.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Super Power Zinc Coated Urea (سپر پاور)',
  'super-power-zinc-coated-urea',
  'GS-ZCU-50',
  (select id from product_categories where slug = 'fertilizers'),
  'Zinc Coated Urea — Nitrogen 40%, Zinc 3% — 50 KG bag. Best combination of nitrogen and zinc for crops.',
  'Super Power (سپر پاور) is a premium Zinc Coated Urea fertilizer distributed by Green Soil Agri Services (Pvt.) Ltd. It combines 40% Nitrogen with 3% Zinc in a single granule, providing the best combination of these two essential nutrients. The zinc coating reduces nitrogen losses through volatilization and improves zinc availability to plants simultaneously. Pakistan soils are widely deficient in zinc, and Super Power addresses both nitrogen and zinc deficiency in a single application, reducing labour costs and improving crop efficiency.',
  4200, 4600,
  350, 35,
  '50 KG Bag', 'KG', 'Green Soil',
  'Urea Nitrogen (N): 40%, Zinc (Zn): 3%',
  'PUBLISHED', true,
  '["Dual nutrient — Nitrogen 40% and Zinc 3%","Reduces nitrogen volatilization losses","Corrects zinc deficiency in Pakistan soils","Single application for two nutrients","Improves crop quality and yield","Suitable for all major crops"]'::jsonb,
  '{"Nitrogen (N)": "40%", "Zinc (Zn)": "3%", "Net Weight": "50 KG", "Type": "Zinc Coated Urea"}'::jsonb
);

-- Product 7: Jasmine 33% — Zinc Sulphate Monohydrate — image7.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Jasmine 33% Zinc Sulphate Monohydrate (جاسمین)',
  'jasmine-33-zinc-sulphate-monohydrate',
  'GS-ZSM-3',
  (select id from product_categories where slug = 'micronutrients'),
  'Zinc Sulphate Monohydrate 33% — Zinc Sulphate 330g/Kg — 3 KG pack. Corrects zinc deficiency in all crops.',
  'Jasmine (جاسمین) 33% is a high-quality Zinc Sulphate Monohydrate micronutrient product by Green Soil Agri Services (Pvt.) Ltd. Registered under REF Standard No. 02 vide SOA notification, it contains 330g/Kg Zinc Sulphate (33% w/w). Zinc is an essential micronutrient that plays a critical role in enzyme activity, protein synthesis, and plant growth regulation. Jasmine 33% is effective for correcting zinc deficiency across all crops including wheat, rice, maize, cotton, and vegetables. It is suitable for soil and foliar application.',
  1800, 2000,
  800, 80,
  '3 KG Pack', 'KG', 'Green Soil',
  'Zinc Sulphate Monohydrate — Zinc Sulphate: 330g/Kg (33% w/w)',
  'PUBLISHED', false,
  '["Corrects zinc deficiency in all crops","High concentration — 33% Zinc Sulphate","Suitable for soil and foliar application","Improves enzyme activity and protein synthesis","Enhances grain quality and crop yield","Registered product — certified standard"]'::jsonb,
  '{"Zinc Sulphate": "330g/Kg (33% w/w)", "Net Weight": "3 KG", "Type": "Zinc Sulphate Monohydrate", "Standard": "REF No. 02"}'::jsonb
);

-- Product 8: Green NP — Nitrophos — image8.jpg
insert into products (
  name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price,
  stock_quantity, low_stock_threshold,
  packaging_size, unit, brand,
  composition, status, featured,
  benefits, specifications
) values (
  'Green NP — Nitrophos (گرین این پی)',
  'green-np-nitrophos',
  'GS-NP-50',
  (select id from product_categories where slug = 'fertilizers'),
  'Nitrophos — Total Nitrogen (N): 20%, Total Phosphorus (P₂O₅): 22% — 50 KG bag.',
  'Green NP (گرین این پی) is a premium Nitrophos fertilizer distributed by Green Soil Agri Services (Pvt.) Ltd. It supplies two primary macronutrients simultaneously — 20% Nitrogen and 22% Phosphorus (P₂O₅) — making it ideal for basal application at sowing time. Nitrophos promotes rapid plant establishment, strong root development, and efficient energy utilization. It is widely recommended for wheat, rice, sugarcane, maize, cotton, and vegetable crops throughout Pakistan.',
  3200, 3500,
  450, 45,
  '50 KG Bag', 'KG', 'Green Soil',
  'Total Nitrogen (N): 20%, Total Phosphorus (P₂O₅): 22%',
  'PUBLISHED', true,
  '["Dual nutrient — Nitrogen 20% and Phosphorus 22%","Ideal for basal application at sowing","Promotes rapid crop establishment","Improves root development and energy use","Recommended for wheat, rice, cotton, maize","Consistent granule quality for uniform spreading"]'::jsonb,
  '{"Total Nitrogen (N)": "20%", "Total Phosphorus (P₂O₅)": "22%", "Net Weight": "50 KG", "Type": "Nitrophos"}'::jsonb
);

-- ─────────────────────────────────────────────────────────────
-- 3. Attach product images
-- ─────────────────────────────────────────────────────────────
insert into product_images (product_id, url, alt_text, sort_order, is_primary)
values
  ((select id from products where sku = 'GS-CAN-50'),  '/images/products/image1.jpg', 'Green Calcium Nitrate 50KG Bag',           0, true),
  ((select id from products where sku = 'GS-SUL-20L'), '/images/products/image2.jpg', 'Sultan Soil Conditioner 20 Litre Can',      0, true),
  ((select id from products where sku = 'GS-SUL-4L'),  '/images/products/image3.jpg', 'Sultan Potassium Humic Acid 4 Litre Can',   0, true),
  ((select id from products where sku = 'GS-BOP-50'),  '/images/products/image4.jpg', 'Green BOP Bio Organic Phosphate 50KG Bag',  0, true),
  ((select id from products where sku = 'GS-SSP-50'),  '/images/products/image5.jpg', 'Green SSP Single Super Phosphate 50KG Bag', 0, true),
  ((select id from products where sku = 'GS-ZCU-50'),  '/images/products/image6.jpg', 'Super Power Zinc Coated Urea 50KG Bag',     0, true),
  ((select id from products where sku = 'GS-ZSM-3'),   '/images/products/image7.jpg', 'Jasmine 33% Zinc Sulphate 3KG Pack',        0, true),
  ((select id from products where sku = 'GS-NP-50'),   '/images/products/image8.jpg', 'Green NP Nitrophos 50KG Bag',               0, true);

-- ─────────────────────────────────────────────────────────────
-- Verify
-- ─────────────────────────────────────────────────────────────
select
  p.name,
  p.sku,
  p.price,
  p.stock_quantity,
  p.status,
  p.featured,
  c.name as category,
  i.url  as image_url
from products p
left join product_categories c on c.id = p.category_id
left join product_images i on i.product_id = p.id and i.is_primary = true
where p.sku in (
  'GS-CAN-50','GS-SUL-20L','GS-SUL-4L',
  'GS-BOP-50','GS-SSP-50','GS-ZCU-50',
  'GS-ZSM-3','GS-NP-50'
)
order by p.name;
