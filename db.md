# 🛍️ Komplexní E-Shop Databáze - Dokumentace

## 📊 Přehled Nových Tabulek SHOP Modulu

Celkem **12 tabulek** v shop_ části:

```
CORE SYSTEM (beze změn)
├── core_roles
├── core_permissions
├── core_role_permissions
└── user_roles

WEB MODULE (beze změn)
├── web_logs, web_system_logs, web_news
├── web_support_tickets, web_job_applications
└── web_sales_leads, web_sales_orders, web_raw_request_commissions

SHOP MODULE (KOMPLEXNÍ - 12 tabulek)
├── 📝 shop_logs (logy e-shopu)
├── 🏭 shop_suppliers (dodavatelé)
├── 📂 shop_categories (kategorie produktů)
├── 📦 shop_products (produkty s cenou a skladem)
├── 🎨 shop_product_variants (velikosti, barvy, atd.)
├── 🖼️ shop_product_images (obrázky produktů)
├── 💳 shop_payment_methods (způsoby platby)
├── 🚚 shop_shipping_methods (dopravci a způsoby dopravy)
├── 🎟️ shop_coupons (slevové kupony)
├── 👥 shop_customers (zákazníci)
├── 📋 shop_orders (objednávky)
├── 📦 shop_order_items (položky v objednávce)
└── ⭐ shop_reviews (recenze produktů)
```

---

## 📝 Detailní Popis Tabulek

### 🏭 shop_suppliers (Dodavatelé)

Informace o dodavatelích produktů.

```sql
id (PK)
name (VARCHAR 200) - Název dodavatele
ico (VARCHAR 20, UNIQUE) - IČO firmy
contact_person (VARCHAR 150) - Kontaktní osoba
email, phone - Kontakt
address, city, postal_code, country - Adresa
payment_terms (VARCHAR 100) - Podmínky platby (např. "NET 30")
is_active (BOOLEAN) - Je aktivní?
notes (TEXT) - Interní poznámky
created_at, updated_at, deleted_at
```

**Příklad dat:**
```
- Alibaba Import, IČO: CZ12345678, kontakt@alibaba.cz, NET 60
- Česká Textilní, IČO: CZ87654321, obchod@ceska-textilni.cz, NET 30
```

---

### 📦 shop_products (Produkty - Rozšířeno)

```sql
id (PK)
category_id (FK → shop_categories)
supplier_id (FK → shop_suppliers) ← NOVÉ! Který dodavatel
name (VARCHAR 200)
slug (VARCHAR 200, UNIQUE) - Pro URL (seo-friendly)
description (TEXT) - Dlouhý popis
short_description (VARCHAR 500) - Krátký popis
price (DECIMAL 10,2) - Prodejní cena
cost_price (DECIMAL 10,2) ← NOVÉ! Nákupní cena pro marži
sku (VARCHAR 50, UNIQUE) - Skladový kód
stock_quantity (INT) - Aktuální počet na skladě
stock_warning_level (INT) ← NOVÉ! Upozornění pod tuto hodnotu
is_active, is_featured
created_at, updated_at, deleted_at
```

**Příklad:**
```
- ID: 1
- Název: "Bavlněné tričko"
- Kategorie: Trika
- Dodavatel: Česká Textilní
- Cena: 299.00 CZK
- Nákupní cena: 120.00 CZK (marže: 60%)
- SKU: TRICKO-BLK-2024
- Sklad: 42 ks
- Upozornění: 10 ks
```

---

### 🎨 shop_product_variants (Varianty Produktu - NOVÉ!)

Umožňuje mít jednu položku v různých variantách (barva, velikost atd.)

```sql
id (PK)
product_id (FK → shop_products) - Který produkt
variant_name (VARCHAR 100) - Popis varianty (např. "Černá - Velikost M")
attribute_1_name (VARCHAR 50) - Např. "Barva"
attribute_1_value (VARCHAR 100) - Např. "Černá"
attribute_2_name (VARCHAR 50) - Např. "Velikost"
attribute_2_value (VARCHAR 100) - Např. "M"
sku_variant (VARCHAR 50, UNIQUE) - Specifický SKU pro variantu
price_modifier (DECIMAL 8,2) - Přídavná cena (např. +50 za L)
stock_quantity (INT) - Sklad konkrétní varianty
created_at, updated_at, deleted_at
```

