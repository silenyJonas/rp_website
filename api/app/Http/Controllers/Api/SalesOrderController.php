<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use App\Models\SalesLead;
use App\Models\BusinessLog;
use App\Http\Resources\SalesOrderResource;
use App\Http\Requests\SalesOrder\StoreSalesOrderRequest;
use App\Http\Requests\SalesOrder\UpdateSalesOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
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

    public function store(StoreSalesOrderRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        if ($request->hasFile('attachment')) {
            $validatedData['attachment_path'] = $request->file('attachment')->store('orders', 'public');
        }

        $validatedData['salesman_name'] = 'Neznámý obchodník';
        if (!empty($validatedData['lead_id'])) {
            $lead = SalesLead::find($validatedData['lead_id']);
            if ($lead) {
                $validatedData['salesman_name'] = $lead->salesman_name;
            }
        }

        $order = SalesOrder::create($validatedData);
        $this->logAction($request, 'create', 'SalesOrder', "Vytvořena poptávka pro: {$order->client_name}", $order->id);
        
        return response()->json(new SalesOrderResource($order), 201);
    }

    /**
     * Detail objednávky.
     */
    public function show(SalesOrder $salesOrder): JsonResponse
    {
        return response()->json(new SalesOrderResource($salesOrder->load('lead')));
    }

    /**
     * Aktualizace objednávky.
     */
    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder): JsonResponse
    {
        $salesOrder->update($request->validated());
        $this->logAction($request, 'update', 'SalesOrder', "Aktualizace realizace ID: {$salesOrder->id}", $salesOrder->id);
        return response()->json(new SalesOrderResource($salesOrder));
    }

    /**
     * Smazání (Soft i Hard delete).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
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
    }

    /**
     * Obnova smazaného záznamu.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        $item = SalesOrder::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'SalesOrder', "Obnova realizace ID: $id", $id);
        return response()->json(new SalesOrderResource($item));
    }

    /**
     * Trvalé smazání celého koše včetně souborů.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
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
    }

    /**
     * Pomocná metoda pro logování akcí.
     */
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