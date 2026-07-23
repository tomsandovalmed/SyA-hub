import React, { useState } from 'react';
import { ModuleType, ViewMode } from '../types';
import { Landmark, Receipt, ArrowRight, Info, ChevronRight, BookOpen, X } from 'lucide-react';

interface ModuleSelectionViewProps {
  onSelectModule: (module: ModuleType) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const SeleccionModulo: React.FC<ModuleSelectionViewProps> = ({ onSelectModule, onNavigate }) => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Breadcrumb Navigation - Cliqueable */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
        <button 
          onClick={() => onNavigate?.('hub')}
          className="hover:text-[#002395] hover:underline cursor-pointer transition-colors"
        >
          Análisis SQL
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#002395] font-bold">Selección de Módulo</span>
      </div>

      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#001360] tracking-tight">
          Seleccionar Módulo de Análisis
        </h1>
        <p className="mt-2 text-gray-600 text-base max-w-3xl leading-relaxed">
          Elija el entorno de origen para el análisis de registros. Perfmon SQL Analyzer aplicará los algoritmos de diagnóstico específicos para la estructura de datos seleccionada.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Módulo SII */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group border-t-4 border-t-[#002395]">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 text-[#002395] group-hover:scale-110 transition-transform">
            <Landmark className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Módulo SII
          </h2>

          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Optimizado para el análisis de registros del Servicio de Impuestos Internos. Incluye validación de sintaxis XML, cruce de folios y auditoría de integridad transaccional para cumplimiento tributario.
          </p>

          <div className="mt-auto w-full">
            <button
              onClick={() => onSelectModule('SII')}
              className="w-full bg-[#002395] hover:bg-[#001A70] text-white font-bold py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              SELECCIONAR MÓDULO SII
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Módulo TGR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group border-t-4 border-t-[#001A70]">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 text-[#002395] group-hover:scale-110 transition-transform">
            <Receipt className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Módulo TGR
          </h2>

          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Diseñado para el análisis de registros de la Tesorería General de la República. Enfocado en la conciliación de pagos masivos, liquidaciones de deuda y reportes de recaudación estatal.
          </p>

          <div className="mt-auto w-full">
            <button
              onClick={() => onSelectModule('TGR')}
              className="w-full bg-[#001360] hover:bg-[#002395] text-white font-bold py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              SELECCIONAR MÓDULO TGR
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Auxiliary Info Box */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="p-3 bg-white rounded-full shadow-xs border border-blue-100 text-[#002395]">
          <Info className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-gray-900 text-base">¿No está seguro de qué módulo elegir?</h4>
          <p className="text-sm text-gray-600 mt-1">
            Revise la documentación del sistema o consulte con el administrador del clúster de datos SQL antes de proceder con el diagnóstico.
          </p>
        </div>
        <button
          onClick={() => setShowDocsModal(true)}
          className="px-5 py-2.5 bg-white border border-[#002395] text-[#002395] font-bold rounded-xl hover:bg-blue-50 transition-colors text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
        >
          Ver Documentación
        </button>
      </div>

      {/* Documentation Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-[#002395]">
                <BookOpen className="w-6 h-6" />
                <h3 className="text-xl font-bold">Guía de Selección de Módulo</h3>
              </div>
              <button 
                onClick={() => setShowDocsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">Módulo SII (Servicio de Impuestos Internos)</h4>
                <p>
                  Utilice esta opción cuando analice servidores SQL Server dedicados a la emisión, recepción y validación de Documentos Tributarios Electrónicos (DTE), facturas electrónicas e integración con APIs del SII.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">Módulo TGR (Tesorería General de la República)</h4>
                <p>
                  Elija este entorno para diagnósticos de servidores SQL Server encargados de pagos masivos de tesorería, recaudación fiscal, declaraciones juradas de fondos públicos y procesos batch nocturnos de liquidación.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-6 py-2.5 bg-[#002395] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};