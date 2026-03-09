<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Language;       
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 

class TranslationController extends Controller
{
    /**
     * Ottiene tutte le lingue disponibili
     */
    public function getLanguages()
    {
        $languages = Language::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'code', 'locale', 'flag', 'is_default']);
        
        return response()->json($languages);
    }

    /**
     * Ottiene tutte le traduzioni per una lingua
     */
    public function getTranslations(Request $request)
    {
        $langCode = $request->get('lang', 'it');
        
        $language = Language::where('code', $langCode)->first();
        
        if (!$language) {
            return response()->json(['error' => 'Language not found'], 404);
        }
        
        // Usa la vista translation_view per unire traduzioni standard e personalizzate
        $translations = DB::table('translation_view')
            ->where('language_id', $language->id)
            ->get(['key', 'value', 'group']);
        
        return response()->json($translations);
    }
}