<?php

namespace App\Http\Controllers\Api; // Upravený namespace

use App\Http\Controllers\Controller; // Musíme importovat základní Controller
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class TranslationController extends Controller
{
    public function save(Request $request)
    {
        $request->validate([
            'lang' => 'required|string|max:5',
            'data' => 'required|array'
        ]);

        $lang = $request->input('lang');
        $data = $request->input('data');

        // Načtení cesty z .env (pomocí helperu env())
        // base_path() zajistí správný výchozí bod z kořene Laravelu
        $relativeDirectory = env('ANGULAR_I18N_PATH', '../erp/src/assets/i18n');
        $directory = base_path($relativeDirectory);
        
        $filePath = $directory . '/' . $lang . '.json';

        try {
            if (!File::isDirectory($directory)) {
                File::makeDirectory($directory, 0755, true, true);
            }

            // Uložení s formátováním a podporou CZ znaků
            $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            File::put($filePath, $jsonContent);

            return response()->json([
                'status' => 'success',
                'message' => "Soubor {$lang}.json byl úspěšně aktualizován.",
                // Vrátíme cestu pro kontrolu (volitelné, pro debugování)
                'debug_path' => $filePath 
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => "Chyba při zápisu: " . $e->getMessage()
            ], 500);
        }
    }
}