import React, { useState } from 'react';
import { OrchidSpecies, NOM059_STATUS_MAP, ConservationStatus } from '../types';
import { GENUS_SAMPLE_PHOTOS } from '../data/samplePhotos';
import { MexicoDistributionMap } from './MexicoDistributionMap';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Edit3, 
  Share2, 
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface MobileBotanicalViewProps {
  species: OrchidSpecies;
  canEdit: boolean;
  onOpenEditor: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateSpecies: (updated: Partial<OrchidSpecies>) => void;
}

export const MobileBotanicalView: React.FC<MobileBotanicalViewProps> = ({
  species,
  canEdit,
  onOpenEditor,
  onPrev,
  onNext,
  onUpdateSpecies
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<1 | 2>(1);
  const genusSample = GENUS_SAMPLE_PHOTOS[species.genus] || GENUS_SAMPLE_PHOTOS.Default;
  const photo1 = species.photoUrl1 || genusSample.photo1;
  const photo2 = species.photoUrl2 || genusSample.photo2;

  const currentPhoto = selectedPhoto === 1 ? photo1 : photo2;

  // Retrieve official NOM-059 details
  const rawStatus = (species.conservationStatus || 'NL').toUpperCase();
  const statusKey = rawStatus === 'PR' ? 'Pr' : rawStatus === 'NC' ? 'NL' : rawStatus;
  const statusDetail = NOM059_STATUS_MAP[statusKey] || NOM059_STATUS_MAP['NL'];

  const officialStatuses: { code: ConservationStatus; label: string; desc: string; color: string }[] = [
    { code: 'P', label: 'P - En peligro de extinción', desc: 'Riesgo biológico crítico', color: 'border-red-500 bg-red-500/20 text-red-300' },
    { code: 'A', label: 'A - Amenazada', desc: 'Peligro a corto/mediano plazo', color: 'border-amber-500 bg-amber-500/20 text-amber-300' },
    { code: 'Pr', label: 'Pr - Protección especial', desc: 'Sujeta a protección especial', color: 'border-emerald-500 bg-emerald-500/20 text-emerald-300' },
    { code: 'E', label: 'E - Probablemente extinta', desc: 'Extinta en medio silvestre', color: 'border-purple-500 bg-purple-500/20 text-purple-300' },
    { code: 'NL', label: 'NL - No listada en NOM-059', desc: 'Silvestre común o fuera de riesgo', color: 'border-slate-600 bg-slate-800 text-slate-300' }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-28 text-slate-100 animate-in fade-in">
      {/* Top Mobile Quick Switcher Bar */}
      <div className="flex items-center justify-between bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-800 shadow-lg">
        <button
          onClick={onPrev}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Especie anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              #{species.speciesCode}
            </span>
            {species.isEndemic && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ⭐ Endémica
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-white font-serif italic truncate max-w-[200px]">
            {species.scientificName}
          </h2>
        </div>

        <button
          onClick={onNext}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Siguiente especie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Photographic Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
          <img
            src={currentPhoto}
            alt={species.scientificName}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Photo Switcher Pills */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            <button
              onClick={() => setSelectedPhoto(1)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md transition-all ${
                selectedPhoto === 1
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Flor Principal
            </button>
            <button
              onClick={() => setSelectedPhoto(2)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md transition-all ${
                selectedPhoto === 2
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Hábito / Planta
            </button>
          </div>

          {/* Conservation Status Badge on Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-wide backdrop-blur-md border shadow-lg font-mono flex items-center gap-1 ${statusDetail.badgeColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOM-059: {statusDetail.code}</span>
            </span>
          </div>

          {/* Photo Attribution Footer */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex justify-between items-end text-[10px] text-slate-300">
            <span className="font-semibold text-white">
              Autor: {species.authorSignature || 'Josué Jacobo'}
            </span>
            <span className="text-slate-400 truncate max-w-[200px]">
              {species.photoCredit}
            </span>
          </div>
        </div>

        {/* Taxonomic Info Body */}
        <div className="p-4 space-y-4">
          <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
            <div>
              <h1 className="text-xl font-serif italic font-bold text-white leading-tight">
                {species.scientificName}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {species.author} • Género: <strong className="text-amber-400 font-serif italic">{species.genus}</strong>
              </p>
            </div>
            <span className="text-2xl">
              {species.emojis?.join('') || '🪻'}
            </span>
          </div>

          {/* Common Name */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-3.5 py-2.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Nombre Común / Vernáculo
            </span>
            <span className="text-sm font-semibold text-white">
              {species.commonName || species.scientificName}
            </span>
          </div>

          {/* Official NOM-059 Conservation Status Card (Corrected Initials) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Estado de Conservación Oficial (NOM-059-SEMARNAT)</span>
              </div>
              {canEdit && (
                <button
                  onClick={onOpenEditor}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>

            {/* Current Active Category Description */}
            <div className={`p-2.5 rounded-xl border mb-3 flex items-start gap-2 text-xs ${statusDetail.badgeColor}`}>
              <span className="font-mono font-black text-sm px-1.5 py-0.5 rounded bg-black/40">
                {statusDetail.code}
              </span>
              <div>
                <div className="font-bold text-slate-100">{statusDetail.name}</div>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  {statusDetail.description}
                </p>
              </div>
            </div>

            {/* Official SEMARNAT Status Selector (Clickable for Admin) */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {officialStatuses.map(item => {
                const isSelected = statusDetail.code === item.code;
                return (
                  <button
                    key={item.code}
                    disabled={!canEdit}
                    onClick={() => canEdit && onUpdateSpecies({ conservationStatus: item.code })}
                    title={`${item.label}: ${item.desc}`}
                    className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? `${item.color} ring-2 ring-emerald-500 font-black shadow-md scale-105`
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="font-mono font-bold text-xs">{item.code}</span>
                    <span className="text-[9px] line-clamp-1 mt-0.5 font-medium">
                      {item.code === 'P' ? 'Peligro' : item.code === 'A' ? 'Amenaz.' : item.code === 'Pr' ? 'Protec.' : item.code === 'E' ? 'Extinta' : 'No List.'}
                    </span>
                  </button>
                );
              })}
            </div>
            {canEdit && (
              <span className="text-[10px] text-slate-500 mt-1.5 block text-center">
                ✏️ Como autor puedes cambiar la categoría tocando los botones
              </span>
            )}
          </div>

          {/* Ecological & Botanical Features Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🌱 Crecimiento</span>
              <span className="font-medium text-slate-200">{species.growthType}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">⛰️ Altitud</span>
              <span className="font-medium text-slate-200">{species.altitude}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🌸 Fragancia</span>
              <span className="font-medium text-slate-200">{species.fragrance}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🐝 Polinizador</span>
              <span className="font-medium text-slate-200">{species.pollinator}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🌿</span>
              <span>Descripción Botánica</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              {species.description}
            </p>
          </div>

          {/* Curious Fact */}
          {species.curiousFact && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Dato Curioso</span>
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed text-justify">
                {species.curiousFact}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Realistic Mexico Distribution Map Component */}
      <MexicoDistributionMap
        speciesStates={species.mexicoStates || []}
        scientificName={species.scientificName}
        customMapUrl={species.customMapUrl}
        canEdit={canEdit}
        onUpdateStates={(newStates) => onUpdateSpecies({ mexicoStates: newStates })}
        onUpdateCustomMapUrl={(url) => onUpdateSpecies({ customMapUrl: url })}
      />

      {/* Admin Quick Edit Action */}
      {canEdit && (
        <button
          onClick={onOpenEditor}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Editar Ficha Completa de {species.scientificName}</span>
        </button>
      )}
    </div>
  );
};
