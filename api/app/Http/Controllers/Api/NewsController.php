<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\BusinessLog;
use App\Http\Resources\NewsResource;
use App\Http\Requests\News\StoreNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NewsController extends Controller
{

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = News::query();
        if ($onlyTrashed) $query->onlyTrashed();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(fn($q) => $q->where('title', 'like', "%$s%")->orWhere('author', 'like', "%$s%"));
        }
        if ($request->filled('thema')) $query->where('thema', $request->thema);

        $sortBy = $request->filled('sort_by') ? $request->input('sort_by') : 'created_at';
        $sortDirection = $request->filled('sort_direction') ? $request->input('sort_direction') : 'desc';
        $query->orderBy($sortBy, $sortDirection);

        $data = $query->paginate($perPage);

        return response()->json([
            'data'         => NewsResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
            'from'         => $data->firstItem(),
            'to'           => $data->lastItem(),
        ]);
    }
    public function store(StoreNewsRequest $request): JsonResponse
    {
        $news = News::create($request->validated());
        $this->logAction($request, 'create', 'News', "Vytvořena novinka: {$news->title}", $news->id);
        return response()->json(new NewsResource($news), 201);
    }

    public function show(News $news): JsonResponse
    {
        return response()->json(new NewsResource($news));
    }

    public function update(UpdateNewsRequest $request, News $news): JsonResponse
    {
        $news->update($request->validated());
        $this->logAction($request, 'update', 'News', "Aktualizace novinky: {$news->title}", $news->id);
        return response()->json(new NewsResource($news));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $news = News::withTrashed()->findOrFail($id);
        $title = $news->title;

        if ($forceDelete) {
            $news->forceDelete();
            $this->logAction($request, 'hard_delete', 'News', "Trvalé smazání novinky ID: {$id} (původní název: {$title})", $id);
        } else {
            $news->delete();
            $this->logAction($request, 'soft_delete', 'News', "Smazáno do koše: {$title}", $id);
        }

        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $news = News::withTrashed()->findOrFail($id);
        $news->restore();
        $this->logAction($request, 'restore', 'News', "Obnovení novinky z koše: {$news->title}", $news->id);
        return response()->json(new NewsResource($news));
    }

    /**
     * Hromadné smazání (např. vysypání koše)
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $count = News::onlyTrashed()->count();
        News::onlyTrashed()->forceDelete();
        
        $this->logAction($request, 'bulk_hard_delete', 'News', "Hromadné trvalé smazání všech položek v koši. Počet: {$count}");
        
        return response()->json(null, 204);
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null)
    {
        try {
            $user = $request->user();
            $uId = $user?->user_login_id;
            $uEmail = $user?->user_email;

            BusinessLog::create([
                'origin'                 => $request->ip(),
                'event_type'             => $eventType,
                'module'                 => $module,
                'description'            => $description,
                'affected_entity_type'   => 'News',
                'affected_entity_id'     => $affectedEntityId,
                'user_login_id'          => $uId,
                'context_data'           => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain'    => (string)($uId ?? '0'),
                'user_login_email_plain' => $uEmail ?? 'unauthenticated/system'
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při zápisu do BusinessLog (News): ' . $e->getMessage());
        }
    }
}