<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum stateful API (enables cookie-based auth for SPA)
        $middleware->statefulApi();

        // CORS — must run before routing resolves the request
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        // Locale detection from Accept-Language / user profile / ?lang=
        $middleware->appendToGroup('api', \App\Http\Middleware\SetLocaleFromRequest::class);
        $middleware->appendToGroup('web', \App\Http\Middleware\SetLocaleFromRequest::class);

        // Rate limiting: 60 req/min per IP on API group
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API routes with localized messages
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => __('auth.unauthenticated'),
                ], 401);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => __('http-statuses.404'),
                ], 404);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => __('http-statuses.' . $e->getStatusCode(), [], null) ?? $e->getMessage(),
                ], $e->getStatusCode());
            }
        });
    })->create();
