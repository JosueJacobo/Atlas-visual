import React, { useState } from 'react';
import { OrchidSpecies, ConservationStatus } from '../types';
import { X, Save, Upload, Sparkles, Image, Check, Plus, Trash2 } from 'lucide-react';
import { GENUS_SAMPLE_PHOTOS } from '../data/samplePhotos';

interface OrchidEditorDrawerProps {
  species: OrchidSpecies;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<OrchidSpecies>) => void;
}

const COMMON_MEXICO_STATES = [
  'Chiapas', 'Oaxaca', 'Veracruz', 'Puebla', 'Guerrero', 'Michoacán',
  'Jalisco', 'Nayarit', 'Colima', 'México', 'Morelos', 'Hidalgo',
  'San Luis Potosí', 'Querétaro', 'Tamaulipas', 'Tabasco', 'Campeche',
  'Yucatán', 'Quintana Roo', 'Sinaloa', 'Durango', 'Chihuahua', 'Sonora'
];

export const OrchidEditorDrawer: React.FC<OrchidEditorDrawerProps> = ({
  species,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<OrchidSpecies>({ ...species });
  const [activeTab, setActiveTab] = useState<'general' | 'botanical' | 'photos' | 'habitat'>('general');
  const [customStateInput, setCustomStateInput] = useState('');

  // Sync state when species prop changes
  React.useEffect(() => {
    setFormData({ ...species });
  }, [species]);

  if (!isOpen) return null;

  const handleChange = (field: keyof OrchidSpecies, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateToggle = (stateName: string) => {
    const current = formData.mexicoStates || [];
    if (current.includes(stateName)) {
      handleChange('mexicoStates', current.filter(s => s !== stateName));
    } else {
      handleChange('mexicoStates', [...current, stateName]);
    }
  };

  const handleAddCustomState = () => {
    if (!customStateInput.trim()) return;
    const current = formData.mexicoStates || [];
    if (!current.includes(customStateInput.trim())) {
      handleChange('mexicoStates', [...current, customStateInput.trim()]);
    }
    setCustomStateInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecond = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (isSecond) {
        handleChange('photoUrl2', res);
      } else {
        handleChange('photoUrl1', res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 text-slate-100 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Editor de Ficha Botánica • Especie {formData.speciesCode}
            </div>
            <h2 className="text-lg font-bold text-white font-serif italic">
              {formData.scientificName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-2 overflow-x-auto text-xs">
          {[
            { id: 'general', label: '🌿 Taxonomía' },
            { id: 'photos', label: '📸 Fotografías' },
            { id: 'botanical', label: '📋 Ficha Botánica' },
            { id: 'habitat', label: '🌎 Hábitat & NOM-059' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: GENERAL & TAXONOMY */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Número Continuo (Código KDP)</label>
                  <input
                    type="text"
                    value={formData.speciesCode}
                    onChange={e => handleChange('speciesCode', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Autor de Firma (Cabecera)</label>
                  <input
                    type="text"
                    value={formData.authorSignature}
                    onChange={e => handleChange('authorSignature', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nombre Científico Completo</label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={e => handleChange('scientificName', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-serif italic text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Género</label>
                  <input
                    type="text"
                    value={formData.genus}
                    onChange={e => handleChange('genus', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Autor Botánico</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e => handleChange('author', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nombre Común / Vernáculo</label>
                <input
                  type="text"
                  value={formData.commonName}
                  onChange={e => handleChange('commonName', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-amber-300 font-bold"
                />
              </div>

              <div className="bg-slate-800/80 p-3 rounded border border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="endemicCheck"
                    checked={formData.isEndemic}
                    onChange={e => handleChange('isEndemic', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-400"
                  />
                  <label htmlFor="endemicCheck" className="text-white font-semibold cursor-pointer">
                    Especie Endémica de México
                  </label>
                </div>
                {formData.isEndemic && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Detalle o Región Endémica</label>
                    <input
                      type="text"
                      value={formData.endemicNote}
                      onChange={e => handleChange('endemicNote', e.target.value)}
                      placeholder="ej. Endémica de Chiapas o Endémica de la Sierra Madre del Sur"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-emerald-300 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Puedes subir fotografías desde tu teléfono o computadora, o pegar un enlace web de alta resolución.
                </span>
              </div>

              {/* Photo 1 */}
              <div className="bg-slate-800/60 p-3 rounded border border-slate-700 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Fotografía Principal (Izquierda)</span>
                  {formData.photoUrl1 && (
                    <button
                      onClick={() => handleChange('photoUrl1', undefined)}
                      className="text-red-400 hover:underline text-[10px]"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 bg-slate-900 rounded border border-slate-700 overflow-hidden flex-shrink-0">
                    <img
                      src={formData.photoUrl1 || (GENUS_SAMPLE_PHOTOS[formData.genus] || GENUS_SAMPLE_PHOTOS.Default).photo1}
                      alt="Vista previa 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto desde archivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, false)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="O pega una URL de imagen..."
                      value={formData.photoUrl1 || ''}
                      onChange={e => handleChange('photoUrl1', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="bg-slate-800/60 p-3 rounded border border-slate-700 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Fotografía Secundaria / Detalle de Flor (Derecha)</span>
                  {formData.photoUrl2 && (
                    <button
                      onClick={() => handleChange('photoUrl2', undefined)}
                      className="text-red-400 hover:underline text-[10px]"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 bg-slate-900 rounded border border-slate-700 overflow-hidden flex-shrink-0">
                    <img
                      src={formData.photoUrl2 || formData.photoUrl1 || (GENUS_SAMPLE_PHOTOS[formData.genus] || GENUS_SAMPLE_PHOTOS.Default).photo2 || (GENUS_SAMPLE_PHOTOS[formData.genus] || GENUS_SAMPLE_PHOTOS.Default).photo1}
                      alt="Vista previa 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto detalle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, true)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="O pega una URL de imagen secundaria..."
                      value={formData.photoUrl2 || ''}
                      onChange={e => handleChange('photoUrl2', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Credit */}
              <div>
                <label className="block text-slate-400 mb-1">Crédito Fotográfico (Pie de foto)</label>
                <input
                  type="text"
                  value={formData.photoCredit}
                  onChange={e => handleChange('photoCredit', e.target.value)}
                  placeholder="ej. Foto de: Ecuagenera y Plantas EJJG"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BOTANICAL SPECS */}
          {activeTab === 'botanical' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">🌱 Tipo de Crecimiento</label>
                <input
                  type="text"
                  value={formData.growthType}
                  onChange={e => handleChange('growthType', e.target.value)}
                  placeholder="Epífita, cespitosa / Terrestre / Litófita"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">⛰️ Altitud</label>
                  <input
                    type="text"
                    value={formData.altitude}
                    onChange={e => handleChange('altitude', e.target.value)}
                    placeholder="ej. 1,000 – 2,450 m"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">📏 Tamaño</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={e => handleChange('size', e.target.value)}
                    placeholder="ej. 8 – 18 cm"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">🌎 Distribución General</label>
                <input
                  type="text"
                  value={formData.distribution}
                  onChange={e => handleChange('distribution', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">🌸 Fragancia</label>
                  <input
                    type="text"
                    value={formData.fragrance}
                    onChange={e => handleChange('fragrance', e.target.value)}
                    placeholder="No perceptible / Dulce / Cítrica"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">🐝 Polinizador</label>
                  <input
                    type="text"
                    value={formData.pollinator}
                    onChange={e => handleChange('pollinator', e.target.value)}
                    placeholder="Moscas / Abejas Euglossini / Colibríes"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descripción Botánica 🌿</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Dato Curioso ✨</label>
                <textarea
                  rows={2}
                  value={formData.curiousFact}
                  onChange={e => handleChange('curiousFact', e.target.value)}
                  className="w-full bg-slate-800 border border-amber-500/40 rounded px-2.5 py-1.5 text-amber-100 leading-relaxed text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 4: HABITAT & CONSERVATION */}
          {activeTab === 'habitat' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Banner de Hábitat</label>
                <textarea
                  rows={3}
                  value={formData.habitat}
                  onChange={e => handleChange('habitat', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs leading-relaxed"
                />
              </div>

              {/* NOM-059 STATUS */}
              <div className="bg-slate-800/60 p-3 rounded border border-slate-700 space-y-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Estado de Conservación (NOM-059-SEMARNAT)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { code: 'E', name: 'Probablemente extinta' },
                    { code: 'P', name: 'En peligro' },
                    { code: 'A', name: 'Amenazada' },
                    { code: 'PR', name: 'Protección especial' },
                    { code: 'NC', name: 'No catalogada' }
                  ].map(status => (
                    <button
                      key={status.code}
                      type="button"
                      onClick={() => handleChange('conservationStatus', status.code as ConservationStatus)}
                      className={`p-2 rounded border text-center transition-all ${
                        formData.conservationStatus === status.code
                          ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400 shadow-md font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">{status.code}</div>
                      <div className="text-[8px] truncate">{status.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STATES IN MEXICO */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Distribución por Estados de la República Mexicana
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950/60 rounded border border-slate-800">
                  {COMMON_MEXICO_STATES.map(st => {
                    const isSelected = formData.mexicoStates?.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStateToggle(st)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{st}
                      </button>
                    );
                  })}
                </div>

                {/* Add custom state */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Agregar otro estado o región..."
                    value={customStateInput}
                    onChange={e => setCustomStateInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomState()}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomState}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center gap-1.5 text-xs shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios en la Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
