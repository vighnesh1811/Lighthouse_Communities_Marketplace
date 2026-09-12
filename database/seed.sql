USE lighthouse_marketplace;

-- Development login: admin@lighthouse.local / ChangeMe123!
-- Replace this hash before using the project outside local development.
INSERT INTO admins (name, email, password_hash) VALUES
  ('Marketplace Admin', 'admin@lighthouse.local', '$2b$10$GzbQLe1GK6Ejw2IBUA.LcOkBOfW75r.SG9UHVkSgVHbvhns/DMcIa')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (name, slug, description) VALUES
  ('Textiles', 'textiles', 'Thoughtful textile pieces'),
  ('Handmade', 'handmade', 'Products made slowly and with care'),
  ('Home accents', 'home-accents', 'Small details with a story');

INSERT INTO products (name, slug, description, price, category_id, stock_quantity, learner_program)
SELECT 'Embroidered Everyday Tote', 'embroidered-everyday-tote', 'Demo product for local development.', 499.00, id, 8, 'Demo product'
FROM categories WHERE slug = 'textiles';

INSERT INTO products (name, slug, description, price, category_id, stock_quantity, learner_program)
SELECT 'Handwoven Market Basket', 'handwoven-market-basket', 'Demo product for local development.', 399.00, id, 6, 'Demo product'
FROM categories WHERE slug = 'handmade';

INSERT INTO products (name, slug, description, price, category_id, stock_quantity, learner_program)
SELECT 'Decorative Threadwork', 'decorative-threadwork', 'Demo product for local development.', 349.00, id, 4, 'Demo product'
FROM categories WHERE slug = 'home-accents';

INSERT INTO settings (setting_key, setting_value) VALUES
  ('payment_qr_image', '/uploads/payment/official-ngo-qr.png'),
  ('website_name', 'Lighthouse Communities Marketplace');
