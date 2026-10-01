import React, { useState, useMemo } from 'react';
import { OrchidSpecies } from '../types';
import { Search, Plus, Download, Copy, ExternalLink, X, Check, Filter } from 'lucide-react';
import { generateContinuousListHtml } from '../utils/googleDocsExport';

interface ContinuousIndexModalProps {
  speciesList: OrchidSpecies[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies: (index: number) => void;
  onAddNewSpecies: (newSpecies: OrchidSpecies) => void;
}

export const ContinuousIndexModal: React.FC<ContinuousIndexModalProps> = ({
  speciesList,
  currentIndex,
  isOpen,
  onClose,
  onSelectSpecies,
  onAddNewSpecies
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEndemic, setFilterEndemic] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedList, setCopiedList] = useState(false);

  // New species form state
  const [newSciName, setNewSciName] = useState('');
  const [newAuthor, setNewAuthor] = useState('Lindl.');
  const [newCommonName, setNewCommonName] = useState('');
  const [newIsEndemic, setNewIsEndemic] = useState(false);

  const filteredSpecies = useMemo(() => {
    return speciesList.filter(s => {
      const matchSearch =
        s.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speciesCode.includes(searchTerm) ||
        s.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.genus.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (filterEndemic && !s.isEndemic) return false;
      return true;
    });
  }, [speciesList, searchTerm, filterEndemic]);

  if (!isOpen) return null;

  const handleCopyContinuousForDocs = async () => {
    const html = generateContinuousListHtml(speciesList);
    const plainText = speciesList
      .map(s => `${s.speciesCode}\t${s.scientificName}\t${s.author}\t${s.commonName}\t${s.isEndemic ? 'Endémica' : 'Nativa'}`)
      .join('\n');

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSciName.trim()) return;

    const nextIndex = speciesList.length + 1;
    const nextCode = String(nextIndex).padStart(4, '0');
    const words = newSciName.trim().split(/\s+/);
    const genus = words[0] || 'Orchidaceae';

    const newObj: OrchidSpecies = {
      id: `orchid-${nextCode}`,
      continuousIndex: nextIndex,
      speciesCode: nextCode,
      originalRaw: `${nextIndex}. ${newSciName} ${newAuthor}`,
      scientificName: newSciName.trim(),
      genus,
      author: newAuthor.trim() || 'Lindl.',
      commonName: newCommonName.trim() || `${genus.toUpperCase()} ${words[1]?.toUpperCase() || ''}`.trim(),
      isEndemic: newIsEndemic,
      endemicNote: newIsEndemic ? 'Endémica de México' : '',
      emojis: [],
      growthType: 'Epífita, cespitosa',
      altitude: '1,000 – 2,200 m',
      distribution: newIsEndemic ? 'Endémica de México' : 'México y Centroamérica',
      mexicoStates: ['Chiapas', 'Oaxaca', 'Veracruz'],
      fragrance: 'No perceptible',
      size: '12 – 25 cm',
      pollinator: 'Moscas pequeñas (Dípteros)',
      description: `${newSciName.trim()} es una orquídea silvestre descrita para la flora de México, caracterizada por su hábito cespitoso y flores especializadas.`,
      curiousFact: 'Especie catalogada dentro del Atlas Visual de Orquídeas de México.',
      habitat: 'Habita en bosques mesófilos de montaña y bosques de pino-encino húmedos.',
      conservationStatus: newIsEndemic ? 'PR' : 'NC',
      photoCredit: 'Fotografía: Acervo Atlas EJJG',
      authorSignature: 'Josué Jacobo'
    };

    onAddNewSpecies(newObj);
    setIsAddingNew(false);
    setNewSciName('');
    setNewCommonName('');
    setNewIsEndemic(false);
    onSelectSpecies(speciesList.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Catálogo Continuo de Orquídeas</span>
              <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {speciesList.length} Especies Registradas
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Lista numerada continua desde 0001 en adelante para el Atlas de Orquídeas y publicación en Amazon KDP
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre científico, código (0010) o género..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>
            <button
              onClick={() => setFilterEndemic(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                filterEndemic
                  ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Solo Endémicas</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Especie ({speciesList.length + 1})</span>
            </button>

            <button
              onClick={handleCopyContinuousForDocs}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedList ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedList ? '¡Copiado para Docs!' : 'Copiar para Google Docs'}</span>
            </button>
          </div>
        </div>

        {/* Modal form to add a new species */}
        {isAddingNew && (
          <form onSubmit={handleCreateNewSpecies} className="p-4 bg-slate-800/80 border-b border-emerald-500/40 space-y-3">
            <div className="font-semibold text-emerald-300 text-xs flex items-center justify-between">
              <span>Registrar Nueva Especie #{String(speciesList.length + 1).padStart(4, '0')}</span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombre científico (ej. Stanhopea martiana)"
                value={newSciName}
                onChange={e => setNewSciName(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Autor (ej. Jenny / Bateman)"
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Nombre común (opcional)"
                value={newCommonName}
                onChange={e => setNewCommonName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newIsEndemic}
                  onChange={e => setNewIsEndemic(e.target.checked)}
                  className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                />
                <span>Marcar como especie endémica de México</span>
              </label>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
              >
                Guardar y Abrir Ficha
              </button>
            </div>
          </form>
        )}

        {/* Species Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 w-16 text-center">Núm.</th>
                <th className="py-2.5 px-4">Nombre Científico</th>
                <th className="py-2.5 px-4 hidden sm:table-cell">Nombre Común</th>
                <th className="py-2.5 px-3 text-center">Endemismo</th>
                <th className="py-2.5 px-3 text-center">NOM-059</th>
                <th className="py-2.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSpecies.map(item => {
                const isSelected = item.continuousIndex - 1 === currentIndex;
                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      onSelectSpecies(item.continuousIndex - 1);
                      onClose();
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 text-white font-semibold'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-4 text-center font-mono font-bold text-amber-400">
                      {item.speciesCode}
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-serif italic text-white text-[13px]">{item.scientificName}</span>{' '}
                      <span className="text-[10px] text-slate-400 font-sans">{item.author}</span>
                    </td>
                    <td className="py-2 px-4 text-slate-400 hidden sm:table-cell truncate max-w-[200px]">
                      {item.commonName || '-'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.isEndemic ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          Endémica
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Nativa</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        item.conservationStatus === 'E' || item.conservationStatus === 'P'
                          ? 'bg-red-950 text-red-300'
                          : item.conservationStatus === 'A'
                          ? 'bg-amber-950 text-amber-300'
                          : item.conservationStatus === 'PR'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.conservationStatus}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSpecies(item.continuousIndex - 1);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-medium"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSpecies.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No se encontraron especies que coincidan con "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            Mostrando {filteredSpecies.length} de {speciesList.length} especies totales
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
