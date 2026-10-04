import React, { useState, useEffect, useMemo, useRef } from 'react';
import { OrchidSpecies, ConservationStatus } from './types';
import { INITIAL_SPECIES_LIST } from './data/speciesData';
import { resolveSpeciesPhotos } from './data/samplePhotos';
import { MobileBotanicalView } from './components/MobileBotanicalView';
import { MexicoDistributionMap } from './components/MexicoDistributionMap';
import { OrchidEditorDrawer } from './components/OrchidEditorDrawer';
import { ContinuousIndexModal } from './components/ContinuousIndexModal';
import { GoogleDocsExportModal } from './components/GoogleDocsExportModal';
import { BackupModal } from './components/BackupModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { 
  auth, 
  ADMIN_EMAIL, 
  isOwnerOrAdmin, 
  saveSpeciesToFirestore, 
  subscribeToCloudEdits 
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  FileText,
  Edit3,
  Shuffle,
  Grid,
  Sparkles,
  ShieldCheck,
  Globe,
  Lock,
  Sliders,
  Wifi,
  WifiOff,
  Download,
  Share2,
  Compass
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

  // Current user & Admin status
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('atlas_admin_active') === 'true';
  });

  // Online / Offline Detection
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // View Mode: 'botanical' (fluid mobile/desktop card), 'map', 'grid'
  const [viewMode, setViewMode] = useState<'botanical' | 'map' | 'grid'>('botanical');

  // Current species index (find Acianthera johnsonii or default to 0)
  const defaultIdx = useMemo(() => {
    const idx = speciesList.findIndex(s => s.scientificName.toLowerCase().includes('johnsonii'));
    return idx !== -1 ? idx : 0;
  }, [speciesList]);

  const [currentIndex, setCurrentIndex] = useState<number>(defaultIdx);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenusFilter, setSelectedGenusFilter] = useState<string>('all');
  const [filterEndemicOnly, setFilterEndemicOnly] = useState<boolean>(false);
  const [jumpInput, setJumpInput] = useState('');

  // Modals & Drawer States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && isOwnerOrAdmin(user)) {
        setIsAdmin(true);
        localStorage.setItem('atlas_admin_active', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time cloud edits so changes by the owner stay for EVERYONE
  useEffect(() => {
    if (!navigator.onLine) return;
    const unsubscribe = subscribeToCloudEdits((cloudEdits) => {
      setSpeciesList(prev => {
        let changed = false;
        const next = prev.map(sp => {
          if (cloudEdits[sp.speciesCode]) {
            changed = true;
            return { ...sp, ...cloudEdits[sp.speciesCode] };
          }
          return sp;
        });
        return changed ? next : prev;
      });
    });
    return () => unsubscribe();
  }, [isOnline]);

  // Save to localStorage whenever speciesList changes (guarantees offline availability)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(speciesList));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [speciesList]);

  // Current active species
  const currentSpecies: OrchidSpecies = speciesList[currentIndex] || speciesList[0];

  // Distinct Genera list
  const popularGenera = useMemo(() => {
    const map = new Map<string, number>();
    speciesList.forEach(s => {
      map.set(s.genus, (map.get(s.genus) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0]);
  }, [speciesList]);

  // Filtered list
  const filteredSpecies = useMemo(() => {
    return speciesList.filter(s => {
      const matchSearch =
        s.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speciesCode.includes(searchQuery) ||
        s.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.mexicoStates && s.mexicoStates.some(st => st.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchGenus = selectedGenusFilter === 'all' || s.genus === selectedGenusFilter;
      const matchEndemic = !filterEndemicOnly || s.isEndemic;

      return matchSearch && matchGenus && matchEndemic;
    });
  }, [speciesList, searchQuery, selectedGenusFilter, filterEndemicOnly]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? speciesList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === speciesList.length - 1 ? 0 : prev + 1));
  };

  const handleRandom = () => {
    const randomIdx = Math.floor(Math.random() * speciesList.length);
    setCurrentIndex(randomIdx);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = jumpInput.trim().toLowerCase();
    if (!query) return;

    const codeNum = parseInt(query, 10);
    let targetIdx = -1;

    if (!isNaN(codeNum)) {
      targetIdx = speciesList.findIndex(
        s => s.continuousIndex === codeNum || s.speciesCode === query.padStart(4, '0')
      );
    }

    if (targetIdx === -1) {
      targetIdx = speciesList.findIndex(
        s => s.scientificName.toLowerCase().includes(query) || s.commonName.toLowerCase().includes(query)
      );
    }

    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setJumpInput('');
    } else {
      alert(`No se encontró la especie "${jumpInput}".`);
    }
  };

  // Update species handler: saves locally and syncs to Firestore if admin
  const handleUpdateCurrentSpecies = (updated: Partial<OrchidSpecies>) => {
    if (!isAdmin) {
      alert('Modo de solo lectura: Solo la cuenta del autor (Josué Jacobo - emiliojacobg@gmail.com) puede guardar cambios permanentes.');
      return;
    }

    setSpeciesList(prev => {
      const copy = [...prev];
      const targetIdx = copy.findIndex(s => s.speciesCode === currentSpecies.speciesCode);
      if (targetIdx !== -1) {
        const merged = { ...copy[targetIdx], ...updated };
        copy[targetIdx] = merged;
        // Save to cloud Firestore so it stays for EVERYONE
        if (navigator.onLine) {
          saveSpeciesToFirestore(merged);
        }
      }
      return copy;
    });
  };

  const handleAddNewSpecies = (newSpecies: OrchidSpecies) => {
    if (!isAdmin) {
      alert('Solo el propietario puede agregar nuevas especies al catálogo.');
      return;
    }
    setSpeciesList(prev => [...prev, newSpecies]);
    setCurrentIndex(speciesList.length);
    if (navigator.onLine) {
      saveSpeciesToFirestore(newSpecies);
    }
  };

  const handleResetData = () => {
    if (!isAdmin) {
      alert('Acción restringida al autor.');
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setSpeciesList(INITIAL_SPECIES_LIST);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speciesList.length]);

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* ===================== SLEEK BOTANICAL APP HEADER ===================== */}
      <header className="no-print bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-base shadow-md flex-shrink-0">
              🪻
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-serif">
                  Atlas Botánico
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  México
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <span>{speciesList.length} especies</span>
                <span>•</span>
                <span className="text-emerald-400">
                  {speciesList.filter(s => s.isEndemic).length} endémicas
                </span>
                <span>•</span>
                {!isOnline ? (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <WifiOff className="w-3 h-3" /> Sin internet (Offline)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Wifi className="w-3 h-3" /> Conectado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-4">
            <form onSubmit={handleJumpSubmit} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por #, nombre botánico o estado..."
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 transition-all shadow-inner"
              />
            </form>
          </div>

          {/* Top Right: View Mode & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Switcher for Desktop */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setViewMode('botanical')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'botanical'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Ficha botánica de la especie"
              >
                <span>🌿 Ficha Botánica</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mapa de distribución geográfica de México"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mapa de México</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Galería / Catálogo general"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Catálogo</span>
              </button>
            </div>

            {/* Offline Status Badge on Mobile */}
            {!isOnline && (
              <span className="md:hidden px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-bold flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}

            {/* Author / Access Badge */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={isAdmin ? 'Propietario activo: Josué Jacobo' : 'Iniciar sesión como autor'}
            >
              {isAdmin ? (
                <>
                  <span className="text-amber-400">👑</span>
                  <span className="hidden lg:inline text-[11px]">Josué Jacobo</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="hidden lg:inline text-[11px]">Autor</span>
                </>
              )}
            </button>

            {/* Tools Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs flex items-center gap-1 transition-all"
                title="Herramientas y exportación"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Menú</span>
              </button>

              {isToolsDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 divide-y divide-slate-800 animate-in fade-in"
                  onClick={() => setIsToolsDropdownOpen(false)}
                >
                  <div className="py-1">
                    <button
                      onClick={() => setIsCatalogModalOpen(true)}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Catálogo Completo ({speciesList.length})</span>
                    </button>
                    <button
                      onClick={() => setIsGoogleDocsModalOpen(true)}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Exportar a Google Docs</span>
                    </button>
                    <button
                      onClick={() => setIsBackupModalOpen(true)}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Respaldar Datos (JSON)</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="py-1 bg-amber-500/5">
                      <button
                        onClick={() => setIsEditorOpen(true)}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 text-amber-300 font-semibold"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar Especie Actual</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===================== SUB-NAV TOOLBAR (GENERA & QUICK JUMP) ===================== */}
      <div className="no-print bg-slate-900/60 border-b border-slate-800/80 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs">
        {/* Genera Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-0.5">
          <span className="text-slate-400 text-[10px] font-medium mr-1 flex-shrink-0">
            Géneros:
          </span>
          <button
            onClick={() => setSelectedGenusFilter('all')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors flex-shrink-0 ${
              selectedGenusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            Todos
          </button>
          {popularGenera.map(genus => (
            <button
              key={genus}
              onClick={() => setSelectedGenusFilter(genus)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-serif italic transition-colors flex-shrink-0 ${
                selectedGenusFilter === genus
                  ? 'bg-amber-500 text-slate-950 font-bold not-italic'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {genus}
            </button>
          ))}
        </div>

        {/* Endemic filter & Quick shuffle */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setFilterEndemicOnly(!filterEndemicOnly)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1 ${
              filterEndemicOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span>⭐ Endémicas</span>
          </button>

          <button
            onClick={handleRandom}
            title="Especie al azar"
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===================== MAIN CANVAS / WORKSPACE ===================== */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-6 flex flex-col items-center justify-start bg-[#080d19]">
        {/* VIEW 1: THE FLUID BOTANICAL VIEW (100% RESPONSIVE) */}
        {viewMode === 'botanical' && (
          <MobileBotanicalView
            species={currentSpecies}
            canEdit={isAdmin}
            onOpenEditor={() => setIsEditorOpen(true)}
            onPrev={handlePrev}
            onNext={handleNext}
            onUpdateSpecies={handleUpdateCurrentSpecies}
          />
        )}

        {/* VIEW 2: FULL REALISTIC MEXICO DISTRIBUTION MAP */}
        {viewMode === 'map' && (
          <div className="w-full max-w-4xl mx-auto space-y-4 pb-24">
            <div className="text-center space-y-1 mb-2">
              <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                #{currentSpecies.speciesCode}
              </span>
              <h2 className="text-xl font-bold font-serif italic text-white">
                {currentSpecies.scientificName}
              </h2>
              <p className="text-xs text-slate-400">
                Cartografía oficial y distribución por estado en la República Mexicana
              </p>
            </div>

            <MexicoDistributionMap
              speciesStates={currentSpecies.mexicoStates || []}
              scientificName={currentSpecies.scientificName}
              customMapUrl={currentSpecies.customMapUrl}
              canEdit={isAdmin}
              onUpdateStates={(newStates) => handleUpdateCurrentSpecies({ mexicoStates: newStates })}
              onUpdateCustomMapUrl={(url) => handleUpdateCurrentSpecies({ customMapUrl: url })}
            />
          </div>
        )}

        {/* VIEW 3: GRID CATALOGUE VIEW */}
        {viewMode === 'grid' && (
          <div className="w-full max-w-6xl pb-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Catálogo de Especies ({filteredSpecies.length})
              </h2>
              <span className="text-xs text-slate-400">
                Página #{currentIndex + 1} seleccionada
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredSpecies.slice(0, 96).map(sp => {
                const isSelected = sp.speciesCode === currentSpecies.speciesCode;
                const photoData = resolveSpeciesPhotos(sp);
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      const idx = speciesList.findIndex(s => s.speciesCode === sp.speciesCode);
                      if (idx !== -1) setCurrentIndex(idx);
                      setViewMode('botanical');
                    }}
                    className={`rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                      <img
                        src={photoData.photo1}
                        alt={sp.scientificName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono text-amber-400 font-bold">
                        #{sp.speciesCode}
                      </div>
                      {sp.isEndemic && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 text-[9px] font-bold">
                          ⭐
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-serif italic font-semibold text-white truncate">
                        {sp.scientificName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center justify-between">
                        <span>{sp.genus}</span>
                        {photoData.isExactSpeciesPhoto && (
                          <span className="text-[9px] text-emerald-400 font-medium">✓ Foto real</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ===================== BOTTOM MOBILE NAVIGATION DOCK ===================== */}
      <nav className="no-print md:hidden fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 py-2.5 px-3 z-40 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setViewMode('botanical')}
          className={`flex flex-col items-center gap-1 transition-all ${
            viewMode === 'botanical' ? 'text-emerald-400 scale-105 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🌿</span>
          <span className="text-[10px]">Ficha</span>
        </button>

        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center gap-1 transition-all ${
            viewMode === 'map' ? 'text-blue-400 scale-105 font-bold' : 'text-slate-400'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[10px]">Mapa</span>
        </button>

        <button
          onClick={() => setIsCatalogModalOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 active:text-white"
        >
          <BookOpen className="w-5 h-5 text-amber-400/90" />
          <span className="text-[10px]">Catálogo</span>
        </button>

        {isAdmin ? (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex flex-col items-center gap-1 text-emerald-400 active:scale-105"
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Editar</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-500 active:text-slate-300"
          >
            <Lock className="w-5 h-5" />
            <span className="text-[10px]">Autor</span>
          </button>
        )}
      </nav>

      {/* ===================== MODALS & DRAWERS ===================== */}
      {isAdmin && (
        <OrchidEditorDrawer
          species={currentSpecies}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleUpdateCurrentSpecies}
        />
      )}

      <ContinuousIndexModal
        speciesList={speciesList}
        currentIndex={currentIndex}
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectSpecies={idx => {
          setCurrentIndex(idx);
          setIsCatalogModalOpen(false);
          setViewMode('botanical');
        }}
        onAddNewSpecies={handleAddNewSpecies}
      />

      <GoogleDocsExportModal
        species={currentSpecies}
        speciesList={speciesList}
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
      />

      <BackupModal
        speciesList={speciesList}
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreBackup={(restored) => {
          if (!isAdmin) {
            alert('Solo el propietario puede restaurar copias globales.');
            return;
          }
          setSpeciesList(restored);
          setCurrentIndex(0);
        }}
        onResetToDefaults={handleResetData}
      />

      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onAdminStateChange={(status) => setIsAdmin(status)}
      />
    </div>
  );
}
