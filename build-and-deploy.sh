#!/bin/bash

# 1. Nastavení cest (předpokládáme spuštění z kořene projektu)
PROJECT_ROOT=$(pwd)
ANGULAR_PATH="$PROJECT_ROOT/erp"
API_PATH="$PROJECT_ROOT/api"
DOTFILES_PATH="$PROJECT_ROOT/dotfiles"
WWW_PATH="$PROJECT_ROOT/www"
LARAVEL_TARGET="$WWW_PATH/laravel"
# Cesta k buildu Angularu (ověř si ji podle angular.json)
DIST_PATH="$ANGULAR_PATH/dist/rp_website/browser"

echo "------------------------------------------"
echo "🚀 START: Komplexní Build a Deployment"
echo "------------------------------------------"

# 2. Příprava složky /www
echo "🧹 1/4: Příprava cílové složky $WWW_PATH..."
if [ -d "$WWW_PATH" ]; then
    # Smažeme vnitřek, ale složku necháme
    rm -rf "${WWW_PATH:?}"/*
    echo "   - Složka vyčištěna."
else
    mkdir -p "$WWW_PATH"
    echo "   - Složka vytvořena."
fi

# 3. Build Angularu
echo "📦 2/4: Kompiluji Angular v $ANGULAR_PATH..."
cd "$ANGULAR_PATH" || exit
ng build --configuration production

if [ $? -ne 0 ]; then
    echo "❌ [CHYBA] Build Angularu selhal!"
    exit 1
fi

# Kopírování Angularu do /www
cp -r "$DIST_PATH"/. "$WWW_PATH/"
echo "   - Angular nakopírován do /www"

# 4. Kopírování API (Laravel)
echo "📂 3/4: Příprava Laravelu v $LARAVEL_TARGET..."
mkdir -p "$LARAVEL_TARGET"
if [ -d "$API_PATH" ]; then
    cp -r "$API_PATH"/. "$LARAVEL_TARGET/"
    echo "   - Laravel (api) nakopírován do /www/laravel"
else
    echo "⚠️  [VAROVÁNÍ] Složka /api neexistuje, přeskakuji."
fi

# 5. Kopírování dotfiles
echo "⚙️  4/4: Kopíruji konfigurační soubory (dotfiles)..."
if [ -d "$DOTFILES_PATH" ]; then
    # Kopírujeme vše včetně skrytých souborů (tečka na konci)
    cp -r "$DOTFILES_PATH"/. "$WWW_PATH/"
    echo "   - Dotfiles nakopírovány do /www"
else
    echo "⚠️  [VAROVÁNÍ] Složka /dotfiles neexistuje, přeskakuji."
fi

echo "------------------------------------------"
echo "✅ [HOTOVO] Kompletní nasazení dokončeno v /www"
echo "------------------------------------------"