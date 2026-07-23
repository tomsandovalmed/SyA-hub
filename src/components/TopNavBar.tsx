import React from 'react';
import { ViewMode, ModuleType } from '../types';
import { Bell, Settings, LayoutGrid, Clock, CheckSquare } from 'lucide-react';

interface TopNavBarProps {
  currentView: ViewMode;
  selectedModule: ModuleType;
  onNavigate: (view: ViewMode) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, selectedModule, onNavigate }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand & Logo */}
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
              <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
              <span className="hidden sm:inline-block text-xs font-semibold text-[#002395] tracking-tight uppercase">
                Data Analysis Hub
              </span>
            </button>
          </div>

          {/* Center Navigation Links - Tres secciones ordenadas */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            
            {/* 1. Herramientas */}
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

            {/* 2. Historial de acciones */}
            <button
              onClick={() => onNavigate('history' as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === ('history' as ViewMode)
                  ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                  : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Historial de acciones
            </button>

            {/* 3. Notas y tareas pendientes */}
            <button
              onClick={() => onNavigate('tasks' as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === ('tasks' as ViewMode)
                  ? 'text-[#002395] bg-blue-50 font-bold border-b-2 border-[#002395]'
                  : 'text-gray-600 hover:text-[#002395] hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Notas y tareas pendientes
            </button>

          </nav>

          {/* Trailing Controls */}
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
            
            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#002395] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                TS
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-gray-800 leading-none">J. Cordero</p>
                <p className="text-[10px] text-gray-500 leading-tight">Analista SQL Senior</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};