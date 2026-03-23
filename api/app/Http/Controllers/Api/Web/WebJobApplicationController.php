<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Web\WebJobApplication;
use App\Models\Web\WebLog;
use App\Http\Resources\Web\WebJobApplicationResource;
use App\Http\Requests\Web\WebJobApplication\StoreWebJobApplicationRequest;
use App\Http\Requests\Web\WebJobApplication\UpdateWebJobApplicationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WebJobApplicationController extends Controller
{
    /**
     * Seznam uchazečů se stránkováním.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = WebJobApplication::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Fulltextové vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('position_name', 'like', "%$s%"));
        }

        // Filtry na shodu
        foreach (['first_name', 'last_name', 'email', 'position_name', 'state'] as $f) {
            if ($request->filled($f)) {
                $query->where($f, 'like', '%' . $request->input($f) . '%');
            }
        }

        if ($request->filled('created_at')) {
            $query->whereDate('created_at', $request->created_at);
        }

        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return WebJobApplicationResource::collection($data);
        }

        return response()->json([
            'data'         => WebJobApplicationResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nové reakce.
     */
    public function store(StoreWebJobApplicationRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('cv_file')) {
                $path = $request->file('cv_file')->store('cv_files', 'public');
                $validatedData['cv_path'] = $path;
            }

            $application = WebJobApplication::create($validatedData);

            $this->logAction($request, 'create', 'WebJobApplication', "Nová reakce na pozici: {$application->position_name} ({$application->first_name} {$application->last_name})", $application->id);
            
            return response()->json(new WebJobApplicationResource($application), 201);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebJobApplication', "Chyba při vytváření uchazeče: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření se nezdařilo.'], 500);
        }
    }

    /**
     * Detail uchazeče.
     */
    public function show(WebJobApplication $jobApplication): JsonResponse
    {
        return response()->json(new WebJobApplicationResource($jobApplication));
    }

    /**
     * Aktualizace uchazeče.
     */
    public function update(UpdateWebJobApplicationRequest $request, WebJobApplication $jobApplication): JsonResponse
    {
        try {
            $validated = $request->validated();

            if ($request->hasFile('cv_file')) {
                if ($jobApplication->cv_path) {
                    Storage::disk('public')->delete($jobApplication->cv_path);
                }
                $path = $request->file('cv_file')->store('cv_files', 'public');
                $validated['cv_path'] = $path;
            }

            $jobApplication->update($validated);
            
            $this->logAction($request, 'update', 'WebJobApplication', "Aktualizace uchazeče ID: {$jobApplication->id}. Stav: " . ($validated['state'] ?? 'beze změny'), $jobApplication->id);
            
            return response()->json(new WebJobApplicationResource($jobApplication->fresh()));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebJobApplication', "Chyba při aktualizaci uchazeče ID: {$jobApplication->id}. Chyba: " . $e->getMessage(), $jobApplication->id);
            return response()->json(['message' => 'Aktualizace se nezdařila.'], 500);
        }
    }

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $item = WebJobApplication::withTrashed()->findOrFail($id);
            
            if ($forceDelete) {
                if ($item->cv_path) {
                    Storage::disk('public')->delete($item->cv_path);
                }
                $item->forceDelete();
            } else {
                $item->delete();
            }

            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'WebJobApplication', "Smazání uchazeče ID: $id", $id);
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebJobApplication', "Chyba při mazání uchazeče ID: $id. Chyba: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání se nezdařilo.'], 500);
        }
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $item = WebJobApplication::withTrashed()->findOrFail($id);
            $item->restore();
            
            $this->logAction($request, 'restore', 'WebJobApplication', "Obnova uchazeče ID: $id", $id);
            
            return response()->json(new WebJobApplicationResource($item));
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebJobApplication', "Chyba při obnově uchazeče ID: $id. Chyba: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova se nezdařila.'], 500);
        }
    }

    /**
     * Vyprázdnění koše.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $trashed = WebJobApplication::onlyTrashed()->get();
            $count = $trashed->count();

            foreach ($trashed as $item) {
                if ($item->cv_path) {
                    Storage::disk('public')->delete($item->cv_path);
                }
                $item->forceDelete();
            }

            $this->logAction($request, 'force_delete_all', 'WebJobApplication', "Vysypání koše uchazečů. Počet: $count");
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            $this->logAction($request, 'error', 'WebJobApplication', "Chyba při vysypávání koše uchazečů. Chyba: " . $e->getMessage());
            return response()->json(['message' => 'Vysypání koše se nezdařilo.'], 500);
        }
    }

    /**
     * Logování akcí.
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
                'affected_entity_type' => 'WebJobApplication',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->except(['cv_file']), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'Veřejný web (Uchazeč)'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (WebJobApplication): " . $e->getMessage());
        }
    }
}