export interface Variant {
  id?: number;
  variant_name: string;
  attribute_1_name?: string;
  attribute_1_value?: string;
  attribute_2_name?: string;
  attribute_2_value?: string;
  sku_variant?: string;
  currency?: string;
  price_with_vat: number;
  vat_rate: number;
  price_without_vat: number;
  stock_quantity: number;
  images?: ProductImage[];
  _delete?: boolean;
}

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

export interface Product {
  id?: number;
  category_id: number;
  supplier_id?: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  sku: string;
  stock_quantity: number;
  stock_warning_level: number;
  is_active: boolean;
  currency?: string;
  is_featured: boolean;
  images?: ProductImage[];
  variants?: Variant[];
  category?: Category;
  supplier?: Supplier;
  created_at?: string;
  updated_at?: string;
}