<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\BusinessLog;
use App\Http\Requests\SupportTicket\StoreSupportTicketRequest;
use App\Http\Requests\SupportTicket\UpdateSupportTicketRequest;
use App\Http\Resources\SupportTicketResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SupportTicketController extends Controller
{
    /**
     * Seznam tiketů s filtrací a funkčním řazením.
     */
    public function index(Request $request): JsonResponse
{
    $perPage = $request->input('per_page', 15);
    $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

    $query = SupportTicket::query();
    $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

    // --- FILTRACE ---
    if ($s = $request->input('search')) {
        $query->where(fn($q) => $q->where('subject', 'like', "%$s%")
            ->orWhere('description', 'like', "%$s%")
            ->orWhere('user_email', 'like', "%$s%"));
    }

    // Přesná shoda
    foreach (['id', 'status', 'priority', 'category'] as $f) {
        if ($request->filled($f)) $query->where($f, $request->input($f));
    }

    // --- ŘAZENÍ (ZDE JE OPRAVA) ---
    $sortBy = $request->input('sort_by', 'created_at');
    
    // Validace směru - pokud není asc/desc, vynutíme desc
    $direction = strtolower($request->input('sort_direction', 'desc'));
    $sortDirection = in_array($direction, ['asc', 'desc']) ? $direction : 'desc';

    $query->orderBy($sortBy, $sortDirection);

    // --- EXEKUCE ---
    $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
    $data = $noPagination ? $query->get() : $query->paginate($perPage);

    if ($noPagination) {
        return response()->json(SupportTicketResource::collection($data));
    }

    return response()->json([
        'data'         => SupportTicketResource::collection($data->items()),
        'total'        => $data->total(),
        'per_page'     => $data->perPage(),
        'current_page' => $data->currentPage(),
        'last_page'    => $data->lastPage(), // Opraveno na camelCase
    ]);
}

    /**
     * Vytvoření tiketu s automatickým doplněním uživatele.
     */
    public function store(StoreSupportTicketRequest $request): JsonResponse
    {
        $data = $request->all(); 
    $user = $request->user();

    if ($user) {
        $data['user_id'] = $user->id;
        $data['user_name_plain'] = $data['user_name_plain'] ?? ($user->full_name ?? $user->user_email);
        $data['user_email_plain'] = $data['user_email_plain'] ?? $user->user_email;
    }
    
    if ($request->hasFile('attachment')) {
        $path = $request->file('attachment')->store('tickets', 'public');
        $data['attachment_path'] = $path;
    }

    $ticket = SupportTicket::create($data);

        $this->logAction($request, 'create', 'SupportTicket', "Nový ticket: {$ticket->subject}", $ticket->id);
        
        return response()->json(new SupportTicketResource($ticket), 201);
    }

    /**
     * Detail tiketu.
     */
    public function show(SupportTicket $supportTicket): JsonResponse
    {
        return response()->json(new SupportTicketResource($supportTicket));
    }

    /**
     * Aktualizace tiketu.
     */
    public function update(UpdateSupportTicketRequest $request, SupportTicket $supportTicket): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('attachment')) {
            if ($supportTicket->attachment_path) {
                Storage::disk('public')->delete($supportTicket->attachment_path);
            }
            $validated['attachment_path'] = $request->file('attachment')->store('tickets', 'public');
        }

        $supportTicket->update($validated);

        $this->logAction($request, 'update', 'SupportTicket', "Aktualizace ticketu ID: {$supportTicket->id}", $supportTicket->id);
        
        return response()->json(new SupportTicketResource($supportTicket));
    }

    /**
     * Smazání tiketu.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = SupportTicket::withTrashed()->findOrFail($id);
        
        if ($forceDelete) {
            if ($item->attachment_path) {
                Storage::disk('public')->delete($item->attachment_path);
            }
            $item->forceDelete();
        } else {
            $item->delete();
        }

        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'SupportTicket', "Smazání ticketu ID: $id", $id);
        return response()->json(null, 204);
    }

    /**
     * Obnova smazaného tiketu.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        $item = SupportTicket::withTrashed()->findOrFail($id);
        $item->restore();
        
        $this->logAction($request, 'restore', 'SupportTicket', "Obnova ticketu ID: $id", $id);
        return response()->json(new SupportTicketResource($item));
    }

    /**
     * Vymazání koše.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $trashed = SupportTicket::onlyTrashed()->get();
        $count = $trashed->count();

        foreach ($trashed as $ticket) {
            if ($ticket->attachment_path) {
                Storage::disk('public')->delete($ticket->attachment_path);
            }
            $ticket->forceDelete();
        }

        $this->logAction($request, 'force_delete_all', 'SupportTicket', "Hromadné smazání koše ticketů. Počet: $count");
        return response()->json(null, 204);
    }

    /**
     * Logování akcí do BusinessLog.
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();
            BusinessLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'SupportTicket',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->except(['attachment']), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'system/anonymous'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SupportTicket): " . $e->getMessage());
        }
    }
}