import React from 'react';
import { ModuleType } from '../types';
import { Rocket, BarChart3, Play, Database } from 'lucide-react';

interface InicioVistaProps {
  onSelectTool: () => void;
  onOpenModule: (module: ModuleType) => void;
}

// AQUÍ FORZAMOS LA EXPORTACIÓN NOMBRADA: "export const InicioVista"
export const InicioVista: React.FC<InicioVistaProps> = ({ onSelectTool, onOpenModule }) => {
  return (
    <div className="space-y-10 pb-12">
      
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#eff4ff] via-[#f8f9ff] to-[#dee1ff] rounded-2xl p-8 md:p-12 border border-[#d3e4fe] shadow-xs relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002395]/10 text-[#002395] text-xs font-bold uppercase tracking-wider mb-4">
            <Database className="w-3.5 h-3.5" />
            S&A Data Analysis Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#001360] tracking-tight leading-tight">
            Centro de Herramientas de Análisis
          </h1>
          <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
            Optimice la toma de decisiones con nuestra suite técnica. Visualice rendimientos, genere reportes precisos y gestione datos críticos con la precisión que su negocio demanda.
          </p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <BarChart3 className="w-96 h-96 text-[#002395]" />
        </div>
      </section>

      {/* Main Feature: Interprete Perfmon Bento Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row">
          
          {/* Columna Izquierda */}
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 text-[#002395] rounded-xl border border-blue-100">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#001360]">
                    Interprete Perfmon y generador de informes
                  </h2>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Herramienta Principal
                  </span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed text-sm md:text-base mt-4">
                El motor avanzado de interpretación de rendimiento permite analizar logs complejos (.csv, .blg) y transformarlos en visualizaciones accionables con gráficos Chart.js en tiempo real. Identifique cuellos de botella de CPU, memoria y SQL Server de manera inmediata.
              </p>
            </div>

            <div className="mt-8 flex items-center">
              <button
                onClick={onSelectTool}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#002395] hover:bg-[#001A70] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <Rocket className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                Utilizar Herramienta
              </button>
            </div>
          </div>

          {/* Columna Derecha (Motor Algorítmico) */}
          <div className="w-full lg:w-2/5 bg-slate-900 p-8 flex flex-col justify-center items-center text-white relative min-h-[260px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#002395]/40 to-slate-950 opacity-90"></div>
            
            <div className="relative z-10 text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-blue-300">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h3 className="text-lg font-bold">Motor Algorítmico FastAPI</h3>
              <p className="text-xs text-blue-200">
                Soporta archivos de diagnóstico masivos Perfmon SQL (.csv/.blg) con detección automática de violaciones de umbral.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/30 rounded-md text-[10px] font-mono font-medium text-blue-200">
                  SII XML Validations
                </span>
                <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-md text-[10px] font-mono font-medium text-indigo-200">
                  TGR Conciliation
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};