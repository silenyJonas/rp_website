<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessLog;
use App\Http\Resources\BusinessLogResource;
use App\Http\Requests\BusinessLog\StoreBusinessLogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class BusinessLogController extends Controller
{
    public function index(Request $request): JsonResponse
{
    $perPage = $request->input('per_page', 15);
    $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);

    // Základní query s relací na uživatele
    $query = BusinessLog::query()->select('business_logs.*')->with('user');

    // --- FILTRACE ---
    if ($request->filled('id')) {
        $query->where('business_logs.id', $request->id);
    }
    
    if ($request->filled('created_at')) {
        $query->whereDate('business_logs.created_at', $request->input('created_at'));
    }

    if ($request->filled('event_type')) {
        $query->where('business_logs.event_type', $request->event_type);
    }

    if ($request->filled('module')) {
        $query->where('business_logs.module', $request->module);
    }

    $textFields = ['origin', 'description', 'affected_entity_type', 'user_id_plain', 'user_email_plain'];
    foreach ($textFields as $field) {
        if ($request->filled($field)) {
            $query->where("business_logs.$field", 'like', '%' . $request->input($field) . '%');
        }
    }

    // --- ŘAZENÍ (SORTING) ---
    $sortBy = $request->input('sort_by', 'created_at'); 
    
    // Striktní kontrola směru - pokud není 'asc', bude vždy 'desc'
    $sortDirection = (strtolower($request->input('sort_direction')) === 'asc') ? 'asc' : 'desc';

    // Ošetření řazení podle emailu uživatele (přes join)
    if ($sortBy === 'user_email' || $sortBy === 'user.user_email') {
        $query->join('users', 'business_logs.user_id', '=', 'users.id')
              ->orderBy('users.user_email', $sortDirection);
    } else {
        // Standardní řazení se zajištěním prefixu tabulky
        $sortColumn = str_contains($sortBy, '.') ? $sortBy : "business_logs.$sortBy";
        $query->orderBy($sortColumn, $sortDirection);
    }

    // --- EXEKUCE A PAGINACE ---
    if ($noPagination) {
        $logs = $query->get();
        return response()->json(BusinessLogResource::collection($logs));
    }

    $logs = $query->paginate($perPage);

    return response()->json([
        'data'         => BusinessLogResource::collection($logs->items()),
        'total'        => $logs->total(),
        'per_page'     => $logs->perPage(),
        'current_page' => $logs->currentPage(),
        'last_page'    => $logs->lastPage(),
    ]);
}

    public function show($id): JsonResponse
    {
        $log = BusinessLog::with('user')->findOrFail($id);
        return response()->json(new BusinessLogResource($log));
    }

    public function store(StoreBusinessLogRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $logData = array_merge($request->validated(), [
                'user_id' => $user?->id,
                'created_at' => now(), 
            ]);
            $log = BusinessLog::create($logData);
            return response()->json(new BusinessLogResource($log), 201);
        } catch (\Exception $e) {
            Log::error('Chyba při vytváření business logu: ' . $e->getMessage());
            return response()->json(['message' => 'Chyba serveru'], 500);
        }
    }
}