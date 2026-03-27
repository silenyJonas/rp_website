<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopLogResource;
use App\Http\Requests\Shop\StoreShopLogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class ShopLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);

        $table = (new ShopLog())->getTable();

        $query = ShopLog::query()->select("$table.*")->with('user');

        // --- FILTRACE ---
        if ($request->filled('id')) {
            $query->where("$table.id", $request->id);
        }
        
        if ($request->filled('created_at')) {
            $query->whereDate("$table.created_at", $request->input('created_at'));
        }

        if ($request->filled('event_type')) {
            $query->where("$table.event_type", $request->event_type);
        }

        if ($request->filled('module')) {
            $query->where("$table.module", $request->module);
        }

        $textFields = ['origin', 'description', 'affected_entity_type', 'user_id_plain', 'user_plain'];
        foreach ($textFields as $field) {
            if ($request->filled($field)) {
                $query->where("$table.$field", 'like', '%' . $request->input($field) . '%');
            }
        }

        // --- ŘAZENÍ (SORTING) ---
        // 🔧 Defaultně řadíme podle ID, od největšího po nejmenší (DESC)
        $sortBy = $request->input('sort_by', 'id'); 
        $sortDirection = (strtolower($request->input('sort_direction')) === 'asc') ? 'asc' : 'desc';

        if ($sortBy === 'user_email' || $sortBy === 'user.user_email') {
            $query->join('users', "$table.user_id", '=', 'users.id')
                  ->orderBy('users.user_email', $sortDirection);
        } else {
            $sortColumn = str_contains($sortBy, '.') ? $sortBy : "$table.$sortBy";
            $query->orderBy($sortColumn, $sortDirection);
        }

        // --- EXEKUCE A PAGINACE ---
        if ($noPagination) {
            $logs = $query->get();
            return response()->json(ShopLogResource::collection($logs));
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'data'         => ShopLogResource::collection($logs->items()),
            'total'        => $logs->total(),
            'per_page'     => $logs->perPage(),
            'current_page' => $logs->currentPage(),
            'last_page'    => $logs->lastPage(),
        ]);
    }

    public function show($id): JsonResponse
    {
        $log = ShopLog::with('user')->findOrFail($id);
        return response()->json(new ShopLogResource($log));
    }

    public function store(StoreShopLogRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $logData = array_merge($request->validated(), [
                'user_id' => $user?->id,
                'created_at' => now(), 
            ]);

            if ($user) {
                $logData['user_id_plain'] = (string)$user->id;
                $logData['user_plain'] = $user->full_name ?? $user->user_email; 
            }

            $log = ShopLog::create($logData);
            return response()->json(new ShopLogResource($log), 201);
        } catch (\Exception $e) {
            Log::error('Chyba při vytváření shop logu: ' . $e->getMessage());
            return response()->json(['message' => 'Chyba serveru'], 500);
        }
    }
}