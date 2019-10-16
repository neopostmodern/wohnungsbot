# Wohnungsbot

Der Wohnungsbot ist Teil der Ausstellung *Von einem der auszog eine Wohnung in Berlin zu finden. Ein Automatisierungsdrama in drei Akten — 2. Akt: Das Versprechen des Bots*

## Info
[Website](https://wohnung.neopostmodern.com/)  
[Ausstellungsansichten (vorläufig)](https://bericht.neopostmodern.com/portfolio/von-einem-der-auszog-eine-wohnung-in-berlin-zu-finden-2-akt)  
[Artikel bei *Tagesspiegel Leute*](https://leute.tagesspiegel.de/neukoelln/unter-nachbarn/2019/09/11/95231/)

## Hinweise
### 32-bit Version für Windows  
Der Wohnungsbot kann an sich für für `ia32` auf Windows gebaut werden. Standardmäßig ist dies allerdings deaktiviert, da bisher kein Weg gefunden wurde die 32-bit Version separat auszuspielen und daher eine wesentlich größere Installationsdatei entstünde die für die große Mehrheit keinen Mehrwert hätte. (PRs gerne gesehen, vgl. u.a. [electron-builder#1897](https://github.com/electron-userland/electron-builder/issues/1897))

Es selbst zu bauen ist aber einfach: In [package.json:99](https://github.com/neopostmodern/wohnungsbot/blob/master/package.json#L99) `, 'ia32'` hinzufügen und bauen (`npm run-script package-win`).

## Verweise
- Der Code für die Karte basiert auf [einem schönen Projekt](https://interaktiv.morgenpost.de/mietkarte-berlin/) des Tagesspiegels,
[Code auf Github](https://github.com/funkeinteraktiv/mietkarte)

## Build  instructions
Coming soon, quick summary: `git clone https://github.com/neopostmodern/wohnungsbot`, `npm i`, `npm run-script dev`
