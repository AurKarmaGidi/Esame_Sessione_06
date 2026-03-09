<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Movie;
use App\Models\Series;
use App\Models\Episode;
use App\Models\Category;
use App\Models\Watchlist;
use App\Models\WatchHistory;
use App\Models\Configuration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

/**
 * Controller per le funzionalità di amministrazione.
 * Tutti i metodi sono protetti dal middleware 'admin' in api.php
 */
class AdminController extends Controller
{
    // ==================== STATISTICHE DASHBOARD ====================
    
    /**
     * Ottiene le statistiche generali per la dashboard admin.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        try {
            $totalUsers = User::count();
            $activeSubscriptions = User::where('subscription_plan', '!=', 'free')->count();
            $totalMovies = Movie::count();
            $totalSeries = Series::count();
            $totalEpisodes = Episode::count();
            
            // Calcolo entrate mensili (somma crediti acquistati nell'ultimo mese)
            $monthlyRevenue = User::sum('credits') * 0.5; // Esempio: 0.5€ per credito
            
            // Utenti recenti (ultimi 5)
            $recentUsers = User::orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'surname' => $user->surname,
                        'email' => $user->email,
                        'role' => $user->role,
                        'subscription_plan' => $user->subscription_plan,
                        'credits' => $user->credits,
                        'joined_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null
                    ];
                });
            
            // Film più popolari (basati su watch history)
            $mostWatched = WatchHistory::where('content_type', 'movie')
                ->select('content_id')
                ->selectRaw('count(*) as views')
                ->groupBy('content_id')
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $movie = Movie::find($item->content_id);
                    return $movie ? [
                        'id' => $movie->id,
                        'title' => $movie->title,
                        'views' => $item->views
                    ] : null;
                })
                ->filter();
            
            // Serie più popolari
            $mostWatchedSeries = WatchHistory::where('content_type', 'series')
                ->select('content_id')
                ->selectRaw('count(*) as views')
                ->groupBy('content_id')
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $series = Series::find($item->content_id);
                    return $series ? [
                        'id' => $series->id,
                        'title' => $series->title,
                        'views' => $item->views
                    ] : null;
                })
                ->filter();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'active_subscriptions' => $activeSubscriptions,
                    'total_movies' => $totalMovies,
                    'total_series' => $totalSeries,
                    'total_episodes' => $totalEpisodes,
                    'monthly_revenue' => $monthlyRevenue,
                    'recent_users' => $recentUsers->values(),
                    'most_watched_movies' => $mostWatched->values(),
                    'most_watched_series' => $mostWatchedSeries->values()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get stats: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== GESTIONE UTENTI ====================
    
    /**
     * Ottiene tutti gli utenti (per la tabella admin).
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllUsers()
    {
        try {
            $users = User::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'surname' => $user->surname,
                        'email' => $user->email,
                        'role' => $user->role,
                        'subscription_plan' => $user->subscription_plan,
                        'credits' => $user->credits,
                        'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                        'updated_at' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i:s') : null
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottiene un utente specifico.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'birth_date' => $user->birth_date,
                    'subscription_plan' => $user->subscription_plan,
                    'subscription_end_date' => $user->subscription_end_date,
                    'credits' => $user->credits,
                    'role' => $user->role,
                    'country_code' => $user->country_code,
                    'region' => $user->region,
                    'city' => $user->city,
                    'address' => $user->address,
                    'zip_code' => $user->zip_code,
                    'payment_methods' => $user->paymentMethods,
                    'ip_address' => request()->ip(),
                    'device_info' => request()->userAgent(),
                    'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                    'updated_at' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i:s') : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna un utente.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'surname' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'subscription_plan' => 'sometimes|in:free,premium,vip',
            'role' => 'sometimes|in:guest,user,admin',
            'credits' => 'sometimes|numeric|min:0',
            'country_code' => 'sometimes|string|max:3',
            'region' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'zip_code' => 'sometimes|string|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            // Aggiorna solo i campi presenti nella request
            $user->fill($request->only([
                'name', 'surname', 'email', 'subscription_plan', 
                'role', 'credits', 'country_code', 'region', 
                'city', 'address', 'zip_code'
            ]));

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un utente (soft delete).
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        try {
            // Soft delete (se il modello usa SoftDeletes)
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiunge crediti a un utente.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCredits(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1|max:10000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $user->credits += $request->amount;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Credits added successfully',
                'new_balance' => $user->credits
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add credits: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== GESTIONE FILM ====================
    
    /**
     * Ottiene tutti i film (per admin).
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllMovies()
    {
        try {
            $movies = Movie::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $movies
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get movies: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiunge un nuovo film.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMovie(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'movie_genre' => 'required|string|max:45',
            'description' => 'required|string',
            'director' => 'required|string|max:45',
            'release_year' => 'required|integer|min:1900|max:2030',
            'duration' => 'required|integer|min:1',
            'poster' => 'required|string',
            'youtube_link' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $movie = Movie::create([
                'title' => $request->title,
                'movie_genre' => $request->movie_genre,
                'description' => $request->description,
                'director' => $request->director,
                'release_year' => $request->release_year,
                'duration' => $request->duration,
                'poster' => $request->poster,
                'youtube_link' => $request->youtube_link
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Movie added successfully',
                'data' => [
                    'id' => $movie->id
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add movie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna un film esistente.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMovie(Request $request, $id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'success' => false,
                'error' => 'Movie not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'movie_genre' => 'sometimes|required|string|max:45',
            'description' => 'sometimes|required|string',
            'director' => 'sometimes|required|string|max:45',
            'release_year' => 'sometimes|integer|min:1900|max:2030',
            'duration' => 'sometimes|integer|min:1',
            'poster' => 'sometimes|string',
            'youtube_link' => 'sometimes|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $movie->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Movie updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update movie: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un film (forzata, non soft delete).
     * Rimuove anche riferimenti in watchlist e watch history.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMovie($id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'success' => false,
                'error' => 'Movie not found'
            ], 404);
        }

        try {
            // Elimina riferimenti nella watchlist
            Watchlist::where('content_id', $id)
                ->where('content_type', 'movie')
                ->delete();

            // Elimina riferimenti nella cronologia
            WatchHistory::where('content_id', $id)
                ->where('content_type', 'movie')
                ->delete();

            // ELIMINAZIONE FORZATA
            $movie->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Movie permanently deleted successfully',
                'deleted_id' => $id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete movie: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== GESTIONE SERIE ====================
    
    /**
     * Ottiene tutte le serie (per admin).
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllSeries()
    {
        try {
            $series = Series::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $series
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get series: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiunge una nuova serie.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSeries(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'series_genre' => 'required|string|max:45',
            'description' => 'required|string',
            'director' => 'required|string|max:45',
            'release_year' => 'required|integer|min:1900|max:2030',
            'duration' => 'required|integer|min:1',
            'seasons' => 'required|integer|min:1',
            'episodes' => 'required|integer|min:1',
            'poster' => 'required|string',
            'youtube_link' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $series = Series::create([
                'title' => $request->title,
                'series_genre' => $request->series_genre,
                'description' => $request->description,
                'director' => $request->director,
                'release_year' => $request->release_year,
                'duration' => $request->duration,
                'poster' => $request->poster,
                'youtube_link' => $request->youtube_link,
                'seasons' => $request->seasons,
                'episodes' => $request->episodes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Series added successfully',
                'data' => [
                    'id' => $series->id
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add series: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna una serie esistente.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSeries(Request $request, $id)
    {
        $series = Series::find($id);

        if (!$series) {
            return response()->json([
                'success' => false,
                'error' => 'Series not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'series_genre' => 'sometimes|required|string|max:45',
            'description' => 'sometimes|required|string',
            'director' => 'sometimes|required|string|max:45',
            'release_year' => 'sometimes|integer|min:1900|max:2030',
            'duration' => 'sometimes|integer|min:1',
            'seasons' => 'sometimes|integer|min:1',
            'episodes' => 'sometimes|integer|min:1',
            'poster' => 'sometimes|string',
            'youtube_link' => 'sometimes|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $series->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Series updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update series: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una serie (forzata).
     * Rimuove anche episodi correlati e riferimenti in watchlist/watch history.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSeries($id)
    {
        $series = Series::find($id);

        if (!$series) {
            return response()->json([
                'success' => false,
                'error' => 'Series not found'
            ], 404);
        }

        try {
            // Elimina prima tutti gli episodi correlati
            Episode::where('series_id', $id)->forceDelete();

            // Elimina riferimenti nella watchlist
            Watchlist::where('content_id', $id)
                ->where('content_type', 'series')
                ->delete();

            // Elimina riferimenti nella cronologia
            WatchHistory::where('content_id', $id)
                ->where('content_type', 'series')
                ->delete();

            // ELIMINAZIONE FORZATA
            $series->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Series and all related episodes permanently deleted successfully',
                'deleted_series_id' => $id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete series: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== GESTIONE EPISODI ====================
    
    /**
     * Ottiene tutti gli episodi di una serie.
     * 
     * @param int $seriesId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEpisodes($seriesId)
    {
        try {
            $series = Series::find($seriesId);
            
            if (!$series) {
                return response()->json([
                    'success' => false,
                    'error' => 'Series not found'
                ], 404);
            }

            $episodes = Episode::where('series_id', $seriesId)
                ->orderBy('season_number')
                ->orderBy('episode_number')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $episodes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get episodes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiunge un episodio a una serie.
     * 
     * @param Request $request
     * @param int $seriesId
     * @param int $seasonNumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function addEpisode(Request $request, $seriesId, $seasonNumber)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'episode_number' => 'required|integer|min:1',
            'streaming_url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        $series = Series::find($seriesId);
        if (!$series) {
            return response()->json([
                'success' => false,
                'error' => 'Series not found'
            ], 404);
        }

        try {
            $episode = Episode::create([
                'series_id' => $seriesId,
                'season_number' => $seasonNumber,
                'episode_number' => $request->episode_number,
                'title' => $request->title,
                'description' => $request->description,
                'duration' => $request->duration,
                'streaming_url' => $request->streaming_url
            ]);

            // Aggiorna il conteggio episodi nella serie
            $series->setAttribute('episodes', intval($series->getAttribute('episodes')) + 1);
            $series->save();

            return response()->json([
                'success' => true,
                'message' => 'Episode added successfully',
                'data' => [
                    'episode_id' => $episode->id
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add episode: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna un episodio.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEpisode(Request $request, $id)
    {
        $episode = Episode::find($id);

        if (!$episode) {
            return response()->json([
                'success' => false,
                'error' => 'Episode not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'duration' => 'sometimes|integer|min:1',
            'episode_number' => 'sometimes|integer|min:1',
            'season_number' => 'sometimes|integer|min:1',
            'streaming_url' => 'sometimes|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $episode->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Episode updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update episode: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un episodio.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteEpisode($id)
    {
        $episode = Episode::find($id);

        if (!$episode) {
            return response()->json([
                'success' => false,
                'error' => 'Episode not found'
            ], 404);
        }

        try {
            $seriesId = $episode->series_id;
            
            // Elimina riferimenti nella cronologia
            WatchHistory::where('content_id', $id)
                ->where('content_type', 'episode')
                ->delete();

            // ELIMINAZIONE FORZATA
            $episode->forceDelete();

            // Aggiorna il conteggio episodi nella serie
            $series = Series::find($seriesId);
            if ($series) {
                $currentEpisodes = intval($series->getAttribute('episodes'));
                $series->setAttribute('episodes', max(0, $currentEpisodes - 1));
                $series->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Episode permanently deleted successfully',
                'deleted_episode_id' => $id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete episode: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== GESTIONE CATEGORIE ====================
    
    /**
     * Ottiene tutte le categorie.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategories()
    {
        try {
            $categories = Category::orderBy('name')->get();
            
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiunge una categoria.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $category = Category::create([
                'name' => $request->name,
                'description' => $request->description
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category added successfully',
                'data' => [
                    'id' => $category->id
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to add category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna una categoria.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'error' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 400);
        }

        try {
            $category->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una categoria.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteCategory($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'error' => 'Category not found'
            ], 404);
        }

        try {
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete category: ' . $e->getMessage()
            ], 500);
        }
    }
}