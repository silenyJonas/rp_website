<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessLog;
use App\Http\Resources\BusinessLogResource;
use App\Http\Requests\StoreBusinessLogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class BusinessLogController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);

        $query = BusinessLog::query()->with('user');

        // Filtrování
        if ($request->filled('business_log_id')) $query->where('business_log_id', $request->business_log_id);
        
        if ($createdAt = $request->input('created_at')) {
            preg_match('/^\d{4}-\d{2}-\d{2}$/', $createdAt) 
                ? $query->whereDate('created_at', '=', $createdAt) 
                : $query->whereDay('created_at', '=', $createdAt);
        }

        if ($request->filled('origin')) $query->where('origin', 'like', '%' . $request->origin . '%');
        if ($request->filled('event_type')) $query->where('event_type', $request->event_type);
        if ($request->filled('module')) $query->where('module', 'like', '%' . $request->module . '%');
        if ($request->filled('description')) $query->where('description', 'like', '%' . $request->description . '%');
        if ($request->filled('affected_entity_type')) $query->where('affected_entity_type', 'like', '%' . $request->affected_entity_type . '%');
        if ($request->filled('affected_entity_id')) $query->where('affected_entity_id', $request->affected_entity_id);
        if ($request->filled('user_login_id')) $query->where('user_login_id', $request->user_login_id);
        
        if ($userEmail = $request->input('user_email')) {
            $query->whereHas('user', fn($q) => $q->where('user_email', 'like', '%' . $userEmail . '%'));
        }
        
        if ($request->filled('context_data')) $query->where('context_data', 'like', '%' . $request->context_data . '%');
        if ($request->filled('user_login_id_plain')) $query->where('user_login_id_plain', 'like', '%' . $request->user_login_id_plain . '%');
        if ($request->filled('user_login_email_plain')) $query->where('user_login_email_plain', 'like', '%' . $request->user_login_email_plain . '%');

        // --- ŘAZENÍ ---
        $sortBy = $request->input('sort_by');
        $sortDirection = in_array(strtolower($request->input('sort_direction', 'desc')), ['asc', 'desc']) ? $request->sort_direction : 'desc';

        if ($sortBy === 'user.user_email') {
            $query->leftJoin('user_logins', 'business_logs.user_login_id', '=', 'user_logins.user_login_id')
                  ->orderBy('user_logins.user_email', $sortDirection)
                  ->select('business_logs.*');
        } elseif ($sortBy) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            // Defaultně nejnovější logy jako první
            $query->orderBy('business_log_id', 'desc');
        }

        $logs = $noPagination ? $query->get() : $query->paginate($perPage, ['*'], 'page', $page);

        // Pokud není paginace, vrátíme prostou kolekci
        if ($noPagination) {
            return response()->json(BusinessLogResource::collection($logs));
        }

        // --- RUČNÍ PLOCHÁ STRUKTURA (Fix pro Angular NaN) ---
        return response()->json([
            'data'         => BusinessLogResource::collection($logs->items()),
            'total'        => $logs->total(),
            'per_page'     => $logs->perPage(),
            'current_page' => $logs->currentPage(),
            'last_page'    => $logs->lastPage(),
            'from'         => $logs->firstItem(),
            'to'           => $logs->lastItem(),
        ]);
    }
    public function showDetails(BusinessLog $businessLog): JsonResponse
    {
        return response()->json(new BusinessLogResource($businessLog->load('user')));
    }

    public function store(StoreBusinessLogRequest $request): JsonResponse
    {
        try {
            $userId = $request->user()->user_login_id;

            $log = BusinessLog::create(array_merge($request->validated(), [
                'user_login_id' => $userId
            ]));

            return response()->json(['message' => 'Logovací záznam úspěšně vytvořen.'], 201);
        } catch (\Exception $e) {
            Log::error('Chyba při vytváření business logu: ' . $e->getMessage());
            return response()->json(['message' => 'Nepodařilo se vytvořit logovací záznam.', 'error' => $e->getMessage()], 500);
        }
    }
}