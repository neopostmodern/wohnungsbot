# Wohnungsbot

Der Wohnungsbot ist Teil der Ausstellung *Von einem der auszog eine Wohnung in Berlin zu finden. Ein Automatisierungsdrama in drei Akten — 2. Akt: Das Versprechen des Bots*

## Info
[Website](https://wohnung.neopostmodern.com/)  
[Ausstellungsansichten (vorläufig)](https://bericht.neopostmodern.com/portfolio/von-einem-der-auszog-eine-wohnung-in-berlin-zu-finden-2-akt)  
[Artikel bei *Tagesspiegel Leute*](https://leute.tagesspiegel.de/neukoelln/unter-nachbarn/2019/09/11/95231/)

## Hinweise
### 32-bit Version für Windows  
Der Wohnungsbot kann an sich für für `ia32` auf Windows gebaut werden. Standardmäßig ist dies allerdings deaktiviert, da bisher kein Weg gefunden wurde die 32-bit Version separat auszuspielen und daher eine wesentlich größere Installationsdatei entstünde die für die große Mehrheit keinen Mehrwert hätte. (PRs gerne gesehen, vgl. u.a. [electron-builder#1897](https://github.com/electron-userland/electron-builder/issues/1897))

Es selbst zu bauen ist aber einfach, mehr dazu im Abschnitt [Build and package](#build-and-package).

## Verweise
- Der Code für die Karte basiert auf [einem schönen Projekt](https://interaktiv.morgenpost.de/mietkarte-berlin/) des Tagesspiegels,
[Code auf Github](https://github.com/funkeinteraktiv/mietkarte)

## Tinkering & contributing

Feel free to tinker with the code base. PRs are very welcome, but should — like the Wohnungsbot —
target a general audience, or at least not hinder it. Please keep in mind that everything is
[AGPL-3.0](https://github.com/neopostmodern/wohnungsbot/blob/master/LICENSE) licensed, a very strong
copyleft license.

### Getting started

Clone the repository, install dependencies and create a configuration file:

```shell script
git clone https://github.com/neopostmodern/wohnungsbot
cd wohnungsbot
npm i
cp app/constants/keys.json.example app/constants/keys.json
```

Then configure `app/constants/keys.json` as needed.

To start the local development version with *partial* hot reload run:

```shell script
npm run-script dev
```
 
### Build instructions

#### Build and package

```shell script
npm run-script package-all
```

Replace `all` with your plattform as needed, see `package.json` for options.

To build for 32-bit Windows add `, 'ia32'` to `build > win > target` in
[package.json:100](https://github.com/neopostmodern/wohnungsbot/blob/master/package.json#L100)
and build with `npm run-script package-win`.

#### Build, package, and publish 

To release to GitHub (for auto-update et cetera) run:

```shell script
GH_TOKEN=__YOUR_GITHUB_TOKEN_HERE__ npm run-script package-publish
```
