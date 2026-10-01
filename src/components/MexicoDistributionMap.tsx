import React, { useState } from 'react';
import { MapPin, Globe, Check, Plus, Trash2, Image, Layers } from 'lucide-react';

export const MEXICO_STATES_LIST = [
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

// Simplified coordinates for visual layout of Mexico's 32 states on an interactive SVG grid/map
interface StateGeo {
  id: string;
  name: string;
  short: string;
  x: number;
  y: number;
  path: string; // SVG path
}

// Optimized paths for Mexico states representation
const STATE_PATHS: StateGeo[] = [
  { id: 'BCN', name: 'Baja California', short: 'BC', x: 70, y: 55, path: 'M 40,25 L 85,20 L 70,110 L 45,95 Z' },
  { id: 'BCS', name: 'Baja California Sur', short: 'BCS', x: 85, y: 155, path: 'M 70,110 L 95,130 L 105,200 L 85,185 Z' },
  { id: 'SON', name: 'Sonora', short: 'SON', x: 135, y: 75, path: 'M 85,20 L 165,25 L 175,120 L 105,100 Z' },
  { id: 'CHH', name: 'Chihuahua', short: 'CHIH', x: 215, y: 80, path: 'M 165,25 L 265,30 L 255,140 L 175,120 Z' },
  { id: 'COA', name: 'Coahuila', short: 'COAH', x: 285, y: 110, path: 'M 265,30 L 335,70 L 315,160 L 255,140 Z' },
  { id: 'NLE', name: 'Nuevo León', short: 'NL', x: 335, y: 135, path: 'M 335,70 L 360,110 L 335,175 L 315,160 Z' },
  { id: 'TAM', name: 'Tamaulipas', short: 'TAM', x: 365, y: 150, path: 'M 360,110 L 390,135 L 370,215 L 335,175 Z' },
  { id: 'SIN', name: 'Sinaloa', short: 'SIN', x: 155, y: 145, path: 'M 105,100 L 175,120 L 195,190 L 140,165 Z' },
  { id: 'DUR', name: 'Durango', short: 'DUR', x: 215, y: 155, path: 'M 175,120 L 255,140 L 240,205 L 195,190 Z' },
  { id: 'ZAC', name: 'Zacatecas', short: 'ZAC', x: 260, y: 180, path: 'M 255,140 L 315,160 L 285,225 L 240,205 Z' },
  { id: 'SLP', name: 'San Luis Potosí', short: 'SLP', x: 315, y: 200, path: 'M 315,160 L 350,185 L 340,240 L 285,225 Z' },
  { id: 'NAY', name: 'Nayarit', short: 'NAY', x: 185, y: 205, path: 'M 170,185 L 205,195 L 200,225 L 170,215 Z' },
  { id: 'AGU', name: 'Aguascalientes', short: 'AGS', x: 260, y: 215, path: 'M 250,210 L 270,210 L 270,225 L 250,225 Z' },
  { id: 'JAL', name: 'Jalisco', short: 'JAL', x: 210, y: 240, path: 'M 185,215 L 245,215 L 250,270 L 195,260 Z' },
  { id: 'GUA', name: 'Guanajuato', short: 'GTO', x: 285, y: 235, path: 'M 270,220 L 305,220 L 300,250 L 270,245 Z' },
  { id: 'QUE', name: 'Querétaro', short: 'QRO', x: 315, y: 235, path: 'M 305,220 L 330,225 L 325,250 L 300,245 Z' },
  { id: 'HID', name: 'Hidalgo', short: 'HGO', x: 345, y: 235, path: 'M 330,225 L 365,225 L 355,255 L 325,250 Z' },
  { id: 'COL', name: 'Colima', short: 'COL', x: 205, y: 275, path: 'M 195,265 L 220,265 L 215,285 L 195,280 Z' },
  { id: 'MIC', name: 'Michoacán', short: 'MICH', x: 250, y: 275, path: 'M 225,255 L 290,250 L 280,295 L 220,290 Z' },
  { id: 'MEX', name: 'Estado de México', short: 'EDOMEX', x: 310, y: 265, path: 'M 290,250 L 330,250 L 320,285 L 285,280 Z' },
  { id: 'CMX', name: 'Ciudad de México', short: 'CDMX', x: 330, y: 265, path: 'M 322,260 L 338,260 L 338,272 L 322,272 Z' },
  { id: 'MOR', name: 'Morelos', short: 'MOR', x: 325, y: 285, path: 'M 318,276 L 336,276 L 334,293 L 318,290 Z' },
  { id: 'TLA', name: 'Tlaxcala', short: 'TLAX', x: 350, y: 260, path: 'M 342,252 L 358,252 L 358,266 L 342,266 Z' },
  { id: 'PUE', name: 'Puebla', short: 'PUE', x: 365, y: 275, path: 'M 350,250 L 385,255 L 375,305 L 340,290 Z' },
  { id: 'VER', name: 'Veracruz', short: 'VER', x: 395, y: 260, path: 'M 365,215 L 430,265 L 420,320 L 370,255 Z' },
  { id: 'GRO', name: 'Guerrero', short: 'GRO', x: 295, y: 310, path: 'M 265,290 L 345,290 L 335,335 L 270,325 Z' },
  { id: 'OAX', name: 'Oaxaca', short: 'OAX', x: 375, y: 330, path: 'M 335,310 L 425,315 L 415,360 L 345,350 Z' },
  { id: 'TAB', name: 'Tabasco', short: 'TAB', x: 450, y: 300, path: 'M 425,295 L 475,295 L 465,325 L 425,320 Z' },
  { id: 'CHP', name: 'Chiapas', short: 'CHIS', x: 460, y: 350, path: 'M 425,325 L 490,325 L 475,385 L 430,365 Z' },
  { id: 'CAM', name: 'Campeche', short: 'CAMP', x: 495, y: 275, path: 'M 475,260 L 525,255 L 515,310 L 470,305 Z' },
  { id: 'YUC', name: 'Yucatán', short: 'YUC', x: 530, y: 235, path: 'M 495,215 L 555,215 L 550,255 L 495,255 Z' },
  { id: 'ROO', name: 'Quintana Roo', short: 'QROO', x: 550, y: 270, path: 'M 535,225 L 570,225 L 555,305 L 525,295 Z' },
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

  // Normalized matching
  const isStateSelected = (stateName: string) => {
    return speciesStates.some(s => 
      s.toLowerCase().trim() === stateName.toLowerCase().trim() ||
      stateName.toLowerCase().includes(s.toLowerCase().trim()) ||
      s.toLowerCase().includes(stateName.toLowerCase().trim())
    );
  };

  const handleToggleState = (stateName: string) => {
    if (!canEdit || !onUpdateStates) return;
    if (isStateSelected(stateName)) {
      onUpdateStates(speciesStates.filter(s => s.toLowerCase().trim() !== stateName.toLowerCase().trim()));
    } else {
      onUpdateStates([...speciesStates, stateName]);
    }
  };

  const selectedCount = speciesStates.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Distribución en México
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {selectedCount} {selectedCount === 1 ? 'Estado registrado' : 'Estados registrados'}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Mapa Político</span>
          </button>
          {customMapUrl && (
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'custom' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-3 h-3" />
              <span>Mapa Ilustrado</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'map' ? (
        <div className="p-4 flex flex-col items-center">
          {/* Interactive SVG Map */}
          <div className="relative w-full max-w-lg aspect-16/11 bg-slate-950/70 rounded-xl p-2 border border-slate-800 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full drop-shadow-md select-none"
            >
              <defs>
                <linearGradient id="selectedStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Water background subtle grid */}
              <rect x="0" y="0" width="600" height="400" fill="transparent" />

              {/* States paths */}
              {STATE_PATHS.map((st) => {
                const isSelected = isStateSelected(st.name);
                const isHovered = hoveredState === st.name;

                return (
                  <g key={st.id} className="transition-all duration-200">
                    <path
                      d={st.path}
                      fill={isSelected ? 'url(#selectedStateGrad)' : isHovered ? '#334155' : '#1e293b'}
                      stroke={isSelected ? '#34d399' : '#475569'}
                      strokeWidth={isSelected ? '1.8' : '1'}
                      filter={isSelected ? 'url(#glow)' : undefined}
                      className={`${canEdit ? 'cursor-pointer' : 'cursor-default'} transition-all`}
                      onMouseEnter={() => setHoveredState(st.name)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleToggleState(st.name)}
                    />
                    {/* State short code label */}
                    <text
                      x={st.x}
                      y={st.y}
                      fill={isSelected ? '#ffffff' : '#64748b'}
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none font-mono"
                    >
                      {st.short}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredState && (
              <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white shadow-lg pointer-events-none flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{hoveredState}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isStateSelected(hoveredState) 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isStateSelected(hoveredState) ? '✓ Con Registro' : 'Sin registro'}
                </span>
                {canEdit && (
                  <span className="text-[9px] text-amber-400 italic">
                    (Clic para {isStateSelected(hoveredState) ? 'quitar' : 'agregar'})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Active States Chips */}
          <div className="w-full mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Estados con presencia:
              </span>
              {canEdit && (
                <span className="text-[10px] text-emerald-400">
                  ✏️ Modo edición activo (clic en un estado para activarlo)
                </span>
              )}
            </div>

            {selectedCount > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {speciesStates.map(stateName => (
                  <span
                    key={stateName}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{stateName}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleToggleState(stateName)}
                        className="hover:text-red-400 ml-1 text-slate-400"
                        title="Quitar estado"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Sin registros estatales específicos cargados para esta especie.
              </p>
            )}
          </div>

          {/* Admin quick state selector dropdown */}
          {canEdit && onUpdateStates && (
            <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleToggleState(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden flex-1"
                defaultValue=""
              >
                <option value="" disabled>
                  + Agregar o quitar un estado mexicano...
                </option>
                {MEXICO_STATES_LIST.map(st => (
                  <option key={st} value={st}>
                    {isStateSelected(st) ? `✓ ${st} (Quitar)` : `+ ${st}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        /* Custom image map view */
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-16/11 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {customMapUrl ? (
              <img
                src={customMapUrl}
                alt={`Mapa de distribución de ${scientificName}`}
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

      {/* Admin custom map URL input */}
      {canEdit && onUpdateCustomMapUrl && (
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="URL de imagen de mapa personalizado (opcional)..."
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            onClick={() => onUpdateCustomMapUrl(customUrlInput)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
          >
            Guardar Mapa
          </button>
        </div>
      )}
    </div>
  );
};
