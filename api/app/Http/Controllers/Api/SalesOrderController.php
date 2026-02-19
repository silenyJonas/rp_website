<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{SalesOrder, SalesLead, BusinessLog};
use App\Http\Resources\SalesOrderResource;
use App\Http\Requests\SalesOrder\{StoreSalesOrderRequest, UpdateSalesOrderRequest};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\{Log, Storage};

class SalesOrderController extends Controller
{
    /**
     * Seznam realizací (objednávek).
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = SalesOrder::query()->with('lead');
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Fulltextové vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('client_name', 'like', "%$s%")
                ->orWhere('salesman_name', 'like', "%$s%")
                ->orWhere('ico', 'like', "%$s%")
                ->orWhere('client_email', 'like', "%$s%"));
        }

        // Filtry na přesnou shodu
        foreach (['id', 'lead_id', 'ico'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }
        
        // Filtry na částečnou shodu
        foreach (['client_name', 'salesman_name', 'client_email'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }

        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);

        // Řazení
        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);

        // Logování exportu
        if ($noPagination) {
            $this->logAction($request, 'export', 'SalesOrder', "Hromadný export realizací.");
            $data = $query->get();
            return SalesOrderResource::collection($data);
        }

        $data = $query->paginate($perPage);

        return response()->json([
            'data'         => SalesOrderResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    public function store(StoreSalesOrderRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // 1. Zpracování přílohy
            if ($request->hasFile('attachment')) {
                $validated['attachment_path'] = $request->file('attachment')->store('orders', 'public');
            }

            // 2. Automatické přiřazení obchodníka z Leadu
            if (!empty($validated['lead_id'])) {
                $lead = SalesLead::find($validated['lead_id']);
                if ($lead) {
                    $validated['salesman_name'] = $lead->salesman_name;
                    $lead->update(['status' => 'Poptávkový formulář odeslán']);
                }
            }

            // 3. Fallback
            if (empty($validated['salesman_name'])) {
                $validated['salesman_name'] = 'Webová poptávka (bez leadu)';
            }

            $order = SalesOrder::create($validated);
            
            $this->logAction($request, 'create', 'SalesOrder', "Vytvořena realizace pro: {$order->client_name}", $order->id);
            
            return response()->json(new SalesOrderResource($order->load('lead')), 201);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'SalesOrder', "Chyba při vytváření realizace: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření realizace selhalo.'], 500);
        }
    }

    /**
     * Detail realizace.
     */
    public function show(SalesOrder $salesOrder): JsonResponse
    {
        return response()->json(new SalesOrderResource($salesOrder->load('lead')));
    }

    /**
     * Aktualizace realizace.
     */
    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder): JsonResponse
    {
        try {
            $validated = $request->validated();

            if ($request->hasFile('attachment')) {
                if ($salesOrder->attachment_path) {
                    Storage::disk('public')->delete($salesOrder->attachment_path);
                }
                $validated['attachment_path'] = $request->file('attachment')->store('orders', 'public');
            }

            $salesOrder->update($validated);
            
            $this->logAction($request, 'update', 'SalesOrder', "Aktualizace realizace ID: {$salesOrder->id}", $salesOrder->id);
            
            return response()->json(new SalesOrderResource($salesOrder->load('lead')));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'SalesOrder', "Chyba při aktualizaci realizace ID {$salesOrder->id}: " . $e->getMessage(), $salesOrder->id);
            return response()->json(['message' => 'Aktualizace realizace selhala.'], 500);
        }
    }

    /**
     * Smazání (Soft i Hard delete).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $item = SalesOrder::withTrashed()->findOrFail($id);
            
            if ($forceDelete) {
                if ($item->attachment_path) {
                    Storage::disk('public')->delete($item->attachment_path);
                }
                $item->forceDelete();
            } else {
                $item->delete();
            }

            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'SalesOrder', "Smazání realizace ID: $id", $id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'SalesOrder', "Chyba při mazání realizace ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání realizace selhalo.'], 500);
        }
    }

    /**
     * Obnova smazaného záznamu.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $item = SalesOrder::withTrashed()->findOrFail($id);
            $item->restore();
            
            $this->logAction($request, 'restore', 'SalesOrder', "Obnova realizace ID: $id", $id);
            
            return response()->json(new SalesOrderResource($item->load('lead')));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'SalesOrder', "Chyba při obnově realizace ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova realizace selhala.'], 500);
        }
    }

    /**
     * Hromadné smazání koše.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $trashedOrders = SalesOrder::onlyTrashed()->get();
            $count = $trashedOrders->count();

            foreach ($trashedOrders as $order) {
                if ($order->attachment_path) {
                    Storage::disk('public')->delete($order->attachment_path);
                }
                $order->forceDelete();
            }

            $this->logAction($request, 'force_delete_all', 'SalesOrder', "Hromadné smazání koše realizací. Počet: $count");
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'SalesOrder', "Chyba při vysypávání koše realizací: " . $e->getMessage());
            return response()->json(['message' => 'Vysypání koše selhalo.'], 500);
        }
    }

    /**
     * Sjednocené logování do BusinessLog.
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            // Použití sanctum guard pro identifikaci uživatele i mimo middleware
            $user = $request->user() ?? auth('sanctum')->user();

            BusinessLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'SalesOrder',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->except(['attachment']), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user ? $user->user_email : 'system/public'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SalesOrder): " . $e->getMessage());
        }
    }
}