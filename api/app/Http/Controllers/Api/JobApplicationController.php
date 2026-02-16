<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\BusinessLog;
use App\Http\Resources\JobApplicationResource;
use App\Http\Requests\JobApplication\StoreJobApplicationRequest;
use App\Http\Requests\JobApplication\UpdateJobApplicationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobApplicationController extends Controller
{
    /**
     * Seznam uchazečů se stránkováním.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = JobApplication::query();
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
            return JobApplicationResource::collection($data);
        }

        return response()->json([
            'data'         => JobApplicationResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nové reakce (z veřejného webu).
     */
    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        // Zpracování souboru CV
        if ($request->hasFile('cv_file')) {
            // Ukládáme do 'cv_files' v disku 'public'
            $path = $request->file('cv_file')->store('cv_files', 'public');
            $validatedData['cv_path'] = $path;
        }

        $application = JobApplication::create($validatedData);

        $this->logAction($request, 'create', 'JobApplication', "Nová reakce na pozici: {$application->position_name} ({$application->first_name} {$application->last_name})", $application->id);
        
        return response()->json(new JobApplicationResource($application), 201);
    }

    /**
     * Detail uchazeče.
     */
    public function show(JobApplication $jobApplication): JsonResponse
    {
        return response()->json(new JobApplicationResource($jobApplication));
    }

    /**
     * Aktualizace stavu nebo poznámky uchazeče.
     */
// app/Http/Controllers/Api/JobApplicationController.php

public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
{
    $validated = $request->validated();

    // Pokud HR nahraje nové CV v rámci editace
    if ($request->hasFile('cv_file')) {
        // Smazat staré CV, pokud existuje
        if ($jobApplication->cv_path) {
            Storage::disk('public')->delete($jobApplication->cv_path);
        }
        $path = $request->file('cv_file')->store('cv_files', 'public');
        $validated['cv_path'] = $path;
    }

    $jobApplication->update($validated);
    
    $this->logAction($request, 'update', 'JobApplication', "Aktualizace uchazeče ID: {$jobApplication->id}. Nový stav: " . ($validated['state'] ?? 'nezměněn'), $jobApplication->id);
    
    // Vracíme čerstvá data včetně načtených atributů
    return response()->json(new JobApplicationResource($jobApplication->fresh()));
}

    /**
     * Smazání (Soft / Hard).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = JobApplication::withTrashed()->findOrFail($id);
        
        if ($forceDelete) {
            // Při trvalém smazání odstraníme i fyzický soubor CV
            if ($item->cv_path) {
                Storage::disk('public')->delete($item->cv_path);
            }
            $item->forceDelete();
        } else {
            $item->delete();
        }

        $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'JobApplication', "Smazání uchazeče ID: $id", $id);
        
        return response()->json(null, 204);
    }

    /**
     * Obnova z koše.
     */
    public function restore(Request $request, $id): JsonResponse
    {
        $item = JobApplication::withTrashed()->findOrFail($id);
        $item->restore();
        
        $this->logAction($request, 'restore', 'JobApplication', "Obnova uchazeče ID: $id", $id);
        
        return response()->json(new JobApplicationResource($item));
    }

    /**
     * Vyprázdnění koše a smazání všech souborů CV.
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        $trashed = JobApplication::onlyTrashed()->get();
        $count = $trashed->count();

        foreach ($trashed as $item) {
            if ($item->cv_path) {
                Storage::disk('public')->delete($item->cv_path);
            }
            $item->forceDelete();
        }

        $this->logAction($request, 'force_delete_all', 'JobApplication', "Vysypání koše uchazečů. Počet: $count");
        
        return response()->json(null, 204);
    }

    /**
     * Logování akcí (Sjednocené parametry).
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
                'affected_entity_type' => 'JobApplication',
                'affected_entity_id'   => $affectedId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode($request->except(['cv_file']), JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'Veřejný web (Uchazeč)'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (JobApplication): " . $e->getMessage());
        }
    }
}