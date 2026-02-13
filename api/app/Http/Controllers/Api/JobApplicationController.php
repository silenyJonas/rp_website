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
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = JobApplication::query();
        if ($onlyTrashed) $query->onlyTrashed();

        // Vyhledávání (Jméno, Příjmení, Email, Pozice)
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('position_name', 'like', "%$s%"));
        }

        // Like filtry
        foreach (['first_name', 'last_name', 'email', 'position_name', 'state'] as $f) {
            if ($request->filled($f)) $query->where($f, 'like', '%' . $request->input($f) . '%');
        }

        if ($request->filled('created_at')) $query->whereDate('created_at', $request->created_at);

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

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        // Zpracování životopisu (CV)
        if ($request->hasFile('cv_file')) {
            $validatedData['cv_path'] = $request->file('cv_file')->store('cv_files', 'public');
        }

        $application = JobApplication::create($validatedData);

        $this->logAction($request, 'create', 'JobApplication', "Nová reakce na pozici: {$application->position_name} od {$application->first_name} {$application->last_name}", $application->id);
        
        return response()->json(new JobApplicationResource($application), 201);
    }

    public function show(JobApplication $jobApplication): JsonResponse
    {
        return response()->json(new JobApplicationResource($jobApplication));
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $jobApplication->update($request->validated());
        $this->logAction($request, 'update', 'JobApplication', "Aktualizace uchazeče ID: {$jobApplication->id}", $jobApplication->id);
        return response()->json(new JobApplicationResource($jobApplication));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = JobApplication::withTrashed()->findOrFail($id);
        
        if ($forceDelete) {
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

    public function restore(Request $request, $id): JsonResponse
    {
        $item = JobApplication::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'JobApplication', "Obnova uchazeče ID: $id", $id);
        return response()->json(new JobApplicationResource($item));
    }

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

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null)
    {
        try {
            $user = $request->user();
            BusinessLog::create([
                'origin'                 => $request->ip(),
                'event_type'             => $eventType,
                'module'                 => $module,
                'description'            => $description,
                'affected_entity_type'   => 'JobApplication',
                'affected_entity_id'     => $affectedId,
                'user_login_id'          => $user?->user_login_id,
                'context_data'           => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_login_id_plain'    => (string)($user?->user_login_id ?? '0'),
                'user_login_email_plain' => $user ? $user->user_email : 'Veřejný web (Uchazeč)'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (JobApplication): " . $e->getMessage());
        }
    }
}