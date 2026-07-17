# Riftbound

Ein rundenbasiertes Roguelite-Kartenspiel im Stil von Slay the Spire – mit permanentem Metafortschritt.

**🎮 Spielen:** https://stexeflex.github.io/riftbound/

## Features (erste Version)

- **Kampfsystem:** 3 Energie pro Zug, 5 Handkarten, Schild, Gegner zeigen ihre Absichten an
- **Resonanz:** Spiele 3 verschiedene Kartenkategorien (Kraft, Schutz, Kontrolle, Chaos) in einem Zug für Bonuseffekte
- **Run-Ablauf:** Kämpfe, Elitegegner, Rastplätze und ein Bosskampf gegen Vorax, den Verschlinger
- **Artefakte:** Wähle vor jedem Run ein Artefakt (Glasherz, Schildkern, Dornenkrone)
- **Metafortschritt:** Splitter und Kerne bleiben nach jedem Run erhalten; Upgrades wie Klingenmeisterschaft (im Browser gespeichert)

## Entwicklung

```bash
npm install
npm start        # Dev-Server auf http://localhost:4200
npm run build    # Produktions-Build
npm run deploy   # Baut und veröffentlicht auf GitHub Pages (gh-pages-Branch)
```

Erstellt mit Angular 22. Deployment auf GitHub Pages über den `gh-pages`-Branch.
