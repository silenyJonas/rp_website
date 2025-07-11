<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors; // <-- Ujistěte se, že toto je USEd

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <-- PŘIDEJTE TENTO ŘÁDEK pro API routy
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Zde se konfigurují middleware

        // 1. DŮLEŽITÉ pro Laravel Sanctum SPA autentizaci
        // EnsureFrontendRequestsAreStateful middleware je klíčový pro to,
        // aby Sanctum věděl, že se jedná o SPA aplikaci a použil cookies.
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // 2. CORS Middleware
        // HandleCors middleware čte konfiguraci z config/cors.php
        // Je důležité ho přidat globálně nebo do API skupiny.
        $middleware->append(HandleCors::class); // <-- PŘIDEJTE TENTO ŘÁDEK pro CORS

        // Pokud chcete, můžete také definovat aliasy middleware,
        // což je pro auth:sanctum užitečné, ale často se to děje automaticky po instalaci Sanctum
        // $middleware->alias([
        //     'auth.sanctum' => \Laravel\Sanctum\Http\Middleware\AuthenticateWithSanctum::class,
        // ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();