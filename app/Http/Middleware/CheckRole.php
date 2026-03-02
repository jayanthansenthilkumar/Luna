<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            return $request->expectsJson()
                ? response()->json(['status' => 401, 'message' => 'Please login first'], 401)
                : redirect()->route('login');
        }

        if (!in_array(auth()->user()->role, $roles)) {
            return $request->expectsJson()
                ? response()->json(['status' => 403, 'message' => 'Access denied'], 403)
                : redirect()->route('dashboard');
        }

        return $next($request);
    }
}
