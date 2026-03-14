#!/bin/bash

# --- 1. Nastavení proměnných ---
LARAVEL_DIR="laravel"
echo "🚀 Startuji prvotní konfiguraci serveru..."

# --- 2. Přesun do složky Laravelu ---
cd "$LARAVEL_DIR" || { echo "❌ CHYBA: Složka $LARAVEL_DIR neexistuje!"; exit 1; }

# --- 3. Composer Install ---
echo "📦 Instaluji závislosti..."
composer install --no-dev --optimize-autoloader

# --- 4. Příprava .env souboru ---
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env vytvořen. !!! NYNÍ JE NUTNÉ HO RUČNĚ UPRAVIT (DB, URL) !!!"
fi

# Zastávka na úpravu .env
read -p "📝 Upravil jsi .env? Stiskni [Enter] pro pokračování..."

# --- 5. Generování klíče a cache ---
php artisan key:generate --force
php artisan config:clear
php artisan cache:clear

# --- 6. Storage link (uvnitř Laravelu) ---
php artisan storage:link --force

# --- 7. NASTAVENÍ PRÁV (To, na co ses ptal) ---
echo "🔓 Nastavuji zápisová práva pro storage a cache..."
chmod -R 775 storage bootstrap/cache
# Pokud tvůj server vyžaduje vlastnictví pro www-data uživatele, odkomentuj řádek níže:
# chown -R www-data:www-data storage bootstrap/cache

# --- 8. Externí Symlink (v kořenu www) ---
echo "🔗 Vytvářím veřejný symlink pro www..."
cd ..
rm -rf storage # Smaže starý, pokud existuje
ln -s "$LARAVEL_DIR/storage/app/public" storage

echo "✨ VŠE HOTOVO!"