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
     * Uložení překladů s hloubkovou detekcí změn a logováním.
     */
    public function save(Request $request): JsonResponse
    {
        $request->validate([
            'lang' => 'required|string|max:5',
            'data' => 'required|array'
        ]);

        $lang = $request->input('lang');
        $newData = $request->input('data');

        $relativeDirectory = env('ANGULAR_I18N_PATH', '../erp/src/assets/i18n');
        $directory = base_path($relativeDirectory);
        $filePath = $directory . '/' . $lang . '.json';

        try {
            // 1. Načtení starých dat pro porovnání
            $oldData = [];
            if (File::exists($filePath)) {
                $oldData = json_decode(File::get($filePath), true) ?? [];
            }

            // 2. Rekurzivní detekce změn (včetně všech úrovní zanoření)
            $changes = $this->getDeepDiff($oldData, $newData);

            // 3. Zápis do JSON souboru
            if (!File::isDirectory($directory)) {
                File::makeDirectory($directory, 0755, true, true);
            }
            $jsonContent = json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            File::put($filePath, $jsonContent);

            // 4. Logování změn
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
            Log::error('Chyba při zápisu překladu: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * HLOUBKOVÁ DETEKCE ZMĚN
     * Prochází JSON do libovolné úrovně a vrací lidsky čitelný rozdíl.
     */
    private function getDeepDiff(array $old, array $new, string $path = ''): array
    {
        $diff = [];
        
        // Projdeme všechna nová data
        foreach ($new as $key => $value) {
            $currentPath = $path ? "{$path}.{$key}" : $key;

            if (!isset($old[$key])) {
                // NOVÝ KLÍČ
                $displayVal = is_array($value) ? '[Array]' : mb_substr((string)$value, 0, 15);
                $diff[] = "NEW:{$currentPath}({$displayVal})";
            } elseif (is_array($value) && is_array($old[$key])) {
                // REKURZE (jdeme hlouběji)
                $diff = array_merge($diff, $this->getDeepDiff($old[$key], $value, $currentPath));
            } elseif ($old[$key] !== $value) {
                // ZMĚNA HODNOTY
                $oldVal = mb_substr((string)$old[$key], 0, 10);
                $newVal = mb_substr((string)$value, 0, 10);
                $diff[] = "CHNG:{$currentPath}({$oldVal}->{$newVal})";
            }
        }
        return $diff;
    }

    /**
     * BEZPEČNÉ LOGOVÁNÍ PRO VARCHAR(255)
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedEntityId = null, array $changes = [])
    {
        try {
            $user = $request->user();
            
            // Sestavení řetězce změn s oddělovačem
            $diffString = implode(' | ', $changes);
            
            // Ořezání na 200 znaků, aby zbyl prostor pro JSON strukturu ve VARCHAR(255)
            if (mb_strlen($diffString) > 200) {
                $diffString = mb_substr($diffString, 0, 197) . '...';
            }

            BusinessLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'Translation',
                'affected_entity_id' => $affectedEntityId,
                'user_login_id' => $user?->user_login_id,
                'context_data' => json_encode([
                    'lg' => $request->input('lang'),
                    'df' => $diffString ?: 'no_val_change'
                ], JSON_UNESCAPED_UNICODE),
                'user_login_id_plain' => (string)$user?->user_login_id,
                'user_login_email_plain' => $user?->user_email
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba logování: ' . $e->getMessage());
        }
    }

    public function getTranslations(string $lang): JsonResponse
    {
        $relativeDirectory = env('ANGULAR_I18N_PATH', '../erp/src/assets/i18n');
        $filePath = base_path($relativeDirectory) . '/' . $lang . '.json';
        if (!File::exists($filePath)) return response()->json(['message' => 'Not found'], 404);
        return response()->json(json_decode(File::get($filePath), true));
    }
}