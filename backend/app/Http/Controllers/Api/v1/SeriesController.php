<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Series; 
use Illuminate\Http\Request;

class SeriesController extends Controller
{
    public function index(Request $request)
    {
        $query = Series::query();
        
        if ($request->has('genere')) {
            $query->where('series_genre', 'like', '%' . $request->genere . '%');
        }
        
        if ($request->has('anno_uscita')) {
            $query->where('release_year', $request->anno_uscita);
        }

        $limit = $request->get('limit', 10);
        $page = $request->get('page', 1);

        $series = $query->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'series' => $series->items(),
            'total' => $series->total()
        ]);
    }

    public function show($id)
    {
        $series = Series::find($id);

        if (!$series) {
            return response()->json(['error' => 'Series not found'], 404);
        }

        return response()->json($series);
    }
}