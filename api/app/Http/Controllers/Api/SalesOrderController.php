<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use App\Models\SalesLead; // Import modelu pro dohledání obchodníka
use App\Models\BusinessLog;
use App\Http\Resources\SalesOrderResource;
use App\Http\Requests\StoreSalesOrderRequest;
use App\Http\Requests\UpdateSalesOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SalesOrderController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = SalesOrder::query()->with('lead');
        if ($onlyTrashed) $query->onlyTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('client_name', 'like', "%$s%")
                ->orWhere('salesman_name', 'like', "%$s%")
                ->orWhere('ico', 'like', "%$s%")
                ->orWhere('client_email', 'like', "%$s%"));
        }

        foreach (['id', 'lead_id', 'ico'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }
        
        foreach (['client_name', 'salesman_name', 'client_email'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }

        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);

        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $data = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->get() 
            : $query->paginate($perPage);

        if (filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN)) {
            return SalesOrderResource::collection($data);
        }

        return response()->json([
            'data'         => SalesOrderResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
        ]);
    }

    /**
     * Veřejné uložení z formuláře
     */
    public function store(StoreSalesOrderRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        // Automatické dohledání obchodníka z původního Leadu
        $lead = SalesLead::find($validatedData['lead_id']);
        $validatedData['salesman_name'] = $lead ? $lead->salesman_name : 'Neznámý obchodník';

        $order = SalesOrder::create($validatedData);

        $this->logAction($request, 'create', 'SalesOrder', "Vytvořena realizace (veřejný formulář) pro: {$order->client_name}", $order->id);
        
        return response()->json(new SalesOrderResource($order), 201);
    }

    /**
     * Zobrazení detailů (nasazeno na routu /details i standardní show)
     */
    public function show(SalesOrder $salesOrder): JsonResponse
    {
        // Načteme i vazbu na lead, abychom v detailech viděli vše
        return response()->json(new SalesOrderResource($salesOrder->load('lead')));
    }

    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder): JsonResponse
    {
        $salesOrder->update($request->validated());
        $this->logAction($request, 'update', 'SalesOrder', "Aktualizace realizace ID: {$salesOrder->id}", $salesOrder->id);
        return response()->json(new SalesOrderResource($salesOrder));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = SalesOrder::withTrashed()->findOrFail($id);
        
        $forceDelete ? $item->forceDelete() : $item->delete();
        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'SalesOrder', "Smazání realizace ID: $id", $id);

        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $item = SalesOrder::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'SalesOrder', "Obnova realizace ID: $id", $id);
        return response()->json(new SalesOrderResource($item));
    }

    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = SalesOrder::onlyTrashed()->count();
        SalesOrder::onlyTrashed()->forceDelete();
        $this->logAction($request, 'force_delete_all', 'SalesOrder', "Hromadné smazání koše realizací. Počet: $count");
        return response()->json(null, 204);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user('sanctum') ?? $request->user();

            BusinessLog::create([
                'origin'                 => $request->ip(),
                'event_type'             => $eventType,
                'module'                 => $module,
                'description'            => $description,
                'affected_entity_type'   => $module,
                'affected_entity_id'     => $affectedId,
                'user_login_id'          => $user?->user_login_id,
                'context_data'           => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain'    => (string)($user?->user_login_id ?? '0'),
                'user_login_email_plain' => $user ? $user->user_email : 'Veřejný web (Anonym)'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SalesOrder): " . $e->getMessage());
        }
    }
}