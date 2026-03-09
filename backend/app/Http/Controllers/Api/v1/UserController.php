<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller
{
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (Auth::user()->id != $user->id && !Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'surname' => $user->surname,
            'birth_date' => $user->birth_date,
            'subscription_plan' => $user->subscription_plan,
            'subscription_end_date' => $user->subscription_end_date,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
    
        if (Auth::user()->id != $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'surname' => 'sometimes|required|string|max:255',
            'birth_date' => 'sometimes|date',
            'country_code' => 'sometimes|string|max:3',
            'region' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'zip_code' => 'sometimes|string|max:10',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        // Aggiorna solo i campi presenti nella request
        $user->fill($request->only([
            'name', 'surname', 'birth_date', 'country_code', 'region', 'city', 'address', 'zip_code'
        ]));

        $user->save();
    
        return response()->json(['message' => 'User updated successfully']);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (Auth::user()->id != $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}