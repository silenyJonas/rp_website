# NÁZEV PROJEKTU: RPSW WEB FRAMEWORK

- Tato aplikace slouží jako komerční, plně rozšiřitelný základ (boilerplate) pro budování dalších projektů. Je postavena na moderním technologickém stacku s důrazem na objektově orientované programování (OOP), bezpečnost a striktní oddělení logiky mezi veřejnou a administrativní částí.

## 1. ARCHITEKTURA A KONCEPT

- Aplikace je rozdělena do dvou hlavních modulů s odděleným přístupem k datům:
  - PUBLIC ČÁST: Komunikuje výhradně přes Public Data Providery. Určena pro koncové uživatele.
  - ADMIN ČÁST (INTRANET): Zabezpečená zóna pod autentizací, která komunikuje pouze přes Admin Data Providery. Slouží ke správě obsahu a systému.

### Hlavní pilíře

- **Strong OOP:** Veškerý kód využívá pokročilé prvky objektového programování pro maximální znovupoužitelnost.
- **Rozšiřitelnost:** Architektura API i databáze je navržena tak, aby bylo možné snadno přidávat nové moduly bez zásahu do jádra.
- **Security:** Token-based autentizace a striktní Role-Based Access Control (RBAC).

## 2. TECHNOLOGICKÝ STACK

- **Frontend:** Angular (silně komponentová struktura)
- **Backend:** Laravel (robustní API endpointy)
- **Databáze:** MySQL
- **Autentizace:** Token-based (JWT/Sanctum)
- **Lokalizace:** Multi-language podpora (JSON format fetching)
- **Protokol:** Plná podpora SSL (včetně implementace pro lokální vývoj)

## 3. KLÍČOVÉ FUNKCE

- **Dynamická správa obsahu:** Editace veškerých textů na frontendu přímo z administrace.
- **Lokalizační servis:** Texty jsou spravovány v JSON formátu, který je dynamicky fetchován ze serveru dle zvoleného jazyka.
- **Správa médií:** Kompletní podpora pro nahrávání, ukládání a zobrazování obrázků.
- **Logging System:** Detailní logování veškerých akcí probíhajících na frontendu i backendu pro auditní účely.
- **Global Loading:** Jednotný objektový systém pro indikaci načítání napříč celou aplikací.
- **Responzivita:** Plně adaptivní rozhraní pro mobilní zařízení i desktopy.

## 4. BEZPEČNOST A PŘÍSTUPY

- **Role-Based Access Control (RBAC):** Definování oprávnění na základě rolí uživatelů.
- **Data Provider Separation:** Striktní oddělení logiky odesílání a přijímání dat mezi veřejnou a privátní částí.
- **Intranet:** Administrativní část funguje jako uzavřený intranetový systém dostupný pouze autorizovaným subjektům.

## 5. INSTALACE A NASAZENÍ

- Vzhledem ke komplexnosti robustního základu a specifickým požadavkům na serverové prostředí (včetně SSL certifikátů pro lokální vývoj) postupujte podle detailního návodu v samostatném souboru:

- Dokumentace k instalaci: [server_setup.md]

### Stručný přehled kroků

- Klonování repozitáře.
- Konfigurace environmentálních proměnných (.env).
- Instalace závislostí (Composer pro backend, NPM pro frontend).
- Migrace databáze a seeding základních rolí.
- Nastavení lokálního SSL.

## 6. ROZŠÍŘENÍ PRO DALŠÍ PROJEKTY

- Tato aplikace je "živý organismus" připravený k větvení. Díky silnému důrazu na čistý kód a OOP stačí pro nový projekt:

- Rozšířit existující Base Entity a Modely.
- Přidat specifické komponenty do Angularu.
- Definovat nové API endpointy v rámci stávající struktury Providerů.

## 7. LICENCE A UŽITÍ

- Tento software je komerční produkt. Jakékoli šíření nebo použití pro jiné než definované účely podléhá licenční smlouvě.

Copyright (c) 2026. Všechna práva vyhrazena.
