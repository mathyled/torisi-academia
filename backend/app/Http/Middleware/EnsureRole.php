<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if ($request->user()->role !== $role) {
            return response()->json(['message' => 'No autorizado. Se requiere rol: ' . $role], 403);
        }

        return $next($request);
    }
}
