<?php

return [

    /*
     * You can enable or disable CORS for your application.
     * By default, it's enabled.
     */
    'enabled' => true,

    /*
     * The paths that are allowed to make CORS requests.
     * Laravel Sanctum pro SPA autentizaci potřebuje `/sanctum/csrf-cookie`.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
     * The domains from which to allow CORS requests.
     * ZDE NAHRAĎTE 'http://localhost:4200' URL VAŠÍ ANGULAR APLIKACE!
     * Pro vývoj můžete použít ['*'] pro všechny domény, ale na produkci je to nebezpečné.
     */
    'allowed_origins' => ['*'], // Zkuste případně i 'http://127.0.0.1:4200'
    'supports_credentials' => true,

    /*
     * The HTTP methods that are allowed.
     */
    'allowed_methods' => ['*'], // Povoluje všechny metody (GET, POST, PUT, DELETE, OPTIONS, etc.)

    /*
     * The headers that are allowed.
     */
    'allowed_headers' => ['*'], // Povoluje všechny hlavičky

    /*
     * The headers that are exposed to the browser.
     */
    'exposed_headers' => [],

    /*
     * The maximum age for the preflight request in seconds.
     */
    'max_age' => 0,

    /*
     * Whether to support credentials (cookies, HTTP authentication, etc.).
     * TOTO JE DŮLEŽITÉ pro Laravel Sanctum SPA autentizaci!
     */
    'supports_credentials' => true,

];