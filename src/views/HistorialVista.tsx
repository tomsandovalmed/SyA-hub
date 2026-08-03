import React from 'react';
import { ViewMode, OperationHistoryItem } from '../types';
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

interface HistorialVistaProps {
  history: OperationHistoryItem[];
  onNavigate?: (view: ViewMode) => void;
}

export const HistorialVista: React.FC<HistorialVistaProps> = ({ history, onNavigate }) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* 🟢 Breadcrumb Navegable */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
        <button 
          onClick={() => onNavigate?.('hub')}
          className="hover:text-[#002395] hover:underline cursor-pointer transition-colors"
        >
          Análisis SQL
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#002395] font-bold">Historial de Acciones</span>
      </div>

      {/* Header de la sección */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#001360] flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-[#002395]" />
            Historial de Acciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Auditoría y registro en tiempo real de todas las ejecuciones técnicas y análisis de archivos realizados en la plataforma.
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-[#002395] border border-blue-100 rounded-full text-xs font-mono font-semibold self-start md:self-auto">
          {history.length} operaciones registradas
        </span>
      </div>

      {/* Tabla Principal */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th className="px-8 py-4">Herramienta</th>
                <th className="px-8 py-4">Usuario</th>
                <th className="px-8 py-4">Fecha / Hora</th>
                <th className="px-8 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {history.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/30 transition-colors' : 'bg-slate-50/60 hover:bg-blue-50/30 transition-colors'}
                >
                  <td className="px-8 py-4 font-semibold text-gray-900 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#002395]"></span>
                    {item.herramienta}
                  </td>
                  <td className="px-8 py-4 font-medium text-gray-600">{item.usuario}</td>
                  <td className="px-8 py-4 text-gray-500 font-mono text-xs">{item.fecha}</td>
                  <td className="px-8 py-4 text-right">
                    {item.estado === 'Completado' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completado
                      </span>
                    )}
                    {item.estado === 'Pendiente' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pendiente
                      </span>
                    )}
                    {item.estado === 'En Proceso' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        En Proceso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};