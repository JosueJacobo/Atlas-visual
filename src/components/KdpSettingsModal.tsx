import React from 'react';
import { KDPGuideSettings } from '../types';
import { X, Printer, BookOpen, Check, Layers, AlertCircle } from 'lucide-react';

interface KdpSettingsModalProps {
  kdpGuides: KDPGuideSettings;
  onUpdateGuides: (updated: Partial<KDPGuideSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
  onTriggerPrint: () => void;
}

export const KdpSettingsModal: React.FC<KdpSettingsModalProps> = ({
  kdpGuides,
  onUpdateGuides,
  isOpen,
  onClose,
  onTriggerPrint
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Guías y Formato Amazon KDP (6" × 9" Pulgadas)
              </h2>
              <p className="text-xs text-slate-400">
                Estándar editorial de impresión bajo demanda para libros de tapa blanda y dura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Print button hero */}
          <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-sm">
                Imprimir o Guardar en PDF para KDP
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                Genera la página en tamaño exacto 6in × 9in (15.24 cm × 22.86 cm) sin márgenes extra, lista para subir a KDP.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => onTriggerPrint(), 250);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF (6×9)</span>
            </button>
          </div>

          {/* Guide Toggles */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Superposición de Guías Visuales en Pantalla</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-medium text-amber-300">Línea de Corte (Trim Line 6" × 9")</span>
                  <p className="text-slate-400 text-[11px]">Borde exacto donde la guillotina cortará el libro.</p>
                </div>
                <input
                  type="checkbox"
                  checked={kdpGuides.showTrimLine}
                  onChange={e => onUpdateGuides({ showTrimLine: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-medium text-red-400">Área de Sangrado (Bleed +0.125")</span>
                  <p className="text-slate-400 text-[11px]">Extensión obligatoria para imágenes a sangre completa.</p>
                </div>
                <input
                  type="checkbox"
                  checked={kdpGuides.showBleedArea}
                  onChange={e => onUpdateGuides({ showBleedArea: e.target.checked })}
                  className="w-4 h-4 rounded text-red-500 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-medium text-emerald-400">Zona Segura de Texto (Margin Safe Zone 0.375")</span>
                  <p className="text-slate-400 text-[11px]">Todo texto o dato debe estar dentro de este margen de seguridad.</p>
                </div>
                <input
                  type="checkbox"
                  checked={kdpGuides.showSafeZone}
                  onChange={e => onUpdateGuides({ showSafeZone: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Technical KDP Checklist */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200">
              Especificaciones de Amazon KDP para Paperback:
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Tamaño de recorte:</strong> 6" × 9" (15.24 × 22.86 cm) — el más popular y profesional para libros botánicos.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Numeración Continua:</strong> Todas las páginas siguen la secuencia 0001, 0002... manteniendo el orden correlativo de las especies.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Ajustes de Impresión:</strong> En el cuadro de diálogo de impresión, desactiva "Encabezados y pies de página" y selecciona "Márgenes: Ninguno".</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
