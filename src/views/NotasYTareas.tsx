import React, { useState } from 'react';
import { ViewMode } from '../modules/perfmon-analyzer/types/perfmon.types';
import { CheckSquare, Plus, Trash2, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export type EstadoTarea = 'Pendiente' | 'En Proceso' | 'Listo';

export interface TareaItem {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  fecha: string;
}

interface NotasYTareasProps {
  onNavigate?: (view: ViewMode) => void;
}

export const NotasYTareas: React.FC<NotasYTareasProps> = ({ onNavigate }) => {
  const [tareas, setTareas] = useState<TareaItem[]>([
    {
      id: '1',
      titulo: 'Revisar logs de TGR',
      descripcion: 'Validar incremento en tiempo de respuesta durante la ejecución nocturna batch.',
      estado: 'En Proceso',
      fecha: '2026-07-23',
    },
    {
      id: '2',
      titulo: 'Ajustar umbrales de Buffer Cache',
      descripcion: 'Actualizar alerta de violación al 85% para servidores SII.',
      estado: 'Pendiente',
      fecha: '2026-07-22',
    }
  ]);

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTarea>('Pendiente');

  const handleAgregarTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    const nuevaItem: TareaItem = {
      id: `task-${Date.now()}`,
      titulo: nuevoTitulo,
      descripcion: nuevaDescripcion,
      estado: nuevoEstado,
      fecha: new Date().toISOString().split('T')[0],
    };

    setTareas([nuevaItem, ...tareas]);
    setNuevoTitulo('');
    setNuevaDescripcion('');
    setNuevoEstado('Pendiente');
  };

  const handleCambiarEstado = (id: string, estado: EstadoTarea) => {
    setTareas(tareas.map(t => t.id === id ? { ...t, estado } : t));
  };

  const handleEliminarTarea = (id: string) => {
    setTareas(tareas.filter(t => t.id !== id));
  };

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
        <span className="text-[#002395] font-bold">Notas y Tareas Pendientes</span>
      </div>

      {/* Header Title */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#001360] flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#002395]" />
            Notas y Tareas Pendientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestione pendientes, recordatorios técnicos y notas de seguimiento del clúster de datos.
          </p>
        </div>
      </div>

      {/* Formulario de Nueva Tarea */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-[#001360] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#002395]" />
          Nueva Nota / Tarea
        </h3>
        <form onSubmit={handleAgregarTarea} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Ej. Revisar memoria en servidor de contingencia"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#002395]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Estado Inicial</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as EstadoTarea)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#002395] bg-white cursor-pointer"
              >
                <option value="Pendiente">🟡 Pendiente</option>
                <option value="En Proceso">🔵 En Proceso</option>
                <option value="Listo">🟢 Listo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción / Nota</label>
            <textarea
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              placeholder="Detalles técnicos adicionales u observaciones..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#002395]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#002395] hover:bg-[#001A70] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Guardar Tarea
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Tareas */}
      <div className="space-y-3">
        {tareas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-200">
            No hay notas ni tareas registradas.
          </div>
        ) : (
          tareas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-base">{item.titulo}</h4>
                  <span className="text-xs text-gray-400 font-mono">({item.fecha})</span>
                </div>
                {item.descripcion && (
                  <p className="text-sm text-gray-600">{item.descripcion}</p>
                )}
              </div>

              {/* Combobox de Estado + Botón Eliminar */}
              <div className="flex items-center gap-3">
                <select
                  value={item.estado}
                  onChange={(e) => handleCambiarEstado(item.id, e.target.value as EstadoTarea)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
                    item.estado === 'Listo'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : item.estado === 'En Proceso'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <option value="Pendiente">🟡 Pendiente</option>
                  <option value="En Proceso">🔵 En Proceso</option>
                  <option value="Listo">🟢 Listo</option>
                </select>

                <button
                  onClick={() => handleEliminarTarea(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};