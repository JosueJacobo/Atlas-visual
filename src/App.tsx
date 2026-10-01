import React, { useState, useEffect, useMemo, useRef } from 'react';
import { OrchidSpecies, KDPGuideSettings, ConservationStatus } from './types';
import { INITIAL_SPECIES_LIST } from './data/speciesData';
import { OrchidCard6x9 } from './components/OrchidCard6x9';
import { OrchidEditorDrawer } from './components/OrchidEditorDrawer';
import { ContinuousIndexModal } from './components/ContinuousIndexModal';
import { GoogleDocsExportModal } from './components/GoogleDocsExportModal';
import { KdpSettingsModal } from './components/KdpSettingsModal';
import { BackupModal } from './components/BackupModal';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  FileText,
  Printer,
  Edit3,
  Shuffle,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Camera,
  Share2,
  Download,
  RotateCcw,
  Check,
  Layers,
  ShieldCheck
} from 'lucide-react';

const STORAGE_KEY = 'atlas_orquideas_mexico_v1';

export default function App() {
  // Load species from localStorage or fallback to INITIAL_SPECIES_LIST
  const [speciesList, setSpeciesList] = useState<OrchidSpecies[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return INITIAL_SPECIES_LIST;
  });

  // Current species index (find Acianthera johnsonii or default to index 10)
  const defaultIdx = useMemo(() => {
    const idx = speciesList.findIndex(s => s.scientificName.toLowerCase().includes('johnsonii'));
    return idx !== -1 ? idx : 0;
  }, [speciesList]);

  const [currentIndex, setCurrentIndex] = useState<number>(defaultIdx);
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [selectedGenusFilter, setSelectedGenusFilter] = useState<string>('all');
  const [filterEndemicOnly, setFilterEndemicOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawer States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);
  const [isKdpModalOpen, setIsKdpModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // KDP Print & Bleed Settings
  const [kdpGuides, setKdpGuides] = useState<KDPGuideSettings>({
    showTrimLine: false,
    showBleedArea: false,
    showSafeZone: false,
    showGutterMargin: false,
    spineSide: 'left'
  });

  // Save to localStorage whenever speciesList changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(speciesList));
    } catch (e) {
      console.warn('LocalStorage quota or serialization error:', e);
    }
  }, [speciesList]);

  // Current active species
  const currentSpecies: OrchidSpecies = speciesList[currentIndex] || speciesList[0];

  // Distinct Genera list for quick filtering
  const popularGenera = useMemo(() => {
    const map = new Map<string, number>();
    speciesList.forEach(s => {
      map.set(s.genus, (map.get(s.genus) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [speciesList]);

  // Filtered list for Grid View or Quick Jump
  const filteredSpecies = useMemo(() => {
    return speciesList.filter(s => {
      const matchSearch =
        s.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speciesCode.includes(searchQuery) ||
        s.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genus.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedGenusFilter !== 'all' && s.genus !== selectedGenusFilter) return false;
      if (filterEndemicOnly && !s.isEndemic) return false;
      return true;
    });
  }, [speciesList, searchQuery, selectedGenusFilter, filterEndemicOnly]);

  // Navigation Handlers
  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : speciesList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < speciesList.length - 1 ? prev + 1 : 0));
  };

  const handleRandom = () => {
    const rand = Math.floor(Math.random() * speciesList.length);
    setCurrentIndex(rand);
  };

  const handleJumpToCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpInput.trim()) return;

    // Search by code or number
    const targetCode = jumpInput.trim().padStart(4, '0');
    const idx = speciesList.findIndex(
      s => s.speciesCode === targetCode || String(s.continuousIndex) === jumpInput.trim()
    );
    if (idx !== -1) {
      setCurrentIndex(idx);
      setJumpInput('');
    } else {
      // Search by text
      const textIdx = speciesList.findIndex(s =>
        s.scientificName.toLowerCase().includes(jumpInput.toLowerCase())
      );
      if (textIdx !== -1) {
        setCurrentIndex(textIdx);
        setJumpInput('');
      }
    }
  };

  const handleUpdateCurrentSpecies = (updated: Partial<OrchidSpecies>) => {
    setSpeciesList(prev => {
      const copy = [...prev];
      copy[currentIndex] = { ...copy[currentIndex], ...updated };
      return copy;
    });
  };

  const handleAddNewSpecies = (newSpecies: OrchidSpecies) => {
    setSpeciesList(prev => [...prev, newSpecies]);
    setCurrentIndex(speciesList.length);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer el catálogo al estado inicial original? Se perderán las fotos personalizadas locales.')) {
      localStorage.removeItem(STORAGE_KEY);
      setSpeciesList(INITIAL_SPECIES_LIST);
      setCurrentIndex(defaultIdx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speciesList.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* ===================== TOP GLOBAL APP BAR ===================== */}
      <header className="no-print bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
            🪻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white font-serif uppercase">
                Atlas de Orquídeas de México
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                6" × 9" KDP
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{speciesList.length} Especies Continuas</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {speciesList.filter(s => s.isEndemic).length} Endémicas
              </span>
            </div>
          </div>
        </div>

        {/* Center: Species Selector / Navigation */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={handlePrev}
            title="Especie anterior (← Flecha izquierda)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-2 text-center min-w-[200px]">
            <span className="font-mono text-amber-400 font-bold text-xs">
              #{currentSpecies.speciesCode}
            </span>{' '}
            <span className="text-xs font-serif italic text-white font-semibold">
              {currentSpecies.scientificName}
            </span>
          </div>

          <button
            onClick={handleNext}
            title="Siguiente especie (→ Flecha derecha)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRandom}
            title="Especie al azar"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors ml-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Quick jump form */}
          <form onSubmit={handleJumpToCode} className="ml-1 flex items-center">
            <input
              type="text"
              placeholder="Ir a # o nombre..."
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </form>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Continuous Catalogue Button */}
          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Catálogo</span>
            <span className="font-mono text-[10px] bg-slate-900 px-1 py-0.2 rounded text-slate-400">
              {speciesList.length}
            </span>
          </button>

          {/* Google Docs Modal */}
          <button
            onClick={() => setIsGoogleDocsModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Docs</span>
          </button>

          {/* Amazon KDP / Print Button */}
          <button
            onClick={() => setIsKdpModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Imprimir / PDF 6x9</span>
          </button>

          {/* Backup & Security Button */}
          <button
            onClick={() => setIsBackupModalOpen(true)}
            title="Copia de seguridad y protección de datos"
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Respaldar</span>
          </button>

          {/* Edit current species drawer */}
          <button
            onClick={() => setIsEditorOpen(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar Ficha</span>
          </button>
        </div>
      </header>

      {/* ===================== SUB-NAV TOOLBAR ===================== */}
      <div className="no-print bg-slate-900/60 border-b border-slate-800/80 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Genera Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-0.5">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex-shrink-0">
            Género:
          </span>
          <button
            onClick={() => setSelectedGenusFilter('all')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
              selectedGenusFilter === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos ({speciesList.length})
          </button>

          {popularGenera.map(gen => (
            <button
              key={gen}
              onClick={() => setSelectedGenusFilter(gen)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-serif italic whitespace-nowrap transition-colors ${
                selectedGenusFilter === gen
                  ? 'bg-amber-500 text-slate-950 font-bold not-italic'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {gen}
            </button>
          ))}

          <button
            onClick={() => setFilterEndemicOnly(prev => !prev)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-colors ${
              filterEndemicOnly
                ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌿 Solo Endémicas
          </button>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* View switcher */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('card')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ficha 6x9
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Muestrario ({filteredSpecies.length})
            </button>
          </div>

          {/* Zoom controls (for card view) */}
          {viewMode === 'card' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-slate-400">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.65, prev - 0.1))}
                className="p-1 hover:text-white"
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 w-10 text-center text-slate-200">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
                className="p-1 hover:text-white"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* KDP Guides Quick Toggle */}
          <button
            onClick={() =>
              setKdpGuides(prev => ({
                ...prev,
                showTrimLine: !prev.showTrimLine,
                showSafeZone: !prev.showSafeZone
              }))
            }
            title="Alternar guías de corte y margen KDP"
            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
              kdpGuides.showTrimLine
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guías KDP</span>
          </button>
        </div>
      </div>

      {/* ===================== MAIN CANVAS / WORKSPACE ===================== */}
      <main className="flex-1 overflow-auto p-3 sm:p-6 flex flex-col items-center justify-start bg-[#0a0f1d]">
        {viewMode === 'card' ? (
          <div className="w-full flex flex-col items-center">
            {/* Quick Navigation pill */}
            <div className="no-print flex items-center justify-between w-full max-w-xl mb-3 text-xs text-slate-400 px-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 hover:text-amber-400 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior (Pág. {speciesList[currentIndex === 0 ? speciesList.length - 1 : currentIndex - 1]?.speciesCode})</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 font-bold">
                  {currentIndex + 1} de {speciesList.length}
                </span>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar datos
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 hover:text-amber-400 transition-colors font-medium"
              >
                <span>Siguiente (Pág. {speciesList[currentIndex === speciesList.length - 1 ? 0 : currentIndex + 1]?.speciesCode})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* THE EXACT 6x9 CANVA-STYLED PAGE */}
            <OrchidCard6x9
              species={currentSpecies}
              kdpGuides={kdpGuides}
              onUpdateSpecies={handleUpdateCurrentSpecies}
              onOpenEditor={() => setIsEditorOpen(true)}
              scale={zoomLevel}
            />
          </div>
        ) : (
          /* ===================== GRID / BOOK GALLERY VIEW ===================== */
          <div className="w-full max-w-7xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Muestrario de Páginas KDP 6" × 9"</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({filteredSpecies.length} especies mostradas)
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Haz clic en cualquier ficha para abrirla a tamaño completo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredSpecies.map(item => {
                const isSelected = item.id === currentSpecies.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(item.continuousIndex - 1);
                      setViewMode('card');
                    }}
                    className={`group relative bg-white text-slate-900 rounded-lg overflow-hidden border-2 cursor-pointer shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                    style={{ aspectRatio: '2 / 3' }}
                  >
                    {/* Header bar */}
                    <div className="bg-[#0b1320] text-white p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-amber-400 font-bold">
                          {item.speciesCode}
                        </span>
                        {item.isEndemic && (
                          <span className="text-[8px] bg-emerald-900 text-emerald-300 px-1 rounded font-bold">
                            Endémica
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-serif font-bold italic truncate mt-0.5">
                        {item.scientificName}
                      </div>
                    </div>

                    {/* Photo preview */}
                    <div className="flex-1 bg-slate-900 overflow-hidden relative">
                      <img
                        src={item.photoUrl1 || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80'}
                        alt={item.scientificName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white font-medium">
                          Abrir Ficha 6×9 →
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-1.5 bg-slate-50 border-t border-slate-200 text-[9px] flex justify-between items-center text-slate-700">
                      <span className="truncate font-semibold">{item.genus}</span>
                      <span className="font-mono text-slate-500 font-bold">
                        Pág. {item.speciesCode}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODALS & DRAWERS ===================== */}
      <OrchidEditorDrawer
        species={currentSpecies}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleUpdateCurrentSpecies}
      />

      <ContinuousIndexModal
        speciesList={speciesList}
        currentIndex={currentIndex}
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectSpecies={idx => setCurrentIndex(idx)}
        onAddNewSpecies={handleAddNewSpecies}
      />

      <GoogleDocsExportModal
        species={currentSpecies}
        speciesList={speciesList}
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
      />

      <KdpSettingsModal
        kdpGuides={kdpGuides}
        onUpdateGuides={upd => setKdpGuides(prev => ({ ...prev, ...upd }))}
        isOpen={isKdpModalOpen}
        onClose={() => setIsKdpModalOpen(false)}
        onTriggerPrint={() => window.print()}
      />

      <BackupModal
        speciesList={speciesList}
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreBackup={(restored) => {
          setSpeciesList(restored);
          setCurrentIndex(0);
        }}
        onResetToDefaults={handleResetData}
      />
    </div>
  );
}
