<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\BusinessLog;
use App\Http\Resources\NewsResource;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = News::query();
        if ($onlyTrashed) $query->onlyTrashed();

        // Filtry
        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(fn($q) => $q->where('title', 'like', "%$s%")->orWhere('author', 'like', "%$s%"));
        }
        if ($request->filled('thema')) $query->where('thema', $request->thema);

        $query->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_direction', 'desc'));

        return NewsResource::collection($query->paginate($perPage));
    }

    public function store(StoreNewsRequest $request): JsonResponse
    {
        $news = News::create($request->validated());
        $this->logAction($request, 'create', 'News', 'Vytvořeno: ' . $news->title, $news->id);
        return response()->json(new NewsResource($news), 201);
    }

    public function show(News $news): JsonResponse
    {
        return response()->json(new NewsResource($news));
    }

    public function showDetails(News $news): JsonResponse
    {
        return response()->json(new NewsResource($news));
    }

    public function update(UpdateNewsRequest $request, News $news): JsonResponse
    {
        $news->update($request->validated());
        $this->logAction($request, 'update', 'News', 'Upraveno: ' . $news->title, $news->id);
        return response()->json(new NewsResource($news));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $news = News::withTrashed()->findOrFail($id);
        if (filter_var($request->input('force_delete'), FILTER_VALIDATE_BOOLEAN)) {
            $news->forceDelete();
        } else {
            $news->delete();
        }
        return response()->json(null, 204);
    }

    public function restore($id): JsonResponse
    {
        $news = News::withTrashed()->findOrFail($id);
        $news->restore();
        return response()->json(new NewsResource($news));
    }

    protected function logAction(Request $request, $type, $mod, $desc, $id = null)
    {
        BusinessLog::create([
            'origin' => $request->ip(),
            'event_type' => $type,
            'module' => $mod,
            'description' => $desc,
            'affected_entity_id' => $id,
            'user_login_email_plain' => $request->user()?->user_email
        ]);
    }
}