import { CampaignStage } from '../models';

// ------------------------- Kampagne -------------------------

export const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: 'stage1', name: 'Randzone des Risses',
    desc: 'Die ersten Ausläufer der Instabilität. Ein guter Ort zum Lernen.',
    stations: ['kampf', 'kampf', 'rast', 'elite'], areaId: 'gebiet1', reward: 60,
  },
  {
    id: 'stage2', name: 'Zerbrochener Wald',
    desc: 'Zwischen gespaltenen Bäumen lauern Schattenwölfe.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf'], areaId: 'gebiet2', reward: 80,
  },
  {
    id: 'stage3', name: 'Kristallhöhlen',
    desc: 'Das Licht bricht sich tausendfach – und mit ihm die Realität.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet3', reward: 100,
  },
  {
    id: 'stage4', name: 'Sturmfestung',
    desc: 'Eine Festung im Auge des Riss-Sturms, gehalten von Wächtern.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet4', reward: 120,
  },
  {
    id: 'stage5', name: 'Herz des Risses',
    desc: 'Hier wartet Vorax, der Verschlinger. Das Ende der Reise – vorerst.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['vorax'], reward: 150, kern: true,
  },
  {
    id: 'stage6', name: 'Echos der Ebene',
    desc: 'Vorax ist gefallen, doch sein Echo ruft ein ganzes Rudel aus dem Riss.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet1', reward: 170,
  },
  {
    id: 'stage7', name: 'Sporenlabyrinth',
    desc: 'Der Nebelwald wächst in sich selbst hinein und verbirgt den faulenden Koloss.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'boss'], areaId: 'gebiet2', reward: 190,
  },
  {
    id: 'stage8', name: 'Prismatisches Gefängnis',
    desc: 'Im tiefsten Kristall sitzt der Prismatyrann und bricht jeden Fluchtweg.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet3', reward: 220,
  },
  {
    id: 'stage9', name: 'Auge des Orkans',
    desc: 'Die Sturmzitadelle öffnet ihr Tor nur für jene, die dem Donner standhalten.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet4', reward: 250,
  },
  {
    id: 'stage10', name: 'Thron der Leere',
    desc: 'Nyxara versammelt ihre Herolde. Hinter ihr endet selbst das Licht.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['nyxara', 'leerenauge', 'leerenauge'], reward: 320, kern: true,
  },
];



