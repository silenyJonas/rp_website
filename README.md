# 🚀 Prvotní konfigurace serveru

Po nahrání obsahu složky `www` na server postupujte podle těchto kroků:

## 1. Příprava databáze

* Exportujte lokální databázi (SQL dump).
* Na produkčním serveru vytvořte novou (nebo pokud byla přidělená poskytovatelem internetových služeb stávající) databázi a importujte do ní stažený SQL soubor.

## 2. Nastavení práv skriptu

Připojte se přes SSH do kořenové složky webu (www) a povolte spuštění konfiguračního skriptu příkazem:

```bash
chmod +x configura-server.sh
```

pokd server neumožňuje spouštění .sh scriptů lze napsat příkazy mauálně z configura-server.txt

## 3. Spuštění konfigurace

Spusťte skript a postupujte podle pokynů na obrazovce. Během procesu budete vyzváni k úpravě souboru .env (nastavení DB a domény):

```bash
./configura-server.sh
```

## Poznámka

* Skript automaticky nainstaluje závislosti (Composer)
* vygeneruje klíče, vyčistí cache, nastaví zápisová práva pro složky
* Laravelu a vytvoří potřebné symlinky pro správné zobrazení médií
