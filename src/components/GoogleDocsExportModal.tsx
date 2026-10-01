import React, { useState } from 'react';
import { OrchidSpecies } from '../types';
import {
  copyCardToClipboard,
  downloadForGoogleDocs,
  generateContinuousListHtml
} from '../utils/googleDocsExport';
import {
  signInWithGoogle,
  getCachedToken,
  getCurrentUser,
  logoutGoogle,
  createGoogleDocFromCard,
  createGoogleDocMasterCatalogue
} from '../services/googleDocsService';
import {
  X,
  FileText,
  Copy,
  Download,
  ExternalLink,
  Check,
  Sparkles,
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react';

interface GoogleDocsExportModalProps {
  species: OrchidSpecies;
  speciesList: OrchidSpecies[];
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDocsExportModal: React.FC<GoogleDocsExportModalProps> = ({
  species,
  speciesList,
  isOpen,
  onClose
}) => {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getCachedToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingMaster, setIsExportingMaster] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);
  const [masterDocUrl, setMasterDocUrl] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [copiedCatalogue, setCopiedCatalogue] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setToken(result.accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con tu cuenta de Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
  };

  const handleCreateCardInDocs = async () => {
    if (!token) {
      await handleGoogleLogin();
      return;
    }

    setErrorMsg(null);
    setIsExporting(true);
    try {
      const res = await createGoogleDocFromCard(species, token);
      setCreatedDocUrl(res.docUrl);
      window.open(res.docUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No se pudo crear el documento en Google Docs.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateMasterInDocs = async () => {
    if (!token) {
      await handleGoogleLogin();
      return;
    }

    setErrorMsg(null);
    setIsExportingMaster(true);
    try {
      const res = await createGoogleDocMasterCatalogue(speciesList, token);
      setMasterDocUrl(res.docUrl);
      window.open(res.docUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No se pudo crear el catálogo maestro en Google Docs.');
    } finally {
      setIsExportingMaster(false);
    }
  };

  const handleCopyClipboard = async () => {
    const success = await copyCardToClipboard(species);
    if (success) {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
    }
  };

  const handleCopyCatalogueClipboard = async () => {
    const html = generateContinuousListHtml(speciesList);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([`Catálogo de Orquídeas de México (${speciesList.length} especies)`], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
        ]);
      }
      setCopiedCatalogue(true);
      setTimeout(() => setCopiedCatalogue(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Exportar y Editar en Documentos de Google
              </h2>
              <p className="text-xs text-slate-400">
                Ficha #{species.speciesCode}: <i className="text-amber-300">{species.scientificName}</i>
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Status / Google Sign-In */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                <span>Cuenta de Google</span>
                {user && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {user
                  ? `Sesión iniciada como ${user.displayName || user.email}`
                  : 'Conecta tu cuenta para crear documentos editables directamente en tu Google Drive.'}
              </p>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg shadow-sm flex items-center gap-2 text-xs transition-colors disabled:opacity-50"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                )}
                <span>Iniciar sesión con Google</span>
              </button>
            )}
          </div>

          {/* Option 1: Direct Google Drive/Docs Creation */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Opción 1: Crear Documento Directo en Google Docs</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Crea automáticamente un nuevo documento en tu Google Drive con el estilo exacto de Canva (tablas taxonómicas, ficha botánica, descripción, hábitat y estado NOM-059).
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handleCreateCardInDocs}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Crear Ficha #{species.speciesCode} en Google Docs</span>
              </button>

              <button
                onClick={handleCreateMasterInDocs}
                disabled={isExportingMaster}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-400/40 font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExportingMaster ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderOpen className="w-4 h-4" />
                )}
                <span>Crear Catálogo Completo ({speciesList.length} especies)</span>
              </button>
            </div>

            {createdDocUrl && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-200 flex items-center justify-between text-xs mt-2">
                <span>✓ Documento de la ficha creado exitosamente en tu Google Drive.</span>
                <a
                  href={createdDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1 hover:text-white"
                >
                  Abrir Documento <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Option 2: Copy Rich-Text Clipboard (Works immediately) */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="font-bold text-amber-300 text-xs uppercase tracking-wide flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>Opción 2: Copiar Formato de Tabla para Pegar (Ctrl + V)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Copia la ficha botánica al portapapeles con todas sus tablas, colores de celda y tipografías. Al pegarla en cualquier documento abierto de Google Docs con <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-600 rounded text-amber-300 font-mono">Ctrl+V</kbd>, se conserva toda la estructura y podrás editar cualquier celda directamente.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handleCopyClipboard}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                {copiedStatus ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedStatus ? '¡Copiado con Éxito!' : 'Copiar Ficha Actual'}</span>
              </button>

              <button
                onClick={handleCopyCatalogueClipboard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                {copiedCatalogue ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCatalogue ? '¡Catálogo Copiado!' : 'Copiar Índice Continuo (1 a ' + speciesList.length + ')'}</span>
              </button>
            </div>
          </div>

          {/* Option 3: Download standalone file */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200 text-xs">
                Opción 3: Descargar Archivo HTML / DOC
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Descarga un archivo listo para abrir mediante "Archivo &gt; Abrir &gt; Subir" en Google Docs.
              </p>
            </div>
            <button
              onClick={() => downloadForGoogleDocs(species)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .html</span>
            </button>
          </div>

          {/* Instructions for Amazon KDP 6x9 in Google Docs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-xs space-y-2 text-slate-300">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>📖</span>
              <span>Cómo configurar las medidas 6" × 9" para KDP en Google Docs:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Abre tu documento en Google Docs.</li>
              <li>Ve a <strong>Archivo &gt; Configuración de página</strong> en la barra superior.</li>
              <li>En <strong>Tamaño de papel</strong>, selecciona el formato de 6 x 9 pulgadas (o en márgenes define Superior: 0.5", Inferior: 0.5", Izquierdo: 0.5", Derecho: 0.5").</li>
              <li>Pega tu ficha botánica con <kbd className="px-1 py-0.2 bg-slate-800 text-amber-300 rounded font-mono">Ctrl+V</kbd>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
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
