import React, { useState, useEffect, useRef } from 'react';
import { OrchidSpecies, NOM059_STATUS_MAP, ConservationStatus } from '../types';
import { resolveSpeciesPhotos, isPhotoUrlHidden } from '../data/samplePhotos';
import { fetchOpenLicensePhotosForSpecies, OpenLicensePhoto } from '../services/openBotanicalPhotos';
import { MexicoDistributionMap } from './MexicoDistributionMap';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Edit3, 
  Camera,
  Check,
  RefreshCw,
  Trash2,
  RotateCcw,
  X,
  Upload,
  ImageOff
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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [openPhotos, setOpenPhotos] = useState<OpenLicensePhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolved = resolveSpeciesPhotos(species);
  const hiddenList = species.hiddenPhotos || [];

  useEffect(() => {
    setSelectedPhotoIndex(0);
    let cancelled = false;
    setLoadingPhotos(true);

    fetchOpenLicensePhotosForSpecies(species.speciesCode, species.scientificName, species.genus)
      .then((found) => {
        if (!cancelled) {
          setOpenPhotos(found);
          setLoadingPhotos(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingPhotos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [species.speciesCode, species.scientificName, species.genus]);

  // Build unified gallery of copyright-free photos for this species (excluding hidden/deleted ones)
  const galleryItems = React.useMemo(() => {
    const list: {
      url: string;
      label: string;
      credit: string;
      license: string;
      isExact: boolean;
    }[] = [];

    const addUnique = (item: {
      url: string;
      label: string;
      credit: string;
      license: string;
      isExact: boolean;
    }) => {
      if (!item.url) return;
      if (isPhotoUrlHidden(item.url, hiddenList)) return;
      const clean = item.url.split('?')[0].trim();
      if (list.some(existing => existing.url === item.url || existing.url.split('?')[0].trim() === clean)) {
        return;
      }
      list.push(item);
    };

    // 1. Custom uploaded photos always show even if noDefaultPhoto is true
    if (species.photoUrl1 && !isPhotoUrlHidden(species.photoUrl1, hiddenList)) {
      addUnique({
        url: species.photoUrl1,
        label: 'Foto Principal',
        credit: species.photoCredit || resolved.credit,
        license: 'Fotografía Seleccionada',
        isExact: true
      });
    }

    if (species.photoUrl2 && !isPhotoUrlHidden(species.photoUrl2, hiddenList)) {
      addUnique({
        url: species.photoUrl2,
        label: 'Hábito / Detalle',
        credit: species.photoCredit || resolved.credit,
        license: 'Fotografía Seleccionada',
        isExact: true
      });
    }

    // If user clicked "Quitar todas las fotos automáticas", stop here unless they uploaded custom photos
    if (species.noDefaultPhoto) {
      return list;
    }

    // 2. Pre-bundled exact Wikimedia Commons photo or genus photo
    if (resolved.photo1) {
      addUnique({
        url: resolved.photo1,
        label: 'Flor Principal',
        credit: resolved.credit,
        license: 'Wikimedia Commons / Libre de Derechos',
        isExact: resolved.isExactSpeciesPhoto
      });
    }

    // 3. Live fetched open-license photos from iNaturalist (CC0/CC-BY) & Wikimedia Commons
    for (const p of openPhotos) {
      addUnique({
        url: p.url,
        label: p.isExactSpecies ? 'Ejemplar Botánico' : `Género ${species.genus}`,
        credit: `${p.source}: ${p.author}`,
        license: p.license,
        isExact: p.isExactSpecies
      });
    }

    // 4. Secondary genus photo if available and not hidden
    if (resolved.photo2) {
      addUnique({
        url: resolved.photo2,
        label: 'Hábito / Planta',
        credit: resolved.credit,
        license: 'Wikimedia / NaturaLista (Licencia Abierta)',
        isExact: false
      });
    }

    return list.slice(0, 8);
  }, [species, resolved, openPhotos, hiddenList]);

  const safeIndex = Math.min(selectedPhotoIndex, Math.max(0, galleryItems.length - 1));
  const activePhoto = galleryItems[safeIndex] || null;

  // Delete a specific photo immediately
  const handleDeletePhoto = (urlToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!urlToRemove) return;

    const cleanRemove = urlToRemove.split('?')[0].trim();

    // Immediately remove from local openPhotos state for instant UI update
    setOpenPhotos(prev =>
      prev.filter(p => p.url !== urlToRemove && p.url.split('?')[0].trim() !== cleanRemove)
    );

    const currentHidden = species.hiddenPhotos || [];
    const nextHidden = Array.from(new Set([...currentHidden, urlToRemove, cleanRemove]));

    const updates: Partial<OrchidSpecies> = {
      hiddenPhotos: nextHidden
    };

    if (species.photoUrl1 === urlToRemove || species.photoUrl1?.split('?')[0].trim() === cleanRemove) {
      updates.photoUrl1 = '';
    }
    if (species.photoUrl2 === urlToRemove || species.photoUrl2?.split('?')[0].trim() === cleanRemove) {
      updates.photoUrl2 = '';
    }

    // If this was the last visible photo in the gallery, mark noDefaultPhoto = true so no fallback pops up
    if (galleryItems.length <= 1) {
      updates.noDefaultPhoto = true;
    }

    onUpdateSpecies(updates);
    setSelectedPhotoIndex(0);
  };

  // Delete ALL photos for this species in 1 click
  const handleClearAllPhotos = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const allCurrentUrls = galleryItems.flatMap(g => [g.url, g.url.split('?')[0].trim()]);
    const nextHidden = Array.from(new Set([...(species.hiddenPhotos || []), ...allCurrentUrls]));

    onUpdateSpecies({
      photoUrl1: '',
      photoUrl2: '',
      noDefaultPhoto: true,
      hiddenPhotos: nextHidden
    });
    setSelectedPhotoIndex(0);
  };

  // Restore hidden photos for this species
  const handleRestoreDeletedPhotos = () => {
    onUpdateSpecies({
      hiddenPhotos: [],
      noDefaultPhoto: false
    });
    setSelectedPhotoIndex(0);
  };

  // Quick 1-tap photo upload from phone camera roll
  const handleQuickPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onUpdateSpecies({
            photoUrl1: dataUrl,
            noDefaultPhoto: false,
            photoCredit: 'Fotografía de: Josué Jacobo (Colección EJJG)'
          });
          setSelectedPhotoIndex(0);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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

  const handleRefreshOpenPhotos = async () => {
    setLoadingPhotos(true);
    const refreshed = await fetchOpenLicensePhotosForSpecies(
      species.speciesCode,
      species.scientificName,
      species.genus,
      true
    );
    setOpenPhotos(refreshed);
    setLoadingPhotos(false);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-28 text-slate-100 animate-in fade-in">
      {/* Hidden File Input for Quick Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleQuickPhotoUpload}
      />

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
        <div className="relative aspect-4/3 bg-slate-950 overflow-hidden flex items-center justify-center">
          {activePhoto ? (
            <>
              <img
                src={activePhoto.url}
                alt={species.scientificName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Open-License Badge on Top Left */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[65%]">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-md flex items-center gap-1">
                  <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{activePhoto.license}</span>
                </span>
              </div>

              {/* Action Buttons on Main Photo (Pin, Upload, Delete) — Always Visible */}
              <div className="absolute bottom-11 inset-x-3 z-20 flex items-center justify-end gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-[10px] shadow-lg flex items-center gap-1 transition-all active:scale-95"
                  title="Subir mi propia foto desde el celular"
                >
                  <Upload className="w-3 h-3 text-emerald-400" />
                  <span>Subir mi foto</span>
                </button>

                {activePhoto.url !== species.photoUrl1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSpecies({
                        photoUrl1: activePhoto.url,
                        noDefaultPhoto: false,
                        photoCredit: `${activePhoto.credit} (${activePhoto.license})`
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow-lg flex items-center gap-1 transition-all active:scale-95"
                    title="Dejar esta foto como principal"
                  >
                    <Check className="w-3 h-3" />
                    <span>Fijar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => handleDeletePhoto(activePhoto.url, e)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] shadow-lg flex items-center gap-1 transition-all active:scale-95"
                  title="Quitar esta foto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar esta foto</span>
                </button>
              </div>

              {/* Photo Attribution Footer */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex justify-between items-end text-[10px] text-slate-300">
                <span className="font-semibold text-white">
                  Autor ficha: {species.authorSignature || 'Josué Jacobo'}
                </span>
                <span className="text-amber-200/90 truncate max-w-[210px]">
                  {activePhoto.credit}
                </span>
              </div>
            </>
          ) : (
            /* Empty Photo State when user deletes all photos */
            <div className="p-6 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <ImageOff className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Fotografías descartadas para esta especie
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Puedes subir tu propia fotografía o restaurar las imágenes de la galería.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir mi foto</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDeletedPhotos}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar fotos</span>
                </button>
              </div>
            </div>
          )}

          {/* Conservation Status Badge on Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-wide backdrop-blur-md border shadow-lg font-mono flex items-center gap-1 ${statusDetail.badgeColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOM-059: {statusDetail.code}</span>
            </span>
          </div>
        </div>

        {/* Open-License Thumbnail Strip (Wikimedia Commons & NaturaLista CC) */}
        <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📸 Galería ({galleryItems.length})</span>
              {loadingPhotos && <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />}
            </span>

            <div className="flex items-center gap-2">
              {galleryItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPhotos}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-0.5 bg-red-950/40 px-2 py-0.5 rounded-lg border border-red-500/30"
                  title="Quitar todas las fotos de esta especie"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar todas</span>
                </button>
              )}

              {((species.hiddenPhotos?.length || 0) > 0 || species.noDefaultPhoto) && (
                <button
                  type="button"
                  onClick={handleRestoreDeletedPhotos}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20"
                  title="Restaurar fotos eliminadas de esta especie"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRefreshOpenPhotos}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Buscar más fotos libres en Wikimedia e iNaturalist"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Buscar más</span>
              </button>
            </div>
          </div>

          {galleryItems.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.url + idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                    safeIndex === idx
                      ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-800 opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={`${species.scientificName} vista ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(item.url, e)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md z-10"
                    title="Eliminar esta foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {item.isExact && (
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] font-bold text-white text-center leading-tight py-0.2">
                      Especie
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
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

            {/* Official SEMARNAT Status Selector */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {officialStatuses.map(item => {
                const isSelected = statusDetail.code === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onUpdateSpecies({ conservationStatus: item.code })}
                    title={`${item.label}: ${item.desc}`}
                    className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
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
        canEdit={true}
        onUpdateStates={(newStates) => onUpdateSpecies({ mexicoStates: newStates })}
        onUpdateCustomMapUrl={(url) => onUpdateSpecies({ customMapUrl: url })}
      />

      {/* Quick Edit Action */}
      <button
        onClick={onOpenEditor}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
      >
        <Edit3 className="w-4 h-4" />
        <span>Editar Ficha Completa de {species.scientificName}</span>
      </button>
    </div>
  );
};
