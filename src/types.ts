export type ConservationStatus = 'P' | 'A' | 'Pr' | 'PR' | 'E' | 'NL' | 'NC';

export interface ConservationDetail {
  code: string;
  name: string;
  description: string;
  badgeColor: string;
  textColor: string;
}

export const NOM059_STATUS_MAP: Record<string, ConservationDetail> = {
  P: {
    code: 'P',
    name: 'En Peligro de Extinción',
    description: 'Aquellas especies cuyas áreas de distribución o tamaño poblacional han disminuido drásticamente poniendo en riesgo su viabilidad biológica.',
    badgeColor: 'bg-red-500/20 border-red-500/50 text-red-300',
    textColor: 'text-red-400'
  },
  A: {
    code: 'A',
    name: 'Amenazada',
    description: 'Especies que podrían llegar a encontrarse en peligro de desaparecer a corto o mediano plazo si siguen operando los factores de deterioro.',
    badgeColor: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    textColor: 'text-amber-400'
  },
  Pr: {
    code: 'Pr',
    name: 'Protección Especial',
    description: 'Especies sujetas a protección especial por su reducida distribución o por la necesidad de propiciar su recuperación.',
    badgeColor: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    textColor: 'text-emerald-400'
  },
  PR: {
    code: 'Pr',
    name: 'Protección Especial',
    description: 'Especies sujetas a protección especial por su reducida distribución o por la necesidad de propiciar su recuperación.',
    badgeColor: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    textColor: 'text-emerald-400'
  },
  E: {
    code: 'E',
    name: 'Probablemente Extinta en el Medio Silvestre',
    description: 'Especie nativa de México cuyos ejemplares silvestres han desaparecido, pero existen individuos en cautiverio o cultivo.',
    badgeColor: 'bg-purple-900/30 border-purple-500/40 text-purple-300',
    textColor: 'text-purple-400'
  },
  NL: {
    code: 'NL',
    name: 'No Listada en NOM-059',
    description: 'Especie silvestre común o fuera de riesgo inmediato según los criterios oficiales de SEMARNAT.',
    badgeColor: 'bg-slate-800/80 border-slate-700 text-slate-300',
    textColor: 'text-slate-400'
  },
  NC: {
    code: 'NL',
    name: 'No Listada en NOM-059',
    description: 'Especie silvestre común o fuera de riesgo inmediato según los criterios oficiales de SEMARNAT.',
    badgeColor: 'bg-slate-800/80 border-slate-700 text-slate-300',
    textColor: 'text-slate-400'
  }
};

export interface OrchidSpecies {
  id: string;
  continuousIndex: number;
  speciesCode: string; // e.g. "0001", "0010"
  originalRaw: string;
  scientificName: string;
  genus: string;
  author: string;
  commonName: string;
  isEndemic: boolean;
  endemicNote: string;
  emojis: string[];
  growthType: string;
  altitude: string;
  distribution: string;
  mexicoStates: string[];
  customMapUrl?: string;
  fragrance: string;
  size: string;
  pollinator: string;
  description: string;
  curiousFact: string;
  habitat: string;
  conservationStatus: ConservationStatus;
  photoUrl1?: string;
  photoUrl2?: string;
  photoCredit: string;
  authorSignature: string;
}

export interface KDPGuideSettings {
  showTrimLine: boolean;
  showBleedArea: boolean;
  showSafeZone: boolean;
  showGutterMargin: boolean;
  spineSide: 'left' | 'right' | 'alternate';
}
