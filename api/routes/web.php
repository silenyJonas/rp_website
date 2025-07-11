<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/login', function () {
    // Vrátí prázdnou odpověď nebo přesměruje na Angular login,
    // ale primárně slouží k definování pojmenované routy 'login'
    return response('Unauthorized.', 401);
})->name('login'); // <<<<<<<<< TOTO JE DŮLEŽITÉ: pojmenování routy jako 'login'


Route::get('/', function () {
    return view('welcome');
});