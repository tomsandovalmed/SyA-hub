import React, { useState } from 'react';
import { ThresholdConfig } from '../types';
import { Sliders, X, Save, RotateCcw, AlertTriangle } from 'lucide-react';

interface ThresholdsModalProps {
  config: ThresholdConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: ThresholdConfig) => void;
}

export const ThresholdsModal: React.FC<ThresholdsModalProps> = ({ config, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ThresholdConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      cpuCriticalLimit: 80,
      memoryMinAvailableMB: 1000,
      pageLifeExpectancySec: 300,
      bufferCacheHitRatio: 95,
      diskQueueLengthMax: 2,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5 text-[#002395]">
            <Sliders className="w-6 h-6" />
            <h3 className="text-xl font-bold">Configuración de Umbrales de Rendimiento</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-4">
            
            {/* CPU Limit */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Límite Crítico CPU (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.cpuCriticalLimit}
                  onChange={(e) => setFormData({ ...formData, cpuCriticalLimit: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#002395] focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Genera alertas críticas si la utilización promedia de CPU sobrepasa este límite.
              </p>
            </div>

            {/* RAM MBytes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Memoria RAM Mínima Disponible (MB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="100"
                  max="64000"
                  value={formData.memoryMinAvailableMB}
                  onChange={(e) => setFormData({ ...formData, memoryMinAvailableMB: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#002395] focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">MB</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Mínimo de RAM física disponible permitida antes de gatillar advertencia.
              </p>
            </div>

            {/* PLE */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Page Life Expectancy Mínimo (segundos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="30"
                  max="3600"
                  value={formData.pageLifeExpectancySec}
                  onChange={(e) => setFormData({ ...formData, pageLifeExpectancySec: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#002395] focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">sec</span>
              </div>
            </div>

            {/* Disk Queue */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Longitud Máxima de Cola de Disco (Avg Disk Queue Length)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.diskQueueLengthMax}
                  onChange={(e) => setFormData({ ...formData, diskQueueLengthMax: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#002395] focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono">q-length</span>
              </div>
            </div>

          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Los umbrales guardados se aplicarán de inmediato al motor de reportes FastAPI.</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Valores
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#002395] hover:bg-[#001A70] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar Umbrales
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
