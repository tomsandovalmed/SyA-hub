import React, { useMemo, useState } from 'react';
import { ModoVista, TipoModulo } from '../../modules/analizador-rendimiento/types/tiposAnalizador';
import { Bell, Settings, LayoutGrid, Clock, CheckSquare, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import type { User } from '../../types';

interface TopNavBarProps {
  currentView: ModoVista;
  selectedModule: TipoModulo;
  authUser: User;
  onNavigate: (view: ModoVista) => void;
  onLogout: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, selectedModule, authUser, onNavigate, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => {
    const names = authUser.name.split(' ');
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }, [authUser.name]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('hub')}
              className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
              title="Volver al Centro de Herramientas"
            >
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-[#002395] tracking-tight group-hover:text-[#001A70] transition-colors">
                  S&A
                </span>
                <span className="ml-1 text-[10px] font-bold text-[#002395] tracking-widest uppercase">
                  CHILE
                </span>
              </div>
              <div className="h-5 w-px bg-gray-300 hidden sm:block" />
              <span className="hidden sm:inline-block text-xs font-semibold text-[#002395] tracking-tight uppercase">
                Centro de Herramientas
              </span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('hub')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'hub'
                  ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                  : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Herramientas
            </button>

            <button
              onClick={() => onNavigate('history' as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === ('history' as ViewMode)
                  ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                  : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Historial
            </button>

            <button
              onClick={() => onNavigate('tasks' as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === ('tasks' as ViewMode)
                  ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                  : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tareas
            </button>

            {authUser.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin' as ViewMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentView === ('admin' as ViewMode)
                    ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                    : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="p-2 text-gray-500 hover:text-[#002395] hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button
              className="p-2 text-gray-500 hover:text-[#002395] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Configuración"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002395] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-gray-900">{authUser.name}</span>
                  <span className="text-[10px] text-gray-500">{authUser.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-20 mt-3 w-72 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3 rounded-3xl bg-[#002395]/5 px-3 py-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#002395] text-sm font-bold text-white">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{authUser.name}</p>
                      <p className="text-xs text-gray-500">{authUser.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-gray-700">
                    <div className="rounded-2xl bg-gray-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Rol</p>
                      <p className="mt-1 font-semibold text-gray-900">{authUser.role}</p>
                    </div>
                    {authUser.clientId && (
                      <div className="rounded-2xl bg-gray-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Client ID</p>
                        <p className="mt-1 font-semibold text-gray-900">{authUser.clientId}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#002395] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#001a70]"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};