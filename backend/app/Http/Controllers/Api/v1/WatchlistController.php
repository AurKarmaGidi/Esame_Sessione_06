<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use App\Models\Series;
use App\Models\Watchlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class WatchlistController extends Controller
{
public function index($userId)
{
    if (Auth::user()->id != $userId) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    $watchlistItems = Watchlist::where('user_id', $userId)->get();
    
    // Arricchisce ogni elemento con i dettagli del contenuto
    $enrichedItems = $watchlistItems->map(function ($item) {
        $content = null;
        
        if ($item->content_type === 'movie') {
            $content = Movie::find($item->content_id);
            if ($content) {
                $item->title = $content->title;
                $item->poster = $content->poster;
                $item->release_year = $content->release_year;
                $item->movie_genre = $content->movie_genre;
                $item->director = $content->director;
                $item->duration = $content->duration;
            }
        } else if ($item->content_type === 'series') {
            $content = Series::find($item->content_id);
            if ($content) {
                $item->title = $content->title;
                $item->poster = $content->poster;
                $item->release_year = $content->release_year;
                $item->series_genre = $content->series_genre;
                $item->director = $content->director;
                $item->seasons = $content->seasons;
                $item->duration = $content->duration;
            }
        }
        
        return $item;
    });

    return response()->json($enrichedItems);
}

  public function addToWatchlist(Request $request, $userId)
  {
    if (Auth::user()->id != $userId) {
      return response()->json(['error' => 'Forbidden'], 403); //
    }

    $validator = Validator::make($request->all(), [
      'content_id' => 'required|integer',
      'content_type' => 'required|in:movie,series'
    ]);

    if ($validator->fails()) {
      return response()->json(['error' => $validator->errors()], 400);
    }

    // Evita duplicati
    $exists = Watchlist::where('user_id', $userId)
      ->where('content_id', $request->content_id)
      ->where('content_type', $request->content_type)
      ->exists();

    if ($exists) {
      return response()->json(['error' => 'Content already in watchlist'], 409);
    }

    $watchlistItem = Watchlist::create([
      'user_id' => $userId,
      'content_id' => $request->content_id,
      'content_type' => $request->content_type
    ]);

    return response()->json([
      'id' => $watchlistItem->id,
      'message' => 'Added to watchlist'
    ], 201);
  }

  public function removeFromWatchlist($userId, $watchlistId)
  {
    if (Auth::user()->id != $userId) {
      return response()->json(['error' => 'Forbidden'], 403);
    }

    $watchlistItem = Watchlist::where('user_id', $userId)
      ->where('id', $watchlistId)
      ->first();

    if (!$watchlistItem) {
      return response()->json(['error' => 'Watchlist item not found'], 404);
    }

    $watchlistItem->delete();

    return response()->json(['message' => 'Removed from watchlist']);
  }
}