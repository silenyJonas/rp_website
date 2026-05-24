

export interface ProductImage {
  [key: string]: any;
  id?: number;
  product_id?: number;
  variant_id?: number;
  image_path: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  file?: File;
  url?: string;
  _delete?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Supplier {
  id: number;
  name: string;
}
export interface Variant {
  id?: number;
  variant_name: string;
  attribute_1_name?: string;
  attribute_1_value?: string;
  attribute_2_name?: string;
  attribute_2_value?: string;
  sku_variant?: string;
  vat_rate: number;
  stock_quantity: number;
  images?: ProductImage[];
  _delete?: boolean;

  // Ceny pro varianty (s DPH i bez) pro všechny měny
  price_with_vat_czk?: number;
  price_without_vat_czk?: number;
  
  price_with_vat_eur?: number;
  price_without_vat_eur?: number;
  
  price_with_vat_usd?: number;
  price_without_vat_usd?: number;
  
  price_with_vat_gbp?: number;
  price_without_vat_gbp?: number;
}

export interface Product {
  id?: number;
  category_id: number;
  supplier_id?: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  stock_quantity: number;
  stock_warning_level: number;
  is_active: boolean;
  is_featured: boolean;
  images?: ProductImage[];
  variants?: Variant[];
  category?: Category;
  supplier?: Supplier;
  created_at?: string;
  updated_at?: string;

  // Prodejní ceny hlavního produktu
  price_czk?: number;
  price_eur?: number;
  price_usd?: number;
  price_gbp?: number;

  // Nákupní ceny hlavního produktu
  cost_price_czk?: number;
  cost_price_eur?: number;
  cost_price_usd?: number;
  cost_price_gbp?: number;
}