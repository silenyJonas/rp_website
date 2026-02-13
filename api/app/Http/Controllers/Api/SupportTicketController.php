<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\BusinessLog;
use App\Http\Resources\SupportTicketResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = SupportTicket::query();
        if ($onlyTrashed) $query->onlyTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('subject', 'like', "%$s%")
                ->orWhere('user_name_plain', 'like', "%$s%")
                ->orWhere('category', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        foreach (['id', 'category', 'priority'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }
        
        if ($request->filled('subject')) {
            $query->where('subject', 'like', '%' . $request->input('subject') . '%');
        }

        if ($request->filled('created_at')) {
            $query->whereDate('created_at', $request->created_at);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return SupportTicketResource::collection($data);
        }

        return response()->json([
            'data'         => SupportTicketResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'category'    => 'required|string',
            'priority'    => 'required|string',
            'subject'     => 'required|string|min:2',
            'description' => 'required|string|min:5',
            'attachment'  => 'nullable|file|max:10240',
        ]);

        $user = $request->user();

        $validatedData['user_login_id'] = $user?->user_login_id;
        $validatedData['user_name_plain'] = $user ? $user->full_name : 'Anonymní žadatel';
        $validatedData['user_email_plain'] = $user ? $user->user_email : 'anonym@rpsw.cz';

        if ($request->hasFile('attachment')) {
            $validatedData['attachment_path'] = $request->file('attachment')->store('tickets', 'public');
        }

        $ticket = SupportTicket::create($validatedData);

        $this->logAction($request, 'create', 'SupportTicket', "Nový ticket: {$ticket->subject}", $ticket->id);
        
        return response()->json(new SupportTicketResource($ticket), 201);
    }

    public function show(SupportTicket $supportTicket): JsonResponse
    {
        return response()->json(new SupportTicketResource($supportTicket));
    }

    public function update(Request $request, SupportTicket $supportTicket): JsonResponse
    {
        $validatedData = $request->validate([
            'category'    => 'sometimes|string',
            'priority'    => 'sometimes|string',
            'subject'     => 'sometimes|string',
            'description' => 'sometimes|string',
            'status'      => 'sometimes|string',
        ]);

        $supportTicket->update($validatedData);

        $this->logAction($request, 'update', 'SupportTicket', "Aktualizace ticketu ID: {$supportTicket->id}", $supportTicket->id);
        
        return response()->json(new SupportTicketResource($supportTicket));
    }

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

    public function restore(Request $request, $id): JsonResponse
    {
        $item = SupportTicket::withTrashed()->findOrFail($id);
        $item->restore();
        
        $this->logAction($request, 'restore', 'SupportTicket', "Obnova ticketu ID: $id", $id);
        return response()->json(new SupportTicketResource($item));
    }

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
                'user_login_email_plain' => $user ? $user->user_email : 'Systém/Anonym'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (SupportTicket): " . $e->getMessage());
        }
    }
}