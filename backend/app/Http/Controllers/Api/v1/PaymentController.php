<?php

namespace App\Http\Controllers\Api\v1;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\PaymentMethod; 

class PaymentController extends Controller
{
    public function addCredits(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1|max:1000',
            'payment_method_id' => 'required|string',
            'type' => 'sometimes|string|in:credit_card,paypal'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        try {
            $user = Auth::user();
            
            // CREA O AGGIORNA IL METODO DI PAGAMENTO
            $paymentMethod = PaymentMethod::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'type' => $request->type ?? 'credit_card'
                ],
                [
                    'details' => json_encode([
                        'payment_method_id' => $request->payment_method_id,
                        'last4' => substr($request->payment_method_id, -4),
                        'brand' => 'credit_card'
                    ]),
                    'is_default' => true
                ]
            );

            // Se il metodo di pagamento esiste già, aggiorna i dettagli
            if (!$paymentMethod->wasRecentlyCreated) {
                $paymentMethod->update([
                    'details' => json_encode([
                        'payment_method_id' => $request->payment_method_id,
                        'last4' => substr($request->payment_method_id, -4),
                        'brand' => 'credit_card'
                    ])
                ]);
            }

            // AGGIORNA I CREDITI DELL'UTENTE
            $user->credits += $request->amount;
            $user->save();

            return response()->json([
                'message' => 'Credits added successfully',
                'amount_added' => $request->amount,
                'new_balance' => $user->credits,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => 'txn_' . uniqid()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Payment failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getBalance(Request $request)
    {
        $user = Auth::user();
        
        return response()->json([
            'current_balance' => $user->credits
        ]);
    }

    // Lista metodi di pagamento dell'utente
    public function getPaymentMethods(Request $request)
    {
        $user = Auth::user();
        $paymentMethods = $user->paymentMethods;
        
        return response()->json([
            'payment_methods' => $paymentMethods
        ]);
    }
}