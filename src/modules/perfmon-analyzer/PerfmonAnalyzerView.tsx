import React, { useState, useMemo, useCallback } from 'react';
import { ViewMode, ModuleType, PerfmonCounterData, ThresholdViolation, ThresholdConfig } from './types/perfmon.types';
import { PerfmonChartCard } from './components/PerfmonChartCard';
import { ThresholdsModal } from './components/ThresholdsModal';
import { ReportExportModal } from './components/ReportExportModal';
import { parsePerfmonCsv } from './utils/csvParser';
import {
  Upload,
  FileText,
  Settings,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Play,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface PerfmonAnalyzerViewProps {
  selectedModule: ModuleType;
  onChangeModule: (module: ModuleType) => void;
  counters: PerfmonCounterData[];
  alerts: ThresholdViolation[];
  thresholdConfig: ThresholdConfig;
  onUpdateThresholds: (config: ThresholdConfig) => void;
  onAnalyzeFile: (
    parsedCounters: PerfmonCounterData[],
    parsedAlerts: ThresholdViolation[],
    filename: string
  ) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const PerfmonAnalyzerView: React.FC<PerfmonAnalyzerViewProps> = ({
  selectedModule,
  counters,
  alerts,
  thresholdConfig,
  onUpdateThresholds,
  onAnalyzeFile,
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeCounterId, setActiveCounterId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredCounters = useMemo(
    () => counters.filter((c) => c.module === selectedModule || !c.module),
    [counters, selectedModule]
  );

  const activeCounter = useMemo(
    () => filteredCounters.find((c) => c.id === activeCounterId) || filteredCounters[0],
    [filteredCounters, activeCounterId]
  );

  const activeCounterAlerts = useMemo(
    () => (activeCounter ? alerts.filter((a) => a.counterId === activeCounter.id) : []),
    [alerts, activeCounter]
  );

  const activeCounterIndex = useMemo(
    () => (activeCounter ? filteredCounters.findIndex((c) => c.id === activeCounter.id) + 1 : 1),
    [filteredCounters, activeCounter]
  );

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMessage(null);
    if (file) setSelectedFile(file);
  }, []);

  const handleProcessCsv = useCallback(() => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { counters: parsedCounters, alerts: parsedAlerts, error } = parsePerfmonCsv(
        text,
        selectedModule,
        thresholdConfig
      );

      setIsAnalyzing(false);

      if (error) {
        setErrorMessage(error);
        return;
      }

      onAnalyzeFile(parsedCounters, parsedAlerts, selectedFile.name);
      setActiveCounterId(parsedCounters[0]?.id ?? '');
      setSuccessToast(`Archivo "${selectedFile.name}" procesado con éxito.`);
      setTimeout(() => setSuccessToast(null), 4000);
    };

    reader.onerror = () => {
      setIsAnalyzing(false);
      setErrorMessage('Error al leer el archivo desde el disco.');
    };

    reader.readAsText(selectedFile);
  }, [selectedFile, selectedModule, thresholdConfig, onAnalyzeFile]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
        <button
          type="button"
          onClick={() => onNavigate?.('hub')}
          className="hover:text-[#002395] hover:underline cursor-pointer"
        >
          Análisis SQL
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button
          type="button"
          onClick={() => onNavigate?.('module-select')}
          className="hover:text-[#002395] hover:underline cursor-pointer"
        >
          Selección Módulo
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#002395] font-bold">Perfmon {selectedModule}</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-[#002395] tracking-tight">
          Perfmon SQL {selectedModule}
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Cargue un archivo de registros .csv o .blg para generar los gráficos de diagnóstico técnico.
        </p>
      </div>

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
                type="button"
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
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              disabled={filteredCounters.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Generar Reporte Completo
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#002395]" />
              Configuración
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successToast && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {filteredCounters.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-300 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#002395]">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900">Esperando archivo Perfmon</h3>
            <p className="text-sm text-gray-500 mt-1">
              Seleccione y procese un archivo{' '}
              <code className="text-[#002395] font-mono font-semibold">.csv</code> para renderizar los
              gráficos de contadores del Módulo {selectedModule}.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredCounters.map((cnt, idx) => (
              <button
                key={cnt.id}
                type="button"
                onClick={() => setActiveCounterId(cnt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
                  activeCounter?.id === cnt.id
                    ? 'bg-[#002395] text-white border-[#002395] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="font-mono">{idx + 1}.</span>
                {cnt.name}
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cnt.condition === 'CRITICAL'
                      ? 'bg-red-400 animate-pulse'
                      : cnt.condition === 'WARNING'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400'
                  }`}
                />
              </button>
            ))}
          </div>

          {activeCounter && (
            <PerfmonChartCard
              key={activeCounter.id}
              counterData={activeCounter}
              counterIndex={activeCounterIndex}
              alerts={activeCounterAlerts}
            />
          )}
        </>
      )}

      <ThresholdsModal
        isOpen={isSettingsOpen}
        config={thresholdConfig}
        onClose={() => setIsSettingsOpen(false)}
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
