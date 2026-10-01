import React, { useRef } from 'react';
import { OrchidSpecies, KDPGuideSettings, ConservationStatus } from '../types';
import { GENUS_SAMPLE_PHOTOS } from '../data/samplePhotos';
import { Upload, Camera, Sparkles, Check, Info } from 'lucide-react';

interface OrchidCard6x9Props {
  species: OrchidSpecies;
  kdpGuides: KDPGuideSettings;
  onUpdateSpecies: (updated: Partial<OrchidSpecies>) => void;
  onOpenEditor: () => void;
  scale?: number;
}

export const OrchidCard6x9: React.FC<OrchidCard6x9Props> = ({
  species,
  kdpGuides,
  onUpdateSpecies,
  onOpenEditor,
  scale = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Fallback photo based on genus
  const genusSample = GENUS_SAMPLE_PHOTOS[species.genus] || GENUS_SAMPLE_PHOTOS.Default;
  const photo1 = species.photoUrl1 || genusSample.photo1;
  const photo2 = species.photoUrl2 || genusSample.photo2;
  const credit = species.photoCredit || genusSample.credit;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecond = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (isSecond) {
        onUpdateSpecies({ photoUrl2: result });
      } else {
        onUpdateSpecies({ photoUrl1: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStatusClick = (status: ConservationStatus) => {
    onUpdateSpecies({ conservationStatus: status });
  };

  return (
    <div
      className="relative flex items-center justify-center p-2 sm:p-6 transition-all"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center'
      }}
    >
      {/* 
        Container with exact 6 x 9 inches (aspect ratio 2:3).
        In screen preview: 560px width x 840px height.
        In print: exactly 6in x 9in.
      */}
      <div
        id={`orchid-page-${species.speciesCode}`}
        className="print-page-wrapper relative w-[560px] h-[840px] bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between border border-slate-300 select-text"
        style={{
          boxSizing: 'border-box'
        }}
      >
        {/* KDP Bleed / Trim / Safe Zone Overlays (only visible in design mode if enabled) */}
        {kdpGuides.showBleedArea && (
          <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-red-500/40 z-50">
            <span className="absolute top-1 left-1 bg-red-600/80 text-[9px] text-white px-1 rounded">
              Línea de Sangrado (Bleed +0.125")
            </span>
          </div>
        )}
        {kdpGuides.showTrimLine && (
          <div className="absolute inset-[9px] pointer-events-none border border-amber-500/50 z-50">
            <span className="absolute top-1 right-1 bg-amber-600/80 text-[9px] text-white px-1 rounded">
              Corte KDP (Trim 6" × 9")
            </span>
          </div>
        )}
        {kdpGuides.showSafeZone && (
          <div className="absolute inset-[24px] pointer-events-none border border-emerald-500/40 border-dotted z-50">
            <span className="absolute bottom-1 right-1 bg-emerald-600/80 text-[9px] text-white px-1 rounded">
              Zona Segura Interior (Safe Margin 0.375")
            </span>
          </div>
        )}

        {/* ===================== TOP HEADER SECTION ===================== */}
        <div className="bg-[#0b1320] text-white px-5 pt-4 pb-3 flex justify-between items-start border-b-2 border-amber-500/80">
          <div className="flex-1 pr-3">
            {/* Author line */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wider text-slate-300 pb-0.5 border-b-2 border-amber-400 font-sans">
                {species.authorSignature || 'Josué Jacobo'}
              </span>
            </div>

            {/* Scientific name */}
            <h1 className="text-[20px] font-bold tracking-tight text-white leading-tight font-serif italic flex items-baseline gap-2">
              <span>{species.scientificName}</span>
              <span className="text-[12px] font-normal not-italic text-slate-300 font-sans">
                {species.author}
              </span>
            </h1>

            {/* Common name / Subtitle */}
            <div className="mt-0.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide border-b border-amber-500/40 pb-0.5 font-sans">
                {species.commonName || species.scientificName}
              </span>
            </div>

            {/* Family & Endemic Tag */}
            <div className="text-[9.5px] text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
              <span>Familia: <strong className="text-slate-200">Orchidaceae</strong></span>
              {species.isEndemic && (
                <>
                  <span className="text-amber-400">•</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded text-[8.5px] border border-emerald-500/30">
                    {species.endemicNote || 'Endémica de México'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Top Right Pill Badge (Canva style) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Stylized orchid illustration */}
            <div className="w-12 h-12 flex items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-purple-400 fill-current opacity-90 drop-shadow">
                <path d="M50 15 C40 30 25 35 15 45 C5 55 10 70 25 72 C35 73 45 65 50 60 C55 65 65 73 75 72 C90 70 95 55 85 45 C75 35 60 30 50 15 Z" fill="#d946ef" opacity="0.85" />
                <path d="M50 40 C42 45 35 55 40 68 C45 78 55 78 60 68 C65 55 58 45 50 40 Z" fill="#a855f7" />
                <circle cx="50" cy="58" r="6" fill="#facc15" />
              </svg>
            </div>

            {/* Species number pill */}
            <div className="bg-[#fffbeb] border-2 border-amber-400 rounded-xl px-2.5 py-1 text-center shadow-md min-w-[72px]">
              <div className="text-[8px] font-bold text-amber-900 tracking-widest font-sans uppercase">
                ESPECIE
              </div>
              <div className="text-[20px] font-black text-amber-950 font-serif leading-none tracking-tight">
                {species.speciesCode}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== MIDDLE BODY (PHOTOS + TAXONOMIA & FICHA) ===================== */}
        <div className="grid grid-cols-12 gap-2.5 px-4 pt-3 pb-2 flex-shrink-0">
          {/* Left Column: Photos (Canva Dual Split Style) */}
          <div className="col-span-6 flex flex-col justify-between">
            <div className="relative group bg-slate-900 rounded border border-slate-300 overflow-hidden shadow-sm h-[208px]">
              <div className="grid grid-cols-2 h-full gap-0.5 bg-slate-950">
                {/* Photo 1 */}
                <div className="relative h-full overflow-hidden bg-slate-800">
                  <img
                    src={photo1}
                    alt={`${species.scientificName} 1`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Cambiar fotografía 1"
                    className="no-print absolute top-1 left-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                {/* Photo 2 (Split) */}
                <div className="relative h-full overflow-hidden bg-slate-800">
                  <img
                    src={photo2 || photo1}
                    alt={`${species.scientificName} 2`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => fileInputRef2.current?.click()}
                    title="Cambiar fotografía 2 (detalle)"
                    className="no-print absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Photo Attribution Footer (Canva Style) */}
              <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs text-[7.5px] text-amber-200/90 px-2 py-0.5 flex justify-between items-center border-t border-amber-500/20">
                <span className="truncate">{credit}</span>
                <span className="no-print text-[7px] text-slate-300">Clic para cambiar</span>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, false)}
            />
            <input
              ref={fileInputRef2}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, true)}
            />
          </div>

          {/* Right Column: TAXONOMÍA & FICHA BOTÁNICA */}
          <div className="col-span-6 flex flex-col justify-between space-y-2">
            {/* TAXONOMÍA TABLE */}
            <div className="border border-slate-300 rounded overflow-hidden shadow-xs">
              <div className="bg-[#b3e5e8] text-[#005f63] font-bold text-[10px] tracking-widest text-center py-1 font-sans uppercase border-b border-[#82d1d5]">
                TAXONOMÍA
              </div>
              <div className="divide-y divide-slate-200 text-[8.5px] bg-white">
                <div className="grid grid-cols-12 py-1 px-2">
                  <div className="col-span-4 font-semibold text-slate-600 uppercase">FAMILIA</div>
                  <div className="col-span-8 font-bold text-slate-900 underline decoration-slate-400">ORCHIDACEAE</div>
                </div>
                <div className="grid grid-cols-12 py-1 px-2">
                  <div className="col-span-4 font-semibold text-slate-600 uppercase">GÉNERO</div>
                  <div className="col-span-8 font-bold text-slate-900 underline decoration-slate-400">{species.genus.toUpperCase()}</div>
                </div>
                <div className="grid grid-cols-12 py-1 px-2 bg-slate-50/60">
                  <div className="col-span-4 font-semibold text-slate-600 uppercase">ESPECIE</div>
                  <div className="col-span-8 font-serif italic text-slate-900 font-semibold">{species.scientificName}</div>
                </div>
              </div>
            </div>

            {/* FICHA BOTÁNICA */}
            <div className="border border-slate-300 rounded overflow-hidden shadow-xs bg-white">
              <div className="bg-slate-100 text-slate-700 font-bold text-[9px] tracking-wider text-center py-0.5 border-b border-slate-200 font-sans uppercase">
                FICHA BOTÁNICA
              </div>
              <div className="p-1.5 space-y-1 text-[8px] leading-tight text-slate-700">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <span>🌱</span> Crecimiento:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1 truncate max-w-[130px]">
                    {species.growthType}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <span>⛰️</span> Altitud:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1">
                    {species.altitude}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1 flex-shrink-0">
                    <span>🌎</span> Distribución:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1 text-[7.5px] leading-snug line-clamp-2">
                    {species.distribution}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <span>🌸</span> Fragancia:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1 truncate max-w-[130px]">
                    {species.fragrance}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <span>📏</span> Tamaño:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1">
                    {species.size}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1 flex-shrink-0">
                    <span>🐝</span> Polinizador:
                  </span>
                  <span className="text-right text-slate-800 font-medium pl-1 text-[7.5px] truncate max-w-[130px]">
                    {species.pollinator}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== LOWER MIDDLE (DESCRIPCIÓN + DISTRIBUCIÓN EN MÉXICO) ===================== */}
        <div className="grid grid-cols-12 gap-2.5 px-4 flex-1">
          {/* Left Column: DESCRIPCIÓN & DATO CURIOSO */}
          <div className="col-span-8 flex flex-col justify-between pr-1">
            <div>
              <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-900 border-b border-slate-300 pb-0.5 mb-1 font-sans">
                <span>DESCRIPCIÓN</span>
                <span>🌿</span>
              </div>
              <p className="text-[7.8px] text-slate-700 text-justify leading-snug line-clamp-6 font-sans">
                {species.description}
              </p>
            </div>

            {/* DATO CURIOSO */}
            <div className="mt-1 pt-1 border-t border-amber-200 bg-amber-50/70 p-1.5 rounded border border-amber-300/60">
              <div className="text-[8.5px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1 mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>DATO CURIOSO</span>
              </div>
              <p className="text-[7.6px] text-amber-950 text-justify leading-snug line-clamp-3">
                {species.curiousFact}
              </p>
            </div>
          </div>

          {/* Right Column: DISTRIBUCIÓN EN MÉXICO */}
          <div className="col-span-4 border-l border-slate-200 pl-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 font-sans">
                <span>🌐</span>
                <span className="text-[8px] leading-tight">DISTRIBUCIÓN EN MÉXICO</span>
              </div>
              <div className="space-y-0.5 text-[8px] text-slate-700">
                {species.mexicoStates && species.mexicoStates.length > 0 ? (
                  species.mexicoStates.slice(0, 7).map((state, i) => (
                    <div key={i} className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block flex-shrink-0" />
                      <span className="truncate">{state}</span>
                    </div>
                  ))
                ) : (
                  <div className="italic text-slate-400 text-[7.5px]">• En registro botánico</div>
                )}
                {species.mexicoStates && species.mexicoStates.length > 7 && (
                  <div className="text-[7px] text-slate-500 font-semibold italic">
                    + {species.mexicoStates.length - 7} estados más
                  </div>
                )}
              </div>
            </div>

            {/* Mini Botanical Badge */}
            <div className="bg-slate-100 rounded p-1 text-[7px] text-slate-600 text-center border border-slate-200">
              <span className="font-semibold text-slate-800">Atlas Nativo</span>
              <br />
              NOM-059-SEMARNAT
            </div>
          </div>
        </div>

        {/* ===================== LOWER SECTION (HÁBITAT & ESTADO DE CONSERVACIÓN) ===================== */}
        <div className="px-4 pt-1 pb-1 space-y-1.5">
          {/* HÁBITAT BANNER (Canva Styled Forest Texture Background) */}
          <div className="relative rounded overflow-hidden text-white p-2 shadow-inner bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-900/60">
            {/* Subtle background overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80")'
            }} />
            <div className="relative z-10 flex items-start gap-2">
              <span className="bg-yellow-400 text-yellow-950 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-sans flex-shrink-0 shadow-sm">
                HÁBITAT
              </span>
              <p className="text-[7.6px] text-slate-100 leading-snug line-clamp-2">
                {species.habitat}
              </p>
            </div>
          </div>

          {/* ESTADO DE CONSERVACIÓN (NOM-059-SEMARNAT) */}
          <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-800 font-sans">
                <span>🛡️</span>
                <span>ESTADO DE CONSERVACIÓN</span>
                <span className="text-[7px] font-normal text-slate-500">(NOM-059)</span>
              </div>
              <button
                onClick={onOpenEditor}
                className="no-print text-[7.5px] text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <Info className="w-2.5 h-2.5" />
                Editar ficha
              </button>
            </div>

            {/* The 5 Official Status Circles */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { code: 'E', label: 'Probablemente extinta', desc: 'Extinta en estado silvestre', color: 'border-red-500 text-red-700 bg-red-50' },
                { code: 'P', label: 'En peligro', desc: 'En peligro de extinción', color: 'border-amber-600 text-amber-800 bg-amber-50' },
                { code: 'A', label: 'Amenazada', desc: 'Amenazada', color: 'border-yellow-500 text-yellow-800 bg-yellow-50' },
                { code: 'PR', label: 'Protección', desc: 'Sujeta a protección especial', color: 'border-emerald-600 text-emerald-800 bg-emerald-50' },
                { code: 'NC', label: 'No Catalogada', desc: 'No catalogada o fuera de riesgo', color: 'border-slate-400 text-slate-700 bg-slate-100' }
              ].map((item) => {
                const isSelected = species.conservationStatus === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleStatusClick(item.code as ConservationStatus)}
                    title={`${item.code}: ${item.desc} (Clic para seleccionar)`}
                    className={`flex flex-col items-center cursor-pointer transition-transform ${
                      isSelected ? 'scale-105' : 'opacity-65 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border-2 transition-all ${
                        isSelected
                          ? `${item.color} ring-2 ring-emerald-500 ring-offset-1 font-black shadow-sm`
                          : 'border-slate-300 text-slate-400 bg-white'
                      }`}
                    >
                      {item.code}
                    </div>
                    <span className="text-[6.5px] text-slate-600 leading-tight mt-0.5 font-medium line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================== FOOTER SECTION ===================== */}
        <div className="bg-[#0b1320] text-white px-5 py-2 flex items-center justify-between border-t-2 border-slate-900">
          <div className="flex items-center gap-2">
            {/* Logo emblem */}
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[#0b1320] font-black text-[9px]">
              🪻
            </div>
            <div>
              <div className="text-[8px] font-bold tracking-widest text-slate-200 uppercase font-sans">
                ORQUÍDEAS DE MÉXICO
              </div>
              <div className="text-[6.5px] text-slate-400 tracking-wider uppercase font-sans">
                ATLAS VISUAL DE ESPECIES NATIVAS
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold text-amber-400 font-serif tracking-wider">
              Página {species.speciesCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
