import React, { useState } from 'react';
import { ViewMode, ModuleType, PerfmonCounterData, ThresholdViolation, ThresholdConfig } from '../types';
import { PerfmonChartCard } from './PerfmonChartCard';
import { ThresholdsModal } from './ThresholdsModal';
import { ReportExportModal } from './ReportExportModal';
import { parsePerfmonCsv } from '../utils/csvParser';
import { Upload, FileText, Sliders, AlertTriangle, RefreshCw, CheckCircle2, ChevronRight, Layers, Play, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface PerfmonAnalyzerViewProps {
  selectedModule: ModuleType;
  onChangeModule: (module: ModuleType) => void;
  counters: PerfmonCounterData[];
  alerts: ThresholdViolation[];
  thresholdConfig: ThresholdConfig;
  onUpdateThresholds: (config: ThresholdConfig) => void;
  onAnalyzeFile: (parsedCounters: PerfmonCounterData[], filename: string) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const PerfmonAnalyzerView: React.FC<PerfmonAnalyzerViewProps> = ({
  selectedModule,
  onChangeModule,
  counters,
  alerts,
  thresholdConfig,
  onUpdateThresholds,
  onAnalyzeFile,
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeCounterId, setActiveCounterId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredCounters = counters.filter((c) => c.module === selectedModule || !c.module);
  const activeCounter = filteredCounters.find((c) => c.id === activeCounterId) || filteredCounters[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMessage(null);
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcessCsv = () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { counters: parsedCounters, error } = parsePerfmonCsv(text, selectedModule);

      setIsAnalyzing(false);

      if (error) {
        setErrorMessage(error);
        return;
      }

      onAnalyzeFile(parsedCounters, selectedFile.name);
      setSuccessToast(`Archivo "${selectedFile.name}" procesado correctamente (${parsedCounters.length} contadores).`);
      setTimeout(() => setSuccessToast(null), 4000);
    };

    reader.onerror = () => {
      setIsAnalyzing(false);
      setErrorMessage('Error al leer el archivo desde el disco.');
    };

    // Intentamos leer con encoding estándar utf-8 / latin-1
    reader.readAsText(selectedFile, 'utf-8');
  };

  const handleTriggerReport = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsReportModalOpen(true);
    }, 500);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Breadcrumb Navigation & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
          <button onClick={() => onNavigate?.('hub')} className="hover:text-[#002395] hover:underline cursor-pointer">
            Análisis SQL
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button onClick={() => onNavigate?.('module-select')} className="hover:text-[#002395] hover:underline cursor-pointer">
            Selección Módulo
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#002395] font-bold">Perfmon {selectedModule}</span>
        </div>

        <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl border border-gray-300">
          <button
            onClick={() => onChangeModule('SII')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              selectedModule === 'SII' ? 'bg-[#002395] text-white shadow-xs' : 'text-gray-700 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Módulo SII
          </button>
          <button
            onClick={() => onChangeModule('TGR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              selectedModule === 'TGR' ? 'bg-[#001360] text-white shadow-xs' : 'text-gray-700 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Módulo TGR
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#002395] tracking-tight">
          Perfmon SQL {selectedModule}
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Cargue un archivo de registros .csv o .blg para generar los gráficos de diagnóstico técnico.
        </p>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          
          <div className="flex-grow">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Seleccionar archivo (.csv, .blg)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label 
                htmlFor="file-upload-input"
                className="cursor-pointer bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-[#002395] transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                <span>Cargar archivo</span>
                <input
                  id="file-upload-input"
                  className="hidden"
                  type="file"
                  accept=".csv, .blg"
                  onChange={handleFileUpload}
                />
              </label>

              <span className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 truncate max-w-xs">
                {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
              </span>

              <button
                onClick={handleProcessCsv}
                disabled={isAnalyzing || !selectedFile}
                className="bg-[#002395] hover:bg-[#001a70] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Procesar Archivo .csv
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTriggerReport}
              disabled={filteredCounters.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Generar Reporte Completo
            </button>

            <button
              onClick={() => setIsThresholdModalOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#002395]" />
              Configurar Umbrales
            </button>
          </div>

        </div>
      </div>

      {/* Alerta de Error si el CSV es incompatible o está vacío */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Estado Vacío */}
      {filteredCounters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-300 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#002395]">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">Esperando archivo Perfmon</h3>
            <p className="text-sm text-gray-500 mt-1">
              Seleccione y procese un archivo <code className="text-[#002395] font-mono font-semibold">.csv</code> para renderizar los gráficos de contadores del Módulo {selectedModule}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs Selector de Contadores */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredCounters.map((cnt, idx) => (
              <button
                key={cnt.id}
                onClick={() => setActiveCounterId(cnt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
                  activeCounter?.id === cnt.id
                    ? 'bg-[#002395] text-white border-[#002395] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="font-mono">{idx + 1}.</span>
                {cnt.name}
                {cnt.condition === 'CRITICAL' && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                )}
              </button>
            ))}
          </div>

          {/* Gráfico Activo */}
          {activeCounter && (
            <PerfmonChartCard 
              counterData={activeCounter} 
              counterIndex={filteredCounters.findIndex(c => c.id === activeCounter.id) + 1} 
            />
          )}

          {/* Tabla de Alertas */}
          {alerts.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-base font-bold text-[#002395] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Alertas de Rendimiento (Threshold violations)
                </h2>
                <span className="text-xs font-mono font-semibold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                  {alerts.length} violaciones registradas
                </span>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
                  <thead>
                    <tr className="text-xs font-bold text-gray-500 bg-gray-50">
                      <th className="px-4 py-3 text-left">Time Range</th>
                      <th className="px-4 py-3 text-left">Condition</th>
                      <th className="px-4 py-3 text-left">Counter</th>
                      <th className="px-4 py-3 text-right">Avg Value</th>
                      <th className="px-4 py-3 text-right">Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {alerts.map((al) => (
                      <tr key={al.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{al.timeRange}</td>
                        <td className="px-4 py-3 text-sm font-bold text-red-600 uppercase">{al.condition}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">{al.counter}</td>
                        <td className="px-4 py-3 text-sm font-mono text-right font-bold text-gray-900">{al.avgValue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-mono text-right text-gray-400">{al.limit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* Modales */}
      <ThresholdsModal
        isOpen={isThresholdModalOpen}
        config={thresholdConfig}
        onClose={() => setIsThresholdModalOpen(false)}
        onSave={onUpdateThresholds}
      />

      <ReportExportModal
        isOpen={isReportModalOpen}
        selectedModule={selectedModule}
        selectedFileName={selectedFile?.name || 'log.csv'}
        counters={filteredCounters}
        alerts={alerts}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};