#!/bin/bash

# 1. Nastavení cest
PROJECT_ROOT=$(pwd)
ANGULAR_PATH="$PROJECT_ROOT/erp"
API_PATH="$PROJECT_ROOT/api"
SERVER_CONF_PATH="$PROJECT_ROOT/server_conf"
BUILD_DIR="$PROJECT_ROOT/app_build"
WWW_PATH="$BUILD_DIR/www"
ZIP_NAME="www.zip"
LARAVEL_TARGET="$WWW_PATH/laravel"
DIST_PATH="$ANGULAR_PATH/dist/rp_website/browser"

echo "------------------------------------------"
echo "🚀 START: Komplexní Build a Deployment"
echo "------------------------------------------"

# 2. Příprava složky app_build
echo "🧹 1/7: Příprava cílové složky $BUILD_DIR..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo "   - Starý build odstraněn."
fi
mkdir -p "$WWW_PATH"
echo "   - Složky vytvořeny."

# 3. Build Angularu
echo "📦 2/7: Kompiluji Angular v $ANGULAR_PATH..."
cd "$ANGULAR_PATH" || exit
ng build --configuration production

if [ $? -ne 0 ]; then
    echo "❌ [CHYBA] Build Angularu selhal!"
    exit 1
fi

cp -r "$DIST_PATH"/. "$WWW_PATH/"
echo "   - Angular nakopírován do app_build/www"

# 4. Kopírování API (Laravel)
echo "📂 3/7: Příprava Laravelu v $LARAVEL_TARGET..."
mkdir -p "$LARAVEL_TARGET"
if [ -d "$API_PATH" ]; then
    cp -r "$API_PATH"/. "$LARAVEL_TARGET/"
    echo "   - Laravel (api) nakopírován do app_build/www/laravel"
else
    echo "⚠️  [VAROVÁNÍ] Složka /api neexistuje."
fi

# 5. Kopírování server_conf (včetně .htaccess, .user.ini, configure-server.txt atd.)
echo "⚙️  4/7: Kopíruji konfigurační soubory (server_conf)..."
if [ -d "$SERVER_CONF_PATH" ]; then
    cp -r "$SERVER_CONF_PATH"/. "$WWW_PATH/"
    echo "   - Obsah server_conf nakopírován do app_build/www"
else
    echo "⚠️  [VAROVÁNÍ] Složka /server_conf neexistuje."
fi

# 6. Kopírování dokumentace (do rootu buildu i do www)
echo "📄 5/7: Kopíruji README do obou umístění..."
find_readme() {
    if [ -f "$PROJECT_ROOT/README.md" ]; then echo "$PROJECT_ROOT/README.md"
    elif [ -f "$PROJECT_ROOT/README.txt" ]; then echo "$PROJECT_ROOT/README.txt"
    fi
}

README_SRC=$(find_readme)
if [ -n "$README_SRC" ]; then
    cp "$README_SRC" "$WWW_PATH/"      # Do složky www (půjde do zipu)
    cp "$README_SRC" "$BUILD_DIR/"     # Do rootu app_build (pro rychlý náhled)
    echo "   - README zkopírováno."
fi

# 7. Finální ZIPování (uvnitř app_build)
echo "🗜️  6/7: Vytvářím archiv $ZIP_NAME..."
cd "$BUILD_DIR" || exit
if command -v zip &> /dev/null; then
    zip -r "$ZIP_NAME" www > /dev/null
    echo "   - Archiv vytvořen v $BUILD_DIR/$ZIP_NAME"
else
    echo "❌ [CHYBA] Příkaz 'zip' nenalezen!"
fi

echo "------------------------------------------"
echo "✅ [HOTOVO] Vše připraveno ve složce: /app_build"
echo "------------------------------------------"