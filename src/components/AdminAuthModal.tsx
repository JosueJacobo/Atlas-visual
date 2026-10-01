import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, logoutUser, ADMIN_EMAIL } from '../services/firebase';
import { ShieldCheck, Lock, LogIn, LogOut, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  isAdmin: boolean;
  onAdminStateChange: (isAdmin: boolean) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAdmin,
  onAdminStateChange
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const userEmail = user.email?.toLowerCase().trim() || '';
        if (userEmail === ADMIN_EMAIL.toLowerCase() || userEmail.startsWith('emiliojacobg') || userEmail.includes('josuejacobo')) {
          onAdminStateChange(true);
          onClose();
        } else {
          setErrorMsg(`Iniciaste sesión con ${user.email}, pero solo el propietario (${ADMIN_EMAIL}) tiene permisos de edición.`);
          onAdminStateChange(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo completar el inicio de sesión con Google. Puedes usar la clave directa de propietario.');
      setShowPinInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toLowerCase();
    // Support secret passkeys for Josue Jacobo / emiliojacobg
    if (clean === 'orquideas2026' || clean === 'jacobo' || clean === 'emiliojacobg' || clean === 'atlasmexico') {
      localStorage.setItem('atlas_admin_active', 'true');
      onAdminStateChange(true);
      onClose();
    } else {
      setErrorMsg('Clave incorrecta. Por favor ingresa la clave de autorización de Josué Jacobo.');
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    localStorage.removeItem('atlas_admin_active');
    onAdminStateChange(false);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isAdmin 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Control de Acceso del Autor
              </h3>
              <p className="text-[11px] text-slate-400">
                Solo el propietario puede editar y publicar cambios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Current status display */}
          <div className={`p-3.5 rounded-xl border ${
            isAdmin
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {isAdmin ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold text-emerald-400 uppercase tracking-wide">
                    👑 Modo Administrador Activo
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-bold text-slate-400 uppercase tracking-wide">
                    Modo Visitante (Solo Lectura)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {isAdmin
                ? `Estás autenticado como el autor exclusivo (${ADMIN_EMAIL}). Cualquier edición, foto o mapa que guardes quedará fijado para todos los visitantes del mundo.`
                : `Los visitantes públicos pueden explorar y buscar entre las 1,182 especies de orquídeas, pero no pueden alterar los datos ni las fotos.`}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 flex items-start gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isAdmin ? (
            <div className="space-y-3">
              <p className="text-slate-300 text-xs">
                Inicia sesión con tu cuenta oficial de Google para activar el modo de edición:
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Acceder con Google ({ADMIN_EMAIL})</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-3 text-slate-500 text-[10px] uppercase">O con clave de autor</span>
                <div className="grow border-t border-slate-800"></div>
              </div>

              {/* Direct Pin form */}
              <form onSubmit={handlePinLogin} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Clave de autorización..."
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Entrar
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Acceso directo sin popups para Josué Jacobo.
                </p>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión de administrador</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
