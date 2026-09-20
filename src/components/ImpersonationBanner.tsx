import React, { useEffect, useState } from 'react';
import { Shield, LogOut, UserCheck } from 'lucide-react';

export const IMPERSONATE_STORAGE_KEY = 'montanha_impersonate';

export function getImpersonatedEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('impersonate');
    if (fromUrl && fromUrl.trim()) {
      const clean = fromUrl.trim().toLowerCase();
      localStorage.setItem(IMPERSONATE_STORAGE_KEY, clean);
      return clean;
    }
    return localStorage.getItem(IMPERSONATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearImpersonation() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(IMPERSONATE_STORAGE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete('impersonate');
    window.location.href = url.pathname + (url.search ? url.search : '') + url.hash;
  } catch {
    localStorage.removeItem(IMPERSONATE_STORAGE_KEY);
    window.location.reload();
  }
}

export const ImpersonationBanner: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getImpersonatedEmail());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === IMPERSONATE_STORAGE_KEY) {
        setEmail(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!email) return null;

  return (
    <aside aria-label="Aviso de Modo Suporte Técnico" className="sticky top-0 z-[9999] w-full bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-b border-amber-500/40 backdrop-blur-xl px-4 py-2 text-xs text-amber-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-amber-500/30 text-amber-300">
            <Shield className="w-4 h-4" />
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-300">
              Modo Suporte Técnico:
            </span>
            <span>Você está operando como</span>
            <span className="font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30">
              {email}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Privilégios de SuperAdmin ativos)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <UserCheck className="w-3 h-3" /> Sessão Ativa
          </span>
          <button
            type="button"
            onClick={clearImpersonation}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold transition text-xs cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Sair do modo suporte
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ImpersonationBanner;
