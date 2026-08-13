import React, { useMemo, useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Footer } from '../components/ui/Footer';
import type { AuthCredentials, User } from '../types';
import { authenticateUser } from '../core/auth';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [form, setForm] = useState<AuthCredentials>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordHint = useMemo(() => {
    if (form.email.includes('worker')) return 'Contraseña esperada: worker123';
    if (form.email.includes('sii')) return 'Contraseña esperada: client123';
    if (form.email.includes('tgr')) return 'Contraseña esperada: client123';
    if (form.email.includes('admin')) return 'Contraseña esperada: admin123';
    return 'Introduce tus credenciales corporativas.';
  }, [form.email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user } = await authenticateUser(form);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#eef2ff] to-[#dfe4ff] text-slate-900 flex flex-col justify-between">
      {/* Header Unificado idéntico al TopNavBar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-[#002395] tracking-tight">
                  S&A
                </span>
                <span className="ml-1 text-[10px] font-bold text-[#002395] tracking-widest uppercase">
                  CHILE
                </span>
              </div>
              <div className="h-5 w-px bg-slate-300 hidden sm:block" />
              <span className="hidden sm:inline-block text-xs font-semibold text-[#002395] tracking-tight uppercase">
                Centro de Herramientas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container optimizado para Notebooks (sin scroll forzado) */}
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,35,149,0.15)] px-6 py-6 sm:px-8 sm:py-7">
            
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#002395]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#002395] mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso Seguro
              </div>
              <h1 className="text-2xl font-extrabold text-[#001360] tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Ingrese con sus credenciales corporativas autorizadas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo corporativo
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-[#002395] transition-colors">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="nombre@empresa.cl"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-[#002395] transition-colors">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs text-slate-600">
                <span className="font-semibold text-[#002395]">Ayuda:</span> {passwordHint}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002395] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#001a70] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-2"
              >
                {isLoading ? 'Autenticando…' : 'Acceder al Hub'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer corporativo ligero integrado */}
      <Footer />
    </div>
  );
};