import React, { useState } from 'react';
import { OrchidSpecies } from '../types';
import { GENUS_SAMPLE_PHOTOS } from '../data/samplePhotos';
import { MexicoDistributionMap } from './MexicoDistributionMap';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  Camera, 
  Edit3, 
  Share2, 
  Layers,
  CheckCircle2
} from 'lucide-react';

interface MobileBotanicalViewProps {
  species: OrchidSpecies;
  canEdit: boolean;
  onOpenEditor: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSwitchTo6x9: () => void;
  onUpdateSpecies: (updated: Partial<OrchidSpecies>) => void;
}

export const MobileBotanicalView: React.FC<MobileBotanicalViewProps> = ({
  species,
  canEdit,
  onOpenEditor,
  onPrev,
  onNext,
  onSwitchTo6x9,
  onUpdateSpecies
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<1 | 2>(1);
  const genusSample = GENUS_SAMPLE_PHOTOS[species.genus] || GENUS_SAMPLE_PHOTOS.Default;
  const photo1 = species.photoUrl1 || genusSample.photo1;
  const photo2 = species.photoUrl2 || genusSample.photo2;

  const currentPhoto = selectedPhoto === 1 ? photo1 : photo2;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 text-slate-100 animate-in fade-in">
      {/* Top Mobile Quick Switcher Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={onPrev}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center px-2">
          <span className="font-mono text-amber-400 font-bold text-xs">
            #{species.speciesCode}
          </span>
          <h2 className="text-sm font-bold text-white font-serif italic truncate max-w-[200px]">
            {species.scientificName}
          </h2>
        </div>

        <button
          onClick={onNext}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Photographic Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
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
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md transition-all ${
                selectedPhoto === 1
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-black/60 text-slate-300 hover:text-white'
              }`}
            >
              Flor Principal
            </button>
            <button
              onClick={() => setSelectedPhoto(2)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md transition-all ${
                selectedPhoto === 2
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-black/60 text-slate-300 hover:text-white'
              }`}
            >
              Hábito / Inflorescencia
            </button>
          </div>

          {/* Endemic & Status Badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {species.isEndemic && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                ⭐ Endémica de México
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono">
              NOM-059: {species.conservationStatus}
            </span>
          </div>

          {/* Author signature footer over photo */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-end text-[10px] text-slate-300">
            <span className="font-semibold text-white">
              Autor: {species.authorSignature || 'Josué Jacobo'}
            </span>
            <span className="text-slate-400 truncate max-w-[180px]">
              {species.photoCredit}
            </span>
          </div>
        </div>

        {/* Taxonomic Info Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
            <div>
              <h1 className="text-lg font-serif italic font-bold text-white leading-tight">
                {species.scientificName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {species.author} • Género: <strong className="text-amber-400">{species.genus}</strong>
              </p>
            </div>
            <span className="text-xl">
              {species.emojis?.join('') || '🪻'}
            </span>
          </div>

          {/* Common Name */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Nombre Común
            </span>
            <span className="text-sm font-semibold text-white">
              {species.commonName || species.scientificName}
            </span>
          </div>

          {/* Ecological Quick Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🌱 Tipo de crecimiento</span>
              <span className="font-medium text-slate-200">{species.growthType}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">⛰️ Rango Altitudinal</span>
              <span className="font-medium text-slate-200">{species.altitude}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🌸 Fragancia</span>
              <span className="font-medium text-slate-200">{species.fragrance}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">🐝 Polinizador</span>
              <span className="font-medium text-slate-200">{species.pollinator}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🌿</span>
              <span>Descripción Botánica</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              {species.description}
            </p>
          </div>

          {/* Curious Fact */}
          {species.curiousFact && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Dato Curioso</span>
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed text-justify">
                {species.curiousFact}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mexico Distribution Map Component */}
      <MexicoDistributionMap
        speciesStates={species.mexicoStates || []}
        scientificName={species.scientificName}
        canEdit={canEdit}
        onUpdateStates={(newStates) => onUpdateSpecies({ mexicoStates: newStates })}
      />

      {/* Switch to 6x9 Canva Preview Button */}
      <div className="flex gap-2">
        <button
          onClick={onSwitchTo6x9}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-md transition-all"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Ver Ficha 6" × 9" KDP Impresión</span>
        </button>

        {canEdit && (
          <button
            onClick={onOpenEditor}
            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </div>
    </div>
  );
};
