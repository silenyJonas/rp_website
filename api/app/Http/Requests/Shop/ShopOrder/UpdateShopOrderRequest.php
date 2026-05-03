<?php

namespace App\Http\Requests\Shop\ShopOrder;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'customer_id' => 'sometimes|exists:shop_customers,id',
            'payment_method_id' => 'sometimes|exists:shop_payment_methods,id',
            'shipping_method_id' => 'sometimes|exists:shop_shipping_methods,id',
            'coupon_id' => 'nullable|exists:shop_coupons,id',
            'status' => 'sometimes|in:pending,confirmed,processing,shipped,delivered,returned,canceled',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded,cod',
            'shipping_address' => 'sometimes|string|max:255',
            'shipping_city' => 'sometimes|string|max:100',
            'shipping_postal_code' => 'sometimes|string|max:10',
            'shipping_country' => 'sometimes|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:shop_products,id',
            'items.*.product_variant_id' => 'nullable|exists:shop_product_variants,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'delete_items' => 'nullable|array',
            'delete_items.*' => 'integer|exists:shop_order_items,id',
            'paid_at' => 'nullable|date',
            'shipped_at' => 'nullable|date',
            'delivered_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'items.min' => 'Objednávka musí obsahovat alespoň jednu položku.',
            'items.*.quantity.min' => 'Počet kusů musí být alespoň 1.',
        ];
    }
}