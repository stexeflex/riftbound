import { CampaignStage } from '../models';

// ------------------------- Kampagne -------------------------

export const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: 'stage1', name: 'Randzone des Risses',
    desc: 'Die ersten Ausläufer der Instabilität. Ein guter Ort zum Lernen.',
    stations: ['kampf', 'kampf', 'rast', 'elite'], areaId: 'gebiet1', reward: 60, kerne: 1,
  },
  {
    id: 'stage2', name: 'Zerbrochener Wald',
    desc: 'Zwischen gespaltenen Bäumen lauern Schattenwölfe.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf'], areaId: 'gebiet2', reward: 80, kerne: 1,
  },
  {
    id: 'stage3', name: 'Kristallhöhlen',
    desc: 'Das Licht bricht sich tausendfach – und mit ihm die Realität.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet3', reward: 100, kerne: 1,
  },
  {
    id: 'stage4', name: 'Sturmfestung',
    desc: 'Eine Festung im Auge des Riss-Sturms, gehalten von Wächtern.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet4', reward: 120, kerne: 1,
  },
  {
    id: 'stage5', name: 'Herz des Risses',
    desc: 'Hier wartet Vorax, der Verschlinger. Das Ende der Reise – vorerst.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['vorax'], reward: 150, kerne: 3,
  },
  {
    id: 'stage6', name: 'Echos der Ebene',
    desc: 'Vorax ist gefallen, doch sein Echo ruft ein ganzes Rudel aus dem Riss.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet1', reward: 170, kerne: 1,
  },
  {
    id: 'stage7', name: 'Sporenlabyrinth',
    desc: 'Der Nebelwald wächst in sich selbst hinein und verbirgt den faulenden Koloss.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'boss'], areaId: 'gebiet2', reward: 190, kerne: 2,
  },
  {
    id: 'stage8', name: 'Prismatisches Gefängnis',
    desc: 'Im tiefsten Kristall sitzt der Prismatyrann und bricht jeden Fluchtweg.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet3', reward: 220, kerne: 2,
  },
  {
    id: 'stage9', name: 'Auge des Orkans',
    desc: 'Die Sturmzitadelle öffnet ihr Tor nur für jene, die dem Donner standhalten.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet4', reward: 250, kerne: 3,
  },
  {
    id: 'stage10', name: 'Thron der Leere',
    desc: 'Nyxara versammelt ihre Herolde. Hinter ihr endet selbst das Licht.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['nyxara', 'leerenauge', 'leerenauge'], reward: 320, kerne: 5,
  },
  {
    id: 'stage11', name: 'Aschepfad der Rückkehr',
    desc: 'Die Glutdünen haben sich neu geordnet. Alte Wege enden nun in wandernden Ruinen.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet1',
    reward: 340, kerne: 1,
  },
  {
    id: 'stage12', name: 'Schweigen unter Eis',
    desc: 'Im gefrorenen Hain verstummt selbst der Wind, während das Rudel immer näher rückt.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite'], areaId: 'gebiet2',
    reward: 360, kerne: 1,
  },
  {
    id: 'stage13', name: 'Chor der Splitter',
    desc: 'Jede Facette singt eine andere Zukunft. Nur eine davon führt wieder hinaus.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'elite', 'kampf'], areaId: 'gebiet3',
    reward: 385, kerne: 1,
  },
  {
    id: 'stage14', name: 'Sturm über dem Abgrund',
    desc: 'Die Zitadelle treibt über dem Nullhorizont und lädt jeden Blitz mit Leerenkraft.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'kampf'], areaId: 'gebiet4',
    reward: 410, kerne: 1,
  },
  {
    id: 'stage15', name: 'Siegel der Leere',
    desc: 'Veyla bewacht das erste Siegel der Konvergenz mit einem Schwarm aus Leerenaugen.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['veyla', 'leerenauge'], reward: 470, kerne: 3,
  },
  {
    id: 'stage16', name: 'Glut gegen Frost',
    desc: 'Ein geborstener Riss lässt Sandsturm und Eiswind in derselben Arena aufeinanderprallen.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite', 'kampf'], areaId: 'gebiet1',
    reward: 455, kerne: 1,
  },
  {
    id: 'stage17', name: 'Prisma des Orkans',
    desc: 'Kristalle speichern den Donner der Zitadelle und entladen ihn in unberechenbaren Winkeln.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'elite', 'kampf', 'elite'], areaId: 'gebiet3',
    reward: 485, kerne: 1,
  },
  {
    id: 'stage18', name: 'Krone der fünf Risse',
    desc: 'Aeralis trägt eine Krone aus Risssplittern und ruft einen Blitzdrachen an ihre Seite.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet4',
    bossEncounter: ['aeralis', 'blitzdrache'], reward: 540, kerne: 3,
  },
  {
    id: 'stage19', name: 'Vorhof der Konvergenz',
    desc: 'Vorax kehrt als Echo zurück. Hinter ihm öffnet sich das Tor zum Ursprung des Risses.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'elite', 'kampf', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['vorax', 'leerenauge'], reward: 580, kerne: 4,
  },
  {
    id: 'stage20', name: 'Letzte Konvergenz',
    desc: 'Nyxara und Veyla bündeln die fünf Risse. Diesmal entscheidet sich das Schicksal aller Ebenen.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'elite', 'kampf', 'rast', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['nyxara', 'veyla'], reward: 700, kerne: 7,
  },
];



