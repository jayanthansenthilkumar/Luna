<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProfileComplete
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();
        $exempt = ['profile', 'profile.*', 'api.*', 'logout'];

        foreach ($exempt as $pattern) {
            if ($request->routeIs($pattern)) {
                return $next($request);
            }
        }

        if ($user->profile_completion < 100) {
            return redirect()->route('profile', ['incomplete' => 1]);
        }

        return $next($request);
    }
}
