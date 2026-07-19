---
name: riftbound
description: Riftbound ist ein Karten-Rogue-lite-Spiel ähnlich wie Slay the Spire, nur mit Upgrades. Nutze diesen Skill bei allen Fragen und Aufgaben rund um das Riftbound-Spiel – z. B. Karten, Artefakte, Resonanzen, Dungeons, Kampagne, Kampfsystem, Meta-Upgrades oder Balancing.
---

# Riftbound

Riftbound ist ein Karten-Rogue-lite-Spiel ähnlich wie Slay the Spire, nur mit Upgrades. Der Spieler bestreitet Runs durch Dungeons, kämpft mit einem Kartendeck gegen Gegner und schaltet dauerhafte Meta-Upgrades frei.

## Projektüberblick

Das Spiel ist eine Angular-Anwendung (TypeScript, SCSS). Die wichtigsten Bereiche:

- `src/app/game/` – Spiellogik und Zustand
  - `game.service.ts` plus aufgeteilte Services: `game-run.service.ts` (Run-Verwaltung), `game-combat.service.ts` (Kampf), `game-deck.service.ts` (Deck), `game-meta.service.ts` (Meta-Progression)
  - `models.ts` – zentrale Typen und Interfaces
  - `storage.ts` – Speicherstände
  - `data/` – Spieldaten-Module: `cards.data.ts`, `artifacts.data.ts`, `resonances.data.ts`, `enemies.data.ts`, `dungeon-areas.data.ts`, `campaign.data.ts`, `meta-upgrades.data.ts`
- `src/app/screens/` – ein Screen-Component pro Spielansicht (Titel, Kampagne, Dungeons, Map, Kampf, Deck, Karten, Artefakte, Resonanzen, Belohnung, Rast, Sieg, Niederlage, Meta)
- `src/app/styles/` – SCSS-Partials pro Bereich
- `src/app/audio.service.ts` – Musik und Soundeffekte

## Arbeitsweise

- Neue Spielinhalte (Karten, Artefakte, Gegner usw.) gehören in das passende Modul unter `src/app/game/data/` und folgen den dort vorhandenen Datenstrukturen aus `models.ts`.
- Spiellogik-Änderungen gehören in den jeweils zuständigen Service, nicht in die Screen-Components; Screens bleiben Darstellung und Interaktion.
- Bestehende Commit-Sprache ist Deutsch – dabei bleiben.
