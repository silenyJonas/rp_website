<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class TranslationController extends Controller
{
    /**
     * Uložení překladů do JSON souboru a logování změn.
     */
    public function save(Request $request): JsonResponse
    {
        $request->validate([
            'lang' => 'required|string|max:5',
            'data' => 'required|array'
        ]);

        $lang = $request->input('lang');
        $newData = $request->input('data');

        $relativeDirectory = env('ANGULAR_I18N_PATH');
        $directory = base_path($relativeDirectory);
        $filePath = $directory . '/' . $lang . '.json';

        try {
            $oldData = [];
            if (File::exists($filePath)) {
                $oldData = json_decode(File::get($filePath), true) ?? [];
            }

            // Výpočet rozdílů pro logování
            $changes = $this->getDeepDiff($oldData, $newData);

            if (!File::isDirectory($directory)) {
                File::makeDirectory($directory, 0755, true, true);
            }

            $jsonContent = json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            File::put($filePath, $jsonContent);

            $this->logAction(
                $request, 
                'update', 
                'Translation', 
                "Update {$lang}.json. Changes: " . count($changes),
                null,
                $changes
            );

            return response()->json([
                'status' => 'success',
                'detected_changes' => count($changes)
            ], 200);

        } catch (\Exception $e) {
            // Logování chyby do BusinessLog
            $this->logAction($request, 'error', 'Translation', "Chyba při zápisu překladu ({$lang}): " . $e->getMessage());
            
            Log::error('Chyba při zápisu překladu: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Rekurzivní porovnání polí pro zjištění změn v překladech.
     */
    private function getDeepDiff(array $old, array $new, string $path = ''): array
    {
        $diff = [];
        
        foreach ($new as $key => $value) {
            $currentPath = $path ? "{$path}.{$key}" : $key;

            if (!isset($old[$key])) {
                $displayVal = is_array($value) ? '[Array]' : mb_substr((string)$value, 0, 15);
                $diff[] = "NEW:{$currentPath}({$displayVal})";
            } elseif (is_array($value) && is_array($old[$key])) {
                $diff = array_merge($diff, $this->getDeepDiff($old[$key], $value, $currentPath));
            } elseif ($old[$key] !== $value) {
                $oldVal = mb_substr((string)$old[$key], 0, 10);
                $newVal = mb_substr((string)$value, 0, 10);
                $diff[] = "CHNG:{$currentPath}({$oldVal}->{$newVal})";
            }
        }
        return $diff;
    }

    /**
     * Sjednocené logování akcí.
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null, array $changes = [])
    {
        try {
            $user = $request->user() ?? auth('sanctum')->user();
            
            $diffString = implode(' | ', $changes);
            if (mb_strlen($diffString) > 200) {
                $diffString = mb_substr($diffString, 0, 197) . '...';
            }

            BusinessLog::create([
                'origin'               => $request->ip(),
                'event_type'           => $eventType,
                'module'               => $module,
                'description'          => $description,
                'affected_entity_type' => 'Translation',
                'affected_entity_id'   => $affectedEntityId,
                'user_id'              => $user?->id,
                'context_data'         => json_encode([
                    'lg' => $request->input('lang'),
                    'df' => $diffString ?: 'no_val_change'
                ], JSON_UNESCAPED_UNICODE),
                'user_id_plain'        => (string)($user?->id ?? '0'),
                'user_email_plain'     => $user?->user_email ?? 'system'
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba logování (Translation): ' . $e->getMessage());
        }
    }

    /**
     * Načtení překladů pro daný jazyk.
     */
    public function getTranslations(string $lang): JsonResponse
    {
        $relativeDirectory = env('ANGULAR_I18N_PATH', '../erp/src/assets/i18n');
        $filePath = base_path($relativeDirectory) . '/' . $lang . '.json';
        
        if (!File::exists($filePath)) {
            return response()->json(['message' => 'Not found'], 404);
        }
        
        return response()->json(json_decode(File::get($filePath), true));
    }
}