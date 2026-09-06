DAKTIS – MODUL LATENTNÍCH STOP
==============================

Spuštění:
- Otevřete index.html v prohlížeči.
- Pro nasazení na web stačí nahrát celý obsah složky na statický hosting.

DŮLEŽITÉ SOUBORY V assets/:
- obalka.jpg              hotová obálka z dodaného obrázku
- stopa1.png až stopa4.png  výřezy skutečných otisků z obálky
- markant1.png až markant4.png  DOČASNÉ ZÁSTUPNÉ OBRÁZKY – nahraďte finálními markantovými mapami
- ot11.png ... ot43.png   DOČASNÉ ZÁSTUPNÉ PORTRÉTY – nahraďte finálními PNG se stejnými názvy

Třetí otisk obsahuje pouze dvě osoby:
- Radka Müllerová (ot31.png)
- Marie Tůmová (ot33.png)
Eliška Pekárková byla z aplikace odstraněna.

Správné biometrické podpisy:
1: O D3 B5 | Y A8
2: O E1 A8 | Y C6 D7 | — C6
3: O A7 | Y C2 B1 | — B6 B7 B8
4: O B4 A6 | Y E3 B4 | — D5

Přednastavené počty polí:
1: 2 / 1 / 0
2: 2 / 2 / 1
3: 1 / 2 / 3
4: 2 / 2 / 1
(pořadí O / Y / —)

Souvislosti:
- Otisk 1: Kristýna Doležalová je skutečná relevantní osoba (nemá nejvyšší procento shody).
- Otisk 2: Tamara Vrbová je skutečná relevantní osoba (nemá nejvyšší procento shody).
- Otisk 3: běžné prověření obou kandidátek vrátí "pravděpodobně nesouvisí"; po prověření obou se spustí rozšířená analýza a zvýrazní se Radka Müllerová.
- Otisk 4: běžné prověření všech tří kandidátů vrátí "pravděpodobně nesouvisí"; po prověření všech se spustí rozšířená analýza a zvýrazní se Karel Liebknecht.

Externí odkaz autoservisu:
V app.js změňte konstantu:
const AUTOSERVIS_URL = "https://example.com/";
na finální URL.
