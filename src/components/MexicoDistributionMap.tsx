import React, { useState, useMemo } from 'react';
import { REAL_MEXICO_STATES, RealStateSvg } from '../data/mexicoRealSvgPaths';
import { MapPin, Globe, Check, Layers, Image, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const ALL_MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas'
];

interface MexicoDistributionMapProps {
  speciesStates: string[];
  scientificName: string;
  customMapUrl?: string;
  canEdit?: boolean;
  onUpdateStates?: (states: string[]) => void;
  onUpdateCustomMapUrl?: (url: string) => void;
}

export const MexicoDistributionMap: React.FC<MexicoDistributionMapProps> = ({
  speciesStates = [],
  scientificName,
  customMapUrl,
  canEdit = false,
  onUpdateStates,
  onUpdateCustomMapUrl
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'custom'>(customMapUrl ? 'custom' : 'map');
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState(customMapUrl || '');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Normalize string for state matching
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/de ignacio de la llave/g, '')
      .replace(/de ocampo/g, '')
      .replace(/de zaragoza/g, '')
      .trim();
  };

  const isStateSelected = (stateName: string) => {
    const target = normalize(stateName);
    return speciesStates.some(s => {
      const current = normalize(s);
      return current === target || target.includes(current) || current.includes(target);
    });
  };

  const handleToggleState = (stateName: string) => {
    if (!canEdit || !onUpdateStates) return;
    if (isStateSelected(stateName)) {
      onUpdateStates(speciesStates.filter(s => normalize(s) !== normalize(stateName)));
    } else {
      onUpdateStates([...speciesStates, stateName]);
    }
  };

  const selectedCount = useMemo(() => {
    return speciesStates.length;
  }, [speciesStates]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Distribución Geográfica en México
            </h3>
            <p className="text-[10px] text-slate-400">
              Cartografía vectorial realista de las 32 entidades federativas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
            {selectedCount} {selectedCount === 1 ? 'Estado con presencia' : 'Estados con presencia'}
          </span>

          {customMapUrl && (
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeTab === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cartografía
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeTab === 'custom' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ilustración
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Canvas */}
      {activeTab === 'map' ? (
        <div className="p-3 sm:p-5 flex flex-col items-center relative">
          {/* Zoom controls */}
          <div className="absolute top-5 right-5 z-20 flex flex-col gap-1 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Acercar mapa"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Alejar mapa"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Restablecer vista"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* SVG Map Container */}
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#091124] to-[#040814] rounded-2xl p-2 sm:p-4 border border-slate-800 shadow-inner overflow-hidden relative">
            <div 
              className="w-full transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 800 500"
                className="w-full h-auto drop-shadow-2xl select-none"
              >
                <defs>
                  {/* Glowing emerald gradient for native states */}
                  <linearGradient id="realEmeraldState" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ocean and Gulf subtle backdrop */}
                <rect x="0" y="0" width="800" height="500" fill="transparent" />

                {/* Render the 32 real Mexican states */}
                {REAL_MEXICO_STATES.map((state: RealStateSvg) => {
                  const isSelected = isStateSelected(state.name);
                  const isHovered = hoveredState === state.name;

                  return (
                    <g key={state.id} className="transition-all duration-150">
                      <path
                        d={state.path}
                        fill={isSelected ? 'url(#realEmeraldState)' : isHovered ? '#334155' : '#182235'}
                        stroke={isSelected ? '#6ee7b7' : isHovered ? '#94a3b8' : '#2b3952'}
                        strokeWidth={isSelected ? '1.5' : '0.8'}
                        filter={isSelected ? 'url(#emeraldGlow)' : undefined}
                        className={`${canEdit ? 'cursor-pointer' : 'cursor-default'} transition-all`}
                        onMouseEnter={() => setHoveredState(state.name)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => handleToggleState(state.name)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredState && (
              <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-white shadow-xl pointer-events-none flex items-center gap-2 z-30">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100">{hoveredState}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  isStateSelected(hoveredState) 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isStateSelected(hoveredState) ? '✓ Con Registro Nativo' : 'Sin registro'}
                </span>
                {canEdit && (
                  <span className="text-[10px] text-amber-400 font-medium">
                    (Toca para {isStateSelected(hoveredState) ? 'quitar' : 'agregar'})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Active States Chips */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Entidades federativas registradas:
              </span>
              {canEdit && (
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✏️ Toca cualquier estado en el mapa para sumarlo
                </span>
              )}
            </div>

            {selectedCount > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {speciesStates.map(stateName => (
                  <span
                    key={stateName}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{stateName}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleToggleState(stateName)}
                        className="hover:text-red-400 ml-1 text-slate-400 font-bold"
                        title="Quitar entidad"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                Sin registros estatales detallados aún. En la descripción general se indica: México.
              </p>
            )}
          </div>

          {/* Admin Dropdown for quick addition */}
          {canEdit && onUpdateStates && (
            <div className="w-full mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleToggleState(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-hidden flex-1 shadow-inner"
                defaultValue=""
              >
                <option value="" disabled>
                  + Agregar o quitar una entidad federativa de México...
                </option>
                {ALL_MEXICAN_STATES.map(st => (
                  <option key={st} value={st}>
                    {isStateSelected(st) ? `✓ ${st} (Quitar)` : `+ ${st}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        /* Custom Illustrated / Satellite Map View */
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-16/11 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {customMapUrl ? (
              <img
                src={customMapUrl}
                alt={`Mapa ilustrado de ${scientificName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Image className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No hay mapa ilustrado subido todavía.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Custom Map URL Input */}
      {canEdit && onUpdateCustomMapUrl && (
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="URL de imagen de mapa satelital / botánico (opcional)..."
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            onClick={() => onUpdateCustomMapUrl(customUrlInput)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
          >
            Guardar Mapa
          </button>
        </div>
      )}
    </div>
  );
};
