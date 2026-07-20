import { DungeonArea } from '../models';

// ------------------------- Dungeon-Gebiete -------------------------

export const DUNGEON_AREAS: DungeonArea[] = [
  {
    id: 'gebiet1', name: 'Die Glutdünen', icon: '🏜️', theme: 'desert',
    background: 'images/dungeons/ember-dunes.png',
    desc: 'Hitzeflimmern, Sandstürme und versunkene Ruinen prägen diesen Wüsten-Run.',
    stations: ['kampf', 'kampf', 'rast', 'elite', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['duenenskarabaeus', 'duenenskarabaeus'], ['sandlaeufer'], ['glutfalke', 'duenenskarabaeus'],
      ['sandlaeufer', 'glutfalke'], ['duenenskarabaeus', 'duenenskarabaeus', 'glutfalke'],
    ],
    eliteEncounters: [['obsidiandjinn'], ['obsidiandjinn', 'duenenskarabaeus']],
    bossEncounter: ['sahrazar'], reward: 150, kern: true,
  },
  {
    id: 'gebiet2', name: 'Der frostgebundene Hain', icon: '❄️', theme: 'winter',
    background: 'images/dungeons/frostbound-grove.png',
    desc: 'Eiswälle, Schwächeeffekte und Rudel machen den Winter-Run kontrolliert und taktisch.',
    stations: ['kampf', 'kampf', 'rast', 'elite', 'kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'],
    normalEncounters: [
      ['schneekobold', 'schneekobold'], ['frostwolf'], ['eisrufer'],
      ['frostwolf', 'schneekobold'], ['eisrufer', 'schneekobold'], ['frostwolf', 'frostwolf'],
    ],
    eliteEncounters: [['aurorawaechter'], ['aurorawaechter', 'schneekobold']],
    bossEncounter: ['frostkoenigin'], reward: 150, kern: true,
  },
  {
    id: 'gebiet3', name: 'Die prismatischen Tiefen', icon: '💎', theme: 'crystal',
    background: 'images/dungeons/prism-depths.png',
    desc: 'Kristallwesen brechen Licht, Raum und unvorsichtige Angriffe.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'],
    normalEncounters: [
      ['kristallkaefer', 'prismamotte'], ['geodenpriester'], ['tiefenorakel'],
      ['kristallkaefer', 'geodenpriester'], ['prismamotte', 'prismamotte', 'kristallkaefer'],
    ],
    eliteEncounters: [['splittergolem'], ['facettenchimaere'], ['facettenchimaere', 'prismamotte']],
    bossEncounter: ['prismatyrann'], reward: 150, kern: true,
  },
  {
    id: 'gebiet4', name: 'Die Sturmzitadelle', icon: '☁️', theme: 'sky',
    background: 'images/dungeons/storm-citadel.png',
    desc: 'Über den Wolken bewachen geladene Konstrukte den Weg zum Sturmarchon.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['sturmspaeher', 'wolkenrochen'], ['funkenkonstrukt'], ['himmelskorsar'],
      ['wolkenrochen', 'wolkenrochen'], ['sturmspaeher', 'himmelskorsar'],
    ],
    eliteEncounters: [['donnerwaechter'], ['blitzdrache'], ['blitzdrache', 'wolkenrochen']],
    bossEncounter: ['aeralis'], reward: 150, kern: true,
  },
  {
    id: 'gebiet5', name: 'Der Nullhorizont', icon: '🌌', theme: 'void',
    background: 'images/dungeons/null-horizon.png',
    desc: 'Jenseits des Risses wartet Nyxara mit ihren Herolden auf den letzten Run.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['leerenauge', 'echogeist'], ['rissassassine'], ['sternenfresser'],
      ['echogeist', 'echogeist', 'leerenauge'], ['sternenfresser', 'rissassassine'],
    ],
    eliteEncounters: [['nullherold'], ['gravitationsritter'], ['gravitationsritter', 'echogeist']],
    bossEncounter: ['veyla'], reward: 150, kern: true,
  },
];



