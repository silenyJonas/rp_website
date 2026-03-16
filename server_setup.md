# 🚀 Prvotní konfigurace serveru

smazat celý obcas serveru celou /www složku  

poznámka: pokud je potřeba vymazat symlinky z pozústalého deploye pustí se tento příkaz:

```bash
find . -type l -delete
```

Po nahrání obsahu složky `www.zip` na server (vznikne z toho /www) postupujte podle těchto kroků:

## 1. Příprava databáze

* Exportujte lokální databázi (SQL dump), sql dump by měl být v app-build složce
* Na produkčním serveru vytvořte novou (nebo pokud byla přidělená poskytovatelem internetových služeb stávající) databázi a importujte do ní stažený SQL soubor.
* pokud server už databázi má vsechny tabulky připojené databáze jdou smazat tímto scriptem:

```bash
SET FOREIGN_KEY_CHECKS = 0;

SET @tables = NULL;
SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables
  FROM information_schema.tables
  WHERE table_schema = (SELECT DATABASE());

SET @views = NULL;
SELECT IF(@tables IS NOT NULL,
  CONCAT('DROP TABLE IF EXISTS ', @tables),
  'SELECT "Databaze je jiz prazdna"'
) INTO @views;

PREPARE stmt FROM @views;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
```

## 2. Nastavení práv skriptu

Připojte se přes SSH do kořenové složky webu (www) a povolte spuštění konfiguračního skriptu příkazem:

```bash
chmod +x configura-server.sh
```

poznámka: pokd server neumožňuje spouštění .sh scriptů je nutné postupovat podle "manual_web_deploy" návodu na sdíleném disku a zbytek tohoto souboru ignorujte

## 3. Spuštění konfigurace

Spusťte skript a postupujte podle pokynů na obrazovce. Během procesu budete vyzváni k úpravě souboru .env (nastavení DB a domény):

```bash
./configura-server.sh
```

## Poznámka

* Skript automaticky nainstaluje závislosti (Composer)
* vygeneruje klíče, vyčistí cache, nastaví zápisová práva pro složky
* Laravelu a vytvoří potřebné symlinky pro správné zobrazení médií

hotovo
