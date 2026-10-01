import React, { useRef, useState } from 'react';
import { OrchidSpecies } from '../types';
import { ShieldCheck, Download, Upload, Check, AlertTriangle, Cloud, HardDrive, RefreshCw } from 'lucide-react';

interface BackupModalProps {
  speciesList: OrchidSpecies[];
  isOpen: boolean;
  onClose: () => void;
  onRestoreBackup: (restoredList: OrchidSpecies[]) => void;
  onResetToDefaults: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  speciesList,
  isOpen,
  onClose,
  onRestoreBackup,
  onResetToDefaults
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      speciesCount: speciesList.length,
      speciesList
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `RESPALDO_ATLAS_ORQUIDEAS_${speciesList.length}_ESPECIES_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        let listToRestore: OrchidSpecies[] = [];

        if (Array.isArray(parsed)) {
          listToRestore = parsed;
        } else if (parsed && Array.isArray(parsed.speciesList)) {
          listToRestore = parsed.speciesList;
        }

        if (listToRestore.length > 0) {
          onRestoreBackup(listToRestore);
          setRestoreMessage(`¡Éxito! Se restauraron ${listToRestore.length} especies con todas sus fotos y datos.`);
          setTimeout(() => {
            setRestoreMessage(null);
            onClose();
          }, 2500);
        } else {
          alert('El archivo no contiene una lista válida de especies.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo de respaldo. Asegúrate de que sea un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Seguridad y Respaldos del Atlas
              </h2>
              <p className="text-xs text-slate-400">
                Tus datos están protegidos y puedes respaldarlos cuando quieras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {restoreMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {/* Cloud hosting status */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
              <Cloud className="w-4 h-4" />
              <span>1. Tu aplicación ya está alojada en la nube de Google</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Esta aplicación está guardada en tu proyecto de <strong>Google Cloud (AI Studio)</strong>. El enlace oficial no depende de tu celular ni de tu computadora: está alojado en servidores seguros de Google 24/7.
            </p>
          </div>

          {/* Option 2: Download JSON backup */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="font-bold text-amber-300 text-xs uppercase tracking-wide flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span>2. Descargar Copia de Seguridad a tu Dispositivo (Recomendado)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Guarda un archivo en tu celular o computadora con <strong>todas las {speciesList.length} especies, fotos que hayas subido, descripciones y datos editados</strong>. Así, pase lo que pase, nunca perderás tu trabajo.
            </p>

            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors w-full sm:w-auto justify-center"
            >
              {copiedSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{copiedSuccess ? '¡Respaldo Descargado con Éxito!' : 'Descargar Archivo de Respaldo (.json)'}</span>
            </button>
          </div>

          {/* Option 3: Restore backup */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-slate-200 text-xs flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>3. Restaurar Copia de Seguridad</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si cambias de teléfono, abres desde otra computadora o quieres recuperar tus datos guardados, sube aquí tu archivo de respaldo.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Seleccionar archivo de respaldo para restaurar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Option 4: Google Drive sync */}
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/20 text-xs space-y-1.5 text-slate-300">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <span>📄</span>
              <span>4. Respaldo permanente en tu Google Drive</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Al usar el botón <strong>"Google Docs"</strong>, tus fichas se crean directamente en tu cuenta de Google Drive personal. Nadie puede borrarlas de ahí y las tendrás disponibles para siempre en tu cuenta de Google.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer las especies originales? Se perderán las fotos personalizadas que no hayas respaldado.')) {
                onResetToDefaults();
                onClose();
              }
            }}
            className="text-[11px] text-red-400/80 hover:text-red-300 underline"
          >
            Restablecer a valores de fábrica
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
