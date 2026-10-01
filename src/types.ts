export type ConservationStatus = 'E' | 'P' | 'A' | 'PR' | 'NC';

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
