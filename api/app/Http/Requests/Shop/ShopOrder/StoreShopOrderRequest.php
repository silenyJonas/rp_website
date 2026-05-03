<?php

namespace App\Http\Requests\Shop\ShopOrder;

use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductVariant;
use Illuminate\Foundation\Http\FormRequest;

class StoreShopOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:shop_customers,id',
            'payment_method_id' => 'required|exists:shop_payment_methods,id',
            'shipping_method_id' => 'required|exists:shop_shipping_methods,id',
            'coupon_id' => 'nullable|exists:shop_coupons,id',
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,returned,canceled',
            'payment_status' => 'required|in:pending,paid,failed,refunded,cod',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:100',
            'shipping_postal_code' => 'required|string|max:10',
            'shipping_country' => 'required|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:shop_products,id',
            'items.*.product_variant_id' => 'nullable|exists:shop_product_variants,id',
            
            // PŘIDANÁ LOGIKA PRO SKLAD
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    // Získání indexu aktuální položky z názvu atributu (např. items.0.quantity)
                    preg_match('/items\.(\d+)\.quantity/', $attribute, $matches);
                    $index = $matches[1];
                    
                    $item = $this->input("items.{$index}");
                    $productId = $item['product_id'];
                    $variantId = $item['product_variant_id'] ?? null;

                    // 1. Priorita: Kontrola varianty
                    if ($variantId) {
                        $variant = ShopProductVariant::find($variantId);
                        if ($variant && $value > $variant->stock_quantity) {
                            $fail("U varianty '{$variant->variant_name}' je na skladě pouze {$variant->stock_quantity} ks.");
                        }
                    } 
                    // 2. Fallback: Kontrola produktu (pokud není vybrána varianta)
                    else {
                        $product = ShopProduct::find($productId);
                        if ($product && $value > $product->stock_quantity) {
                            $fail("U produktu '{$product->name}' je na skladě pouze {$product->stock_quantity} ks.");
                        }
                    }
                }
            ],
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Zákazník je povinný.',
            'customer_id.exists' => 'Vybraný zákazník neexistuje.',
            'items.required' => 'Objednávka musí obsahovat alespoň jednu položku.',
            'items.*.quantity.min' => 'Počet kusů musí být alespoň 1.',
            'items.*.quantity.required' => 'Množství je povinné.',
        ];
    }
}