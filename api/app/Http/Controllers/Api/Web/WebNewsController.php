<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Web\WebNews;
use App\Models\Web\WebLog;
use App\Http\Resources\Web\WebNewsResource;
use App\Http\Requests\Web\WebNews\StoreWebNewsRequest;
use App\Http\Requests\Web\WebNews\UpdateWebNewsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebNewsController extends Controller
{
    /**
     * Seznam novinek se stránkováním pro GenericTable.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = WebNews::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Vyhledávání (Title, Author, Message)
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('title', 'like', "%$s%")
                ->orWhere('author', 'like', "%$s%")
                ->orWhere('message', 'like', "%$s%"));
        }

        // Filtry na přesnou shodu
        if ($request->filled('thema')) {
            $query->where('thema', $request->thema);
        }

        if ($request->filled('author')) {
            $query->where('author', 'like', '%' . $request->author . '%');
        }

        // Řazení
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return WebNewsResource::collection($data);
        }

        return response()->json([
            'data'         => WebNewsResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Vytvoření novinky.
     */
    public function store(StoreWebNewsRequest $request): JsonResponse
    {
        try {
            $news = WebNews::create($request->validated());
            
            $this->logAction($request, 'create', 'WebNews', "Vytvořena novinka: {$news->title}", $news->id);
            
            return response()->json(new WebNewsResource($news), 201);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebNews', "Chyba při vytváření novinky: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření novinky selhalo.'], 500);
        }
    }

    /**
     * Detail novinky.
     */
    public function show(WebNews $news): JsonResponse
    {
        return response()->json(new WebNewsResource($news));
    }

    /**
     * Aktualizace novinky.
     */
    public function update(UpdateWebNewsRequest $request, WebNews $news): JsonResponse
    {
        try {
            $news->update($request->validated());
            
            $this->logAction($request, 'update', 'WebNews', "Aktualizace novinky: {$news->title}", $news->id);
            
            return response()->json(new WebNewsResource($news));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebNews', "Chyba při aktualizaci novinky ID {$news->id}: " . $e->getMessage(), $news->id);
            return response()->json(['message' => 'Aktualizace novinky selhala.'], 500);
        }
    }

    /**
     * Smazání (Soft/Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $news = WebNews::withTrashed()->findOrFail($id);
            $title = $news->title;

            $forceDelete ? $news->forceDelete() : $news->delete();
            
            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'WebNews', "Smazání novinky: $title", $id);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebNews', "Chyba při mazání novinky ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání novinky selhalo.'], 500);
        }
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $news = WebNews::withTrashed()->findOrFail($id);
            $news->restore();
            
            $this->logAction($request, 'restore', 'WebNews', "Obnovení novinky: {$news->title}", $news->id);
            
            return response()->json(new WebNewsResource($news));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebNews', "Chyba při obnově novinky ID $id: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova novinky selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše novinek.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $count = WebNews::onlyTrashed()->count();
            WebNews::onlyTrashed()->forceDelete();
            
            $this->logAction($request, 'force_delete_all', 'WebNews', "Hromadné smazání koše novinek. Počet: $count");
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebNews', "Chyba při vyprazdňování koše novinek: " . $e->getMessage());
            return response()->json(['message' => 'Vysypání koše selhalo.'], 500);
        }
    }

    /**
     * Sjednocené logování akcí.
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();
            WebLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'WebNews',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (WebNews): " . $e->getMessage());
        }
    }
}