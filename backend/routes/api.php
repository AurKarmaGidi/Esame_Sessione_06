<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\MovieController;
use App\Http\Controllers\Api\v1\SeriesController;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\AdminController;
use App\Http\Controllers\Api\v1\PaymentController;
use App\Http\Controllers\Api\v1\WatchlistController;
use Illuminate\Support\Facades\Route;

// Token per test con EchoApi
$testTokens = [
    'sale' => '8f3a7b2e9c1d4f6a8b0e5c3d7a9f2b4e6c8a0d1f5b7e9c3a6d8f0b2e4c7a9d1f5b8e0c3a6d9f1b4e7c0a2d5f8b1e4c7a9d0b3e6f2a5c8d1b4e7f0a3c6d9b2e5f8c1a4d7',
    'sfida' => 'a5e8c1b7f4d9a2e6c0b3f7d1a4e8c2b6f0d3a7e1c4f8b2d5e9c3a6f1b4d8e2c5f9b3d6e0c4a7f2b5d9e3c6a0f4b7d1e5a8f3b6d0e4a7f1b5d8e2c6a9f4b7d1e5a8f3c6',
    'secretJWT' => 'e9b2d5f8a1c4e7b0d3f6a9c2e5f8b1d4e7a0c3f6b9d2e5f8a1c4e7b0d3f6a9c2e5f8b1d4e7a0c3f6b9d2e5f8a1c4e7b0d3f6a9c2e5f8b1d4e7a0c3f6b9d2e5f8a1c4e7b0'
];

Route::prefix('v1')->group(function () {
    // Public routes - Nuovo sistema di autenticazione
    Route::get('/accedi/{utente}/{hash?}', [AuthController::class, 'controlloUtente']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::get('/movies', [MovieController::class, 'index']);
    Route::get('/movies/{id}', [MovieController::class, 'show']);
    Route::get('/series', [SeriesController::class, 'index']);
    Route::get('/series/{id}', [SeriesController::class, 'show']);

    // Lingue
    Route::get('/languages', [App\Http\Controllers\Api\v1\TranslationController::class, 'getLanguages']);
    // Traduzioni
    Route::get('/translations', [App\Http\Controllers\Api\v1\TranslationController::class, 'getTranslations']);
    
    
    // User routes (require JWT)
    Route::middleware('auth:api')->group(function () {
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // WATCHLIST ROUTES
        Route::get('/users/{userId}/watchlist', [WatchlistController::class, 'index']);
        Route::post('/users/{userId}/watchlist', [WatchlistController::class, 'addToWatchlist']);
        Route::delete('/users/{userId}/watchlist/{watchlistId}', [WatchlistController::class, 'removeFromWatchlist']);

        // PAYMENT ROUTES
        Route::post('/payment/add-credits', [PaymentController::class, 'addCredits']);
        Route::get('/payment/balance', [PaymentController::class, 'getBalance']);
        Route::get('/payment/methods', [PaymentController::class, 'getPaymentMethods']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // Admin routes
    Route::middleware(['auth:api', 'admin'])->group(function () {
        // USERS
        Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
        Route::get('/admin/users/{id}', [AdminController::class, 'getUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

        // MOVIES
        Route::post('/admin/movies', [AdminController::class, 'addMovie']);
        Route::put('/admin/movies/{id}', [AdminController::class, 'updateMovie']);
        Route::delete('/admin/movies/{id}', [AdminController::class, 'deleteMovie']);

        // SERIES
        Route::post('/admin/series', [AdminController::class, 'addSeries']);
        Route::put('/admin/series/{id}', [AdminController::class, 'updateSeries']);
        Route::delete('/admin/series/{id}', [AdminController::class, 'deleteSeries']);

        // EPISODES
        Route::post('/admin/series/{seriesId}/seasons/{seasonNumber}/episodes', [AdminController::class, 'addEpisode']);
        Route::put('/admin/episodes/{id}', [AdminController::class, 'updateEpisode']);
        Route::delete('/admin/episodes/{id}', [AdminController::class, 'deleteEpisode']);

        // CATEGORIES
        Route::post('/admin/categories', [AdminController::class, 'addCategory']);
        Route::put('/admin/categories/{id}', [AdminController::class, 'updateCategory']);
        Route::delete('/admin/categories/{id}', [AdminController::class, 'deleteCategory']);

        // STATS
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
    });
});