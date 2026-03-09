<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($request->has('genere')) {
            $query->where('movie_genre', 'like', '%' . $request->genere . '%');
        }
        
        if ($request->has('anno_uscita')) {
            $query->where('release_year', $request->anno_uscita);
        }

        $limit = $request->get('limit', 10);
        $page = $request->get('page', 1);

        $movies = $query->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'movies' => $movies->items(),
            'total' => $movies->total()
        ]);
    }

    public function show($id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json(['error' => 'Movie not found'], 404);
        }

        return response()->json($movie);
    }
}