**Příklad - Tričko má varianty:**
```
Produkt: "Bavlněné tričko" (ID: 1)

Varianta 1: "Černá - M"
  - attribute_1: Barva = Černá
  - attribute_2: Velikost = M
  - SKU: TRICKO-BLK-M
  - Price Modifier: 0.00
  - Stock: 15 ks

Varianta 2: "Červené - L"
  - attribute_1: Barva = Červená
  - attribute_2: Velikost = L
  - SKU: TRICKO-RED-L
  - Price Modifier: +50.00
  - Stock: 8 ks
```

---

### 🖼️ shop_product_images (Obrázky Produktů)

Každý produkt může mít více obrázků.

```sql
id (PK)
product_id (FK → shop_products)
image_path (VARCHAR 255) - Cesta k souboru
alt_text (VARCHAR 200) - Alt text pro SEO
is_primary (BOOLEAN) - Hlavní obrázek? (zobrazuje se první)
sort_order (INT) - Pořadí obrázků
created_at, deleted_at
```

**Příklad:**
```
Produkt: "Bavlněné tričko" (ID: 1)

Obrázek 1: /images/tricko-main.jpg (is_primary = TRUE, sort_order = 1)
Obrázek 2: /images/tricko-detail-seam.jpg (sort_order = 2)
Obrázek 3: /images/tricko-size-chart.jpg (sort_order = 3)
Obrázek 4: /images/tricko-reviews.jpg (sort_order = 4)
```

---

### 💳 shop_payment_methods (Způsoby Platby)

Předvolené způsoby platby (lze přidávat další).

```sql
id (PK)
code (VARCHAR 50, UNIQUE) - credit_card, bank_transfer, paypal, cash_on_delivery
name (VARCHAR 100) - "Kreditní karta"
description (TEXT)
is_active (BOOLEAN)
sort_order (INT)
created_at, updated_at
```

**Iniciální data:**
```
1. credit_card - Kreditní karta (aktivní)
2. bank_transfer - Bankovní převod (aktivní)
3. paypal - PayPal (aktivní)
4. cash_on_delivery - Platba při převzetí (aktivní)
```

---

### 🚚 shop_shipping_methods (Dopravci/Způsoby Dopravy)

```sql
id (PK)
code (VARCHAR 50, UNIQUE) - standard, express, dhl, pickup
name (VARCHAR 100) - Lidský název
description (TEXT)
base_price (DECIMAL 8,2) - Základní cena dopravy
free_shipping_threshold (DECIMAL 10,2) - Zdarma nad tuto částku
delivery_days_min, delivery_days_max (INT) - Doby doručení
is_active, sort_order
created_at, updated_at
```

**Iniciální data:**
```
1. standard - Standardní doprava
   - Cena: 100 CZK
   - Doručení: 3-5 dní
   - Zdarma nad: NULL (vždy za poplatek)

2. express - Expresní doprava
   - Cena: 250 CZK
   - Doručení: 1-2 dny
   - Zdarma nad: NULL

3. dhl - DHL kurýr
   - Cena: 300 CZK
   - Doručení: 1 den
   - Zdarma nad: NULL

4. pickup - Vyzvednutí na pobočce
   - Cena: 0 CZK (zdarma)
   - Doručení: 1-3 dny
   - Zdarma nad: N/A
```

---

### 🎟️ shop_coupons (Slevové Kupony)

```sql
id (PK)
code (VARCHAR 50, UNIQUE) - "SLEVA50", "OSLAVY2024"
description (VARCHAR 255)
discount_type (VARCHAR 20) - "percent" nebo "fixed"
discount_value (DECIMAL 10,2) - 50 (pro 50%) nebo 200 (za 200 CZK)
max_usage (INT) - Kolikrát lze koupon použít (NULL = neomezeno)
usage_count (INT) - Kolikrát byl již použit
min_order_amount (DECIMAL 10,2) - Minimální objednávka na koupon
applies_to (VARCHAR 50) - "all", "products", "categories"
valid_from, valid_until (DATETIME) - Doba platnosti
is_active (BOOLEAN)
created_at, updated_at, deleted_at
```

**Příklady:**
```
1. SLEVA50 - 50% sleva na vše
   - Type: percent
   - Value: 50
   - Max Usage: 100
   - Min Order: 500 CZK
   - Valid: 2026-03-22 až 2026-12-31

2. POŠTOVNÉ - Zdarma poštovné (200 CZK)
   - Type: fixed
   - Value: 200
   - Max Usage: NULL (neomezeno)
   - Min Order: 1000 CZK
   - Valid: ihned

3. BLACKFRIDAY - 30% na vybrané
   - Type: percent
   - Value: 30
   - Applies To: categories (určité kategorie)
   - Valid: Black Friday period
```

---

### 👥 shop_customers (Zákazníci)

```sql
id (PK)
user_id (FK → users, nullable) - Pokud má v systému účet
email (VARCHAR 150, UNIQUE)
first_name, last_name
phone (VARCHAR 20)
company (VARCHAR 150)
address (VARCHAR 255)
city, postal_code, country
is_active (BOOLEAN)
total_spent (DECIMAL 12,2) ← NOVÉ! Kolik celkem utratil
notes (TEXT)
created_at, updated_at, deleted_at
```

---

### 📋 shop_orders (Objednávky - Rozšířeno)

```sql
id (PK)
customer_id (FK → shop_customers)
order_number (VARCHAR 50, UNIQUE) - "ORD-2026-001234"
status (VARCHAR 50) - pending, paid, processing, shipped, delivered, cancelled
total_amount (DECIMAL 10,2) - Finální cena
shipping_amount (DECIMAL 10,2)
tax_amount (DECIMAL 10,2)
discount_amount (DECIMAL 10,2)
coupon_id (FK → shop_coupons) ← NOVÉ! Který koupon byl použit
payment_method_id (FK → shop_payment_methods) ← NOVÉ! Jak zaplatil
shipping_method_id (FK → shop_shipping_methods) ← NOVÉ! Jak bude doručeno
shipping_address, shipping_city, postal_code, country
notes (TEXT)
paid_at (DATETIME) ← NOVÉ! Kdy byla objednávka zaplacena
shipped_at (DATETIME) ← NOVÉ! Kdy byla odeslána
created_at, updated_at, deleted_at
```

**Příklad:**
```
Objednávka #1:
- Order Number: ORD-2026-001001
- Zákazník: Jan Novák
- Koupon: SLEVA50 (50% sleva = -500 CZK)
- Doprava: Express DHL (250 CZK)
- Platba: Kreditní karta
- Status: shipped
- Ceny:
  - Produkty: 1000 CZK
  - Sleva: -500 CZK
  - Daň: 100 CZK
  - Doprava: 250 CZK
  - CELKEM: 850 CZK
- Zaplaceno: 2026-03-22 14:30:00
- Odesláno: 2026-03-23 09:15:00
```

---

### 📦 shop_order_items (Položky Objednávky)

```sql
id (PK)
order_id (FK → shop_orders)
product_id (FK → shop_products)
product_variant_id (FK → shop_product_variants, nullable) ← NOVÉ! Která varianta
product_name (VARCHAR 200) - Kopie názvu v čase nákupu
quantity (INT)
price (DECIMAL 10,2) - Cena za kus v čase nákupu
discount_amount (DECIMAL 10,2)
created_at, updated_at
```

**Příklad objednávky ORD-2026-001001:**
```
Položka 1:
- Produkt: "Bavlněné tričko"
- Varianta: "Černá - M"
- Množství: 2
- Cena za kus: 500 CZK
- Sleva na položku: 0 CZK
- Subtotal: 1000 CZK
```

---

### ⭐ shop_reviews (Recenze)

```sql
id (PK)
product_id (FK → shop_products)
customer_id (FK → shop_customers, nullable)
rating (TINYINT) - 1 až 5
title (VARCHAR 100)
content (TEXT)
is_approved (BOOLEAN) - Musí projít moderací?
created_at, updated_at, deleted_at
```

---

## 🔗 Foreign Key Vztahy - SHOP Modul

```
shop_suppliers (dodavatelé)
    └─ shop_products.supplier_id

shop_categories
    ├─ shop_categories.parent_id (self-referencing - podkategorie)
    └─ shop_products.category_id

shop_products
    ├─ shop_product_variants.product_id
    ├─ shop_product_images.product_id
    ├─ shop_order_items.product_id
    └─ shop_reviews.product_id

shop_product_variants
    └─ shop_order_items.product_variant_id (nullable)

shop_payment_methods
    └─ shop_orders.payment_method_id

shop_shipping_methods
    └─ shop_orders.shipping_method_id

shop_coupons
    └─ shop_orders.coupon_id

shop_customers
    ├─ users.id (nullable - linked users)
    ├─ shop_orders.customer_id
    └─ shop_reviews.customer_id

shop_orders
    └─ shop_order_items.order_id
```

---

## 💡 Praktické Příklady Dotazů

### Objednávka s veškerými detaily
```sql
SELECT 
    o.order_number,
    c.first_name, c.last_name, c.email,
    pm.name as payment_method,
    sm.name as shipping_method,
    GROUP_CONCAT(p.name, ' (', oi.quantity, 'x)') as products,
    o.total_amount,
    o.status,
    o.created_at
FROM shop_orders o
    JOIN shop_customers c ON o.customer_id = c.id
    LEFT JOIN shop_payment_methods pm ON o.payment_method_id = pm.id
    LEFT JOIN shop_shipping_methods sm ON o.shipping_method_id = sm.id
    LEFT JOIN shop_order_items oi ON o.id = oi.order_id
    LEFT JOIN shop_products p ON oi.product_id = p.id
WHERE o.id = 1
GROUP BY o.id;
```

### Sklad produktů s variantami
```sql
SELECT 
    p.name,
    pv.variant_name,
    pv.attribute_1_value,
    pv.attribute_2_value,
    pv.stock_quantity,
    s.name as supplier
FROM shop_products p
    LEFT JOIN shop_product_variants pv ON p.id = pv.product_id
    LEFT JOIN shop_suppliers s ON p.supplier_id = s.id
WHERE p.id = 1
ORDER BY pv.sort_order;
```

### Nejprodávanější produkty
```sql
SELECT 
    p.name,
    COUNT(oi.id) as purchase_count,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.price * oi.quantity) as revenue
FROM shop_products p
    JOIN shop_order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY revenue DESC
LIMIT 10;
```

---

## 📊 Statistiky Databáze

| Kategorie | Tabulky | Popis |
|-----------|---------|-------|
| Laravel Core | 7 | Standardní Laravel tabulky |
| Core System | 4 | Permissions, Roles, mapování |
| Web Module | 8 | Původní web funkcionalita (beze změn) |
| **Shop Module** | **12** | **Komplexní e-shop systém** |
| **CELKEM** | **31** | Kompletní systém web + e-shop |

---

## 🎯 Klíčové Vlastnosti

✅ **Varianty produktů** - Barvy, velikosti, atd. s vlastním skladem a SKU  
✅ **Více obrázků na produkt** - Hlavní + vedlejší, seřazené  
✅ **Dodavatelé** - Sledování, kdo dodává co  
✅ **Flexibilní platby** - Snadno lze přidávat nové způsoby  
✅ **Realistické dopravy** - Ceny, doby doručení, zdarma nad limit  
✅ **Kupony/Slevy** - Procenta i fixní částky, podmínky  
✅ **Detailní objednávky** - Historie cen, variant, kupů  
✅ **Recenze** - S moderací  
✅ **Zákaznické údaje** - Celková utratená částka  
✅ **Logy** - Vše se zaznamenává v shop_logs  

---

## 🚀 Jak Začít

```bash
# 1. Stáhni SQL soubor: rp_website_eshop_komplexni.sql
# 2. Importuj do MySQL:
mysql -u root -p rp_website < rp_website_eshop_komplexni.sql

# 3. Ověř tabulky:
USE rp_website;
SHOW TABLES LIKE 'shop_%';

# 4. Zkontroluj počet tabulek:
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'rp_website';
# Mělo by být 31 tabulek
```

---

**Vytvořeno: 22. března 2026**  
**Verze: 2.0 - E-Shop Komplexní**
