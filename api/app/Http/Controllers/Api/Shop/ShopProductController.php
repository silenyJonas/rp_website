<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductImage;
use App\Models\Shop\ShopProductVariant;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopProductResource;
use App\Http\Requests\Shop\ShopProduct\StoreShopProductRequest;
use App\Http\Requests\Shop\ShopProduct\UpdateShopProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ShopProductController extends Controller
{
    /**
     * Seznam produktů s filtrováním
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = ShopProduct::with([
            'category',
            'supplier',
            'primaryImage',
            'variants' => function ($q) {
                $q->with('images');
            }
        ]);
        
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('slug', 'like', "%$s%")
                ->orWhere('sku', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        if ($request->filled('price_from')) {
            $query->where('price', '>=', $request->input('price_from'));
        }
        if ($request->filled('price_to')) {
            $query->where('price', '<=', $request->input('price_to'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return response()->json(ShopProductResource::collection($data));
        }

        return response()->json([
            'data'         => ShopProductResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nového produktu
     */
    public function store(StoreShopProductRequest $request): JsonResponse
    {
        Log::info("ShopProduct Store started", ['payload' => $request->all(), 'files' => $request->allFiles()]);
        try {
            $validated = $request->validated();
            $product = ShopProduct::create($validated);
            Log::info("Product created", ['id' => $product->id]);

            if ($request->has('images')) {
                Log::info("Found images in request", ['count' => count($request->input('images', []))]);
                $this->storeImages($product, $request->input('images', []), $request, 'images');
            }

            if ($request->has('variants')) {
                Log::info("Found variants in request", ['count' => count($request->input('variants', []))]);
                $this->storeVariants($product, $request->input('variants', []), $request);
                $this->syncProductStock($product);
            }

            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants' => fn($q) => $q->with('images')]);
            $this->logAction($request, 'create', 'ShopProduct', "Vytvořen produkt: {$product->name}", $product->id);

            return response()->json(new ShopProductResource($product), 201);
        } catch (\Exception $e) {
            Log::error("ShopProduct creation error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Vytvoření produktu selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Detail produktu
     */
    public function show($id): JsonResponse
    {
        $product = ShopProduct::with([
            'category',
            'supplier',
            'images',
            'variants' => fn($q) => $q->with('images')
        ])->findOrFail($id);

        return response()->json(new ShopProductResource($product));
    }

    /**
     * Aktualizace produktu
     */
    public function update(UpdateShopProductRequest $request, $id): JsonResponse
    {
        Log::info("ShopProduct Update started", ['id' => $id, 'payload' => $request->all(), 'files' => $request->allFiles()]);
        try {
            $product = ShopProduct::findOrFail($id);
            $validated = $request->validated();

            $updateData = collect($validated)
                ->except(['images', 'variants', 'delete_images', 'delete_variants'])
                ->toArray();

            $product->update($updateData);

            // Smazání obrázků produktu
            if ($request->has('delete_images')) {
                Log::info("Deleting product images", ['ids' => $request->input('delete_images')]);
                $this->deleteImages($request->input('delete_images'));
            }

            // Uložení nových/update obrázků produktu
            if ($request->has('images')) {
                $this->storeImages($product, $request->input('images', []), $request, 'images');
            }

            // Smazání variant
            if ($request->has('delete_variants')) {
                Log::info("Deleting variants and their images", ['ids' => $request->input('delete_variants')]);
                $this->deleteVariantsWithImages($request->input('delete_variants'));
            }

            // Update/Create variant
            if ($request->has('variants')) {
                Log::info("Updating variants", ['count' => count($request->input('variants', []))]);
                $this->updateVariants($product, $request->input('variants', []), $request);
            }

            $this->syncProductStock($product);
            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants' => fn($q) => $q->with('images')]);
            $this->logAction($request, 'update', 'ShopProduct', "Aktualizace produktu: {$product->name}", $product->id);

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct update error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Aktualizace selhala: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Smazání produktu
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        Log::info("ShopProduct Destroy started", ['id' => $id, 'force_delete' => $request->input('force_delete')]);
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $product = ShopProduct::withTrashed()->findOrFail($id);

            if ($forceDelete) {
                Log::info("Performing hard delete for product", ['id' => $id]);
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                foreach ($product->variants as $variant) {
                    foreach ($variant->images as $image) {
                        Storage::disk('public')->delete('products/' . $image->image_path);
                    }
                }
                $product->forceDelete();
            } else {
                Log::info("Performing soft delete for product", ['id' => $id]);
                $product->delete();
            }

            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'ShopProduct', "Smazání produktu ID: $id", $id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct delete error: " . $e->getMessage());
            return response()->json(['message' => 'Smazání produktu selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obnova z koše
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $product = ShopProduct::withTrashed()->findOrFail($id);
            $product->restore();
            Log::info("Product restored", ['id' => $id]);
            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants' => fn($q) => $q->with('images')]);
            $this->logAction($request, 'restore', 'ShopProduct', "Obnova produktu ID: $id", $id);

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct restore error: " . $e->getMessage());
            return response()->json(['message' => 'Obnova produktu selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        Log::info("ShopProduct force delete all trashed started");
        try {
            $trashedProducts = ShopProduct::onlyTrashed()->with('variants')->get();
            $count = $trashedProducts->count();

            foreach ($trashedProducts as $product) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                foreach ($product->variants as $variant) {
                    foreach ($variant->images as $image) {
                        Storage::disk('public')->delete('products/' . $image->image_path);
                    }
                }
                $product->forceDelete();
            }
            Log::info("Trashed products emptied", ['deleted_count' => $count]);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct force delete all error: " . $e->getMessage());
            return response()->json(['message' => 'Vyprázdnění koše selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ========== HELPERS ==========
     */

    /**
     * Uložení obrázků - podporuje jak hlavní obrázky, tak obrázky variant
     */
    private function storeImages(ShopProduct $product, array $images, Request $request, string $prefix = 'images'): void
    {
        foreach ($images as $index => $imageData) {
            // Přeskakujeme obrázky, které již existují a nemají nový soubor
            if (!empty($imageData['id']) && !$request->hasFile("{$prefix}.{$index}.file")) {
                Log::info("Skipping existing image without new file", ['image_id' => $imageData['id']]);
                continue;
            }

            // Pokud je to existující obrázek bez souboru, aktualizujeme metadata
            if (!empty($imageData['id']) && !$request->hasFile("{$prefix}.{$index}.file")) {
                ShopProductImage::find($imageData['id'])?->update([
                    'alt_text' => $imageData['alt_text'] ?? '',
                    'sort_order' => $imageData['sort_order'] ?? $index,
                    'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ]);
                continue;
            }

            // Získáme soubor z requestu
            $file = $request->file("{$prefix}.{$index}.file");

            if (!$file) {
                Log::warning("File not found in request for key: {$prefix}.{$index}.file");
                continue;
            }

            if (!$file->isValid()) {
                Log::warning("File at key {$prefix}.{$index}.file is not valid.");
                continue;
            }

            // Uložíme soubor
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('products', $fileName, 'public');
            Log::info("Image stored to disk", ['path' => $path, 'filename' => $fileName]);

            // Pokud je to aktualizace existujícího obrázku, smazeme starý
            if (!empty($imageData['id'])) {
                $oldImage = ShopProductImage::find($imageData['id']);
                if ($oldImage) {
                    Storage::disk('public')->delete('products/' . $oldImage->image_path);
                    $oldImage->update([
                        'image_path' => $fileName,
                        'alt_text' => $imageData['alt_text'] ?? $product->name,
                        'sort_order' => $imageData['sort_order'] ?? $index,
                        'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    ]);
                }
            } else {
                // Nový obrázek
                ShopProductImage::create([
                    'product_id' => $product->id,
                    'variant_id' => $imageData['variant_id'] ?? null,
                    'image_path' => $fileName,
                    'alt_text' => $imageData['alt_text'] ?? $product->name,
                    'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'sort_order' => $imageData['sort_order'] ?? $index,
                ]);
            }

            Log::info("Image record processed", [
                'product_id' => $product->id, 
                'variant_id' => $imageData['variant_id'] ?? null
            ]);
        }
    }

    /**
     * Smazání obrázků
     */
    private function deleteImages(array $imageIds): void
    {
        $images = ShopProductImage::whereIn('id', $imageIds)->get();
        foreach ($images as $image) {
            // Smazání souboru
            if (Storage::disk('public')->exists('products/' . $image->image_path)) {
                Storage::disk('public')->delete('products/' . $image->image_path);
                Log::info("Image file deleted from disk", ['path' => $image->image_path]);
            }
            // Smazání DB záznamu
            $image->delete();
        }
    }

    /**
     * Smazání variant a jejich obrázků
     */
    private function deleteVariantsWithImages(array $variantIds): void
    {
        $variants = ShopProductVariant::whereIn('id', $variantIds)->get();
        
        foreach ($variants as $variant) {
            // Smazání všech obrázků varianty
            $images = ShopProductImage::where('variant_id', $variant->id)->get();
            foreach ($images as $image) {
                if (Storage::disk('public')->exists('products/' . $image->image_path)) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                $image->delete();
            }
            
            // Smazání varianty
            $variant->delete();
        }
    }

    /**
     * Uložení nových variant
     */
    private function storeVariants(ShopProduct $product, array $variants, Request $request = null): void
    {
        foreach ($variants as $idx => $variantData) {
            $variant = ShopProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $variantData['variant_name'],
                'attribute_1_name' => $variantData['attribute_1_name'] ?? null,
                'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                'attribute_2_name' => $variantData['attribute_2_name'] ?? null,
                'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                'sku_variant' => $variantData['sku_variant'] ?? null,
                'price_with_vat' => $variantData['price_with_vat'] ?? 0,
                'price_without_vat' => $variantData['price_without_vat'] ?? 0,
                'vat_rate' => $variantData['vat_rate'] ?? 21,
                'stock_quantity' => $variantData['stock_quantity'] ?? 0,
            ]);

            // Uložení obrázků uvnitř varianty
            if (isset($variantData['images']) && is_array($variantData['images']) && $request) {
                Log::info("Processing images for new variant", ['variant_id' => $variant->id]);
                
                $variantImages = array_map(function($img) use ($variant) {
                    $img['variant_id'] = $variant->id;
                    return $img;
                }, $variantData['images']);

                $this->storeImages($product, $variantImages, $request, "variants.{$idx}.images");
            }
        }
    }

private function updateVariants(ShopProduct $product, array $variants, Request $request): void
{
    foreach ($variants as $idx => $variantData) {
        // EXISTUJÍCÍ VARIANTA (Update)
        if (isset($variantData['id']) && $variantData['id'] > 0) {
            $variant = ShopProductVariant::findOrFail($variantData['id']);
            
            $variant->update([
                'variant_name'      => $variantData['variant_name'],
                'attribute_1_name'  => $variantData['attribute_1_name'] ?? null,
                'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                'attribute_2_name'  => $variantData['attribute_2_name'] ?? null,
                'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                'sku_variant'       => $variantData['sku_variant'] ?? null,
                'price_with_vat'    => $variantData['price_with_vat'] ?? 0,
                'price_without_vat' => $variantData['price_without_vat'] ?? 0,
                'vat_rate'          => $variantData['vat_rate'] ?? 21,
                'stock_quantity'    => $variantData['stock_quantity'] ?? 0,
            ]);

            // ⚠️ NOVÉ: Smazání označených obrázků této konkrétní varianty
            if (isset($variantData['delete_images']) && is_array($variantData['delete_images'])) {
                Log::info("Deleting variant images", [
                    'variant_id' => $variant->id,
                    'image_ids' => $variantData['delete_images']
                ]);
                
                $this->deleteImages($variantData['delete_images']);
            }

            // Zpracování nových nebo upravených obrázků varianty
            if (isset($variantData['images']) && is_array($variantData['images'])) {
                $variantImages = array_map(function($img) use ($variant) {
                    $img['variant_id'] = $variant->id;
                    return $img;
                }, $variantData['images']);

                $this->storeImages($product, $variantImages, $request, "variants.{$idx}.images");
            }
        } 
        // NOVÁ VARIANTA (Create)
        else {
            $this->storeVariants($product, [$variantData], $request);
        }
    }
}
    /**
     * Synchronizace skladových zásob
     */
    private function syncProductStock(ShopProduct $product): void
    {
        $totalStock = ShopProductVariant::where('product_id', $product->id)
            ->whereNull('deleted_at')
            ->sum('stock_quantity');

        $product->update(['stock_quantity' => $totalStock]);
        Log::info("Stock synced", ['product_id' => $product->id, 'total_stock' => $totalStock]);
    }

    /**
     * Logování akcí
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null): void 
    {
        try {
            $user = $request->user() ?? auth('sanctum')->user();
            ShopLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'ShopProduct',
                'affected_entity_id' => $affectedId,
                'user_id' => $user?->id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain' => (string)($user?->id ?? '0'),
                'user_plain' => $user ? ($user->full_name ?? $user->user_email) : 'Systém'
            ]);
        } catch (\Exception $e) {
            Log::error("Log action error: " . $e->getMessage());
        }
    }
}