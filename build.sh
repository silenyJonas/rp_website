#!/bin/bash

# 1. Nastavení cest (relativně k umístění skriptu)
PROJECT_ROOT=$(pwd)
ANGULAR_PATH="$PROJECT_ROOT/erp"
DIST_PATH="$ANGULAR_PATH/dist/rp_website/browser"
TARGET_PATH="$PROJECT_ROOT/docs"

echo "------------------------------------------"
echo "🚀 START: Build a Deployment (Fedora 42)"
echo "------------------------------------------"

# 2. Vstup do Angular složky a build
echo "📦 1/3: Kompiluji Angular v $ANGULAR_PATH..."
cd "$ANGULAR_PATH" || exit

# Spuštění buildu
ng build --configuration production

# Kontrola, zda build proběhl úspěšně
if [ $? -ne 0 ]; then
    echo "❌ [CHYBA] Build Angularu selhal! Přerušuji skript."
    exit 1
fi

# 3. Vyčištění a příprava složky docs
echo "🧹 2/3: Čistím cílovou složku $TARGET_PATH..."
if [ -d "$TARGET_PATH" ]; then
    # Mažeme obsah, ale ponecháme složku (bezpečnější)
    rm -rf "${TARGET_PATH:?}"/*
else
    mkdir -p "$TARGET_PATH"
fi

# 4. Kopírování souborů
echo "📂 3/3: Kopíruji soubory z $DIST_PATH..."
if [ -d "$DIST_PATH" ]; then
    cp -r "$DIST_PATH"/. "$TARGET_PATH/"
    echo "✅ [HOTOVO] Web byl úspěšně nasazen do /docs"
else
    echo "❌ [CHYBA] Složka s buildem neexistuje!"
    exit 1
fi

echo "------------------------------------------"