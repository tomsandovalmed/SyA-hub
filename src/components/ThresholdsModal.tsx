import React, { useState, useEffect } from 'react';
import { ThresholdConfig } from '../types';
import { X, Settings, Sliders, CheckCircle2 } from 'lucide-react';

interface ThresholdsModalProps {
  isOpen: boolean;
  config: ThresholdConfig;
  onClose: () => void;
  onSave: (newConfig: ThresholdConfig) => void;
}

export const ThresholdsModal: React.FC<ThresholdsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ThresholdConfig>(config);

  useEffect(() => {
    if (config) setFormData(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#002395]" />
            <h3 className="text-lg font-bold text-gray-900">Configuración de Umbrales Ideal (S&A Chile)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#002395] shrink-0" />
            <span>Valores precargados según estándar oficial para análisis de instancias SQL Server.</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#002395]" />
              Criterios del Informe de Rendimiento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Memory\Pages/sec</label>
                <span className="text-gray-400 block mb-2">Ideal: &lt; 20</span>
                <input
                  type="number"
                  value={formData.memoryPagesSecLimit ?? 20}
                  onChange={(e) => setFormData({ ...formData, memoryPagesSecLimit: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">% Processor Time (Warning)</label>
                <span className="text-gray-400 block mb-2">Alerta: &gt;= 50%</span>
                <input
                  type="number"
                  value={formData.cpuWarning ?? 50}
                  onChange={(e) => setFormData({ ...formData, cpuWarning: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">% Processor Time (Critical)</label>
                <span className="text-gray-400 block mb-2">Ideal: &lt; 80%</span>
                <input
                  type="number"
                  value={formData.cpuCritical ?? 80}
                  onChange={(e) => setFormData({ ...formData, cpuCritical: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Buffer Cache Hit Ratio (Warning)</label>
                <span className="text-gray-400 block mb-2">Alerta: &lt;= 95%</span>
                <input
                  type="number"
                  value={formData.bufferWarning ?? 95}
                  onChange={(e) => setFormData({ ...formData, bufferWarning: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Buffer Cache Hit Ratio (Critical)</label>
                <span className="text-gray-400 block mb-2">Ideal: &gt; 80%</span>
                <input
                  type="number"
                  value={formData.bufferCritical ?? 80}
                  onChange={(e) => setFormData({ ...formData, bufferCritical: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Cache Hit Ratio (OLTP)</label>
                <span className="text-gray-400 block mb-2">Ideal: &gt; 95%</span>
                <input
                  type="number"
                  value={formData.cacheHitRatioOLTP ?? 95}
                  onChange={(e) => setFormData({ ...formData, cacheHitRatioOLTP: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Cache Hit Ratio (OLAP)</label>
                <span className="text-gray-400 block mb-2">Ideal: &gt; 80%</span>
                <input
                  type="number"
                  value={formData.cacheHitRatioOLAP ?? 80}
                  onChange={(e) => setFormData({ ...formData, cacheHitRatioOLAP: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">SQL Compilation/Sec</label>
                <span className="text-gray-400 block mb-2">Ideal: &lt;= 100</span>
                <input
                  type="number"
                  value={formData.sqlCompilationsSecLimit ?? 100}
                  onChange={(e) => setFormData({ ...formData, sqlCompilationsSecLimit: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <label className="font-bold text-gray-700 block mb-1">Locks: Lock Requests/sec</label>
                <span className="text-gray-400 block mb-2">Ideal: &lt; 1000</span>
                <input
                  type="number"
                  value={formData.locksSecLimit ?? 1000}
                  onChange={(e) => setFormData({ ...formData, locksSecLimit: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-mono"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002395] hover:bg-[#001a70] text-white cursor-pointer shadow-xs"
            >
              Guardar Cambios
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};