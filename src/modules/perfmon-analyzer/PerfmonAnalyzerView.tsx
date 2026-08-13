import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ModoVista, TipoModulo, DatosContadorPerfmon, ViolacionUmbral, ConfiguracionUmbrales } from './types/perfmon.types';
import { PerfmonChartCard } from './components/PerfmonChartCard';
import { ThresholdsModal } from './components/ThresholdsModal';
import { ReportExportModal } from './components/ReportExportModal';
import { parsePerfmonCsv, parseMultiplePerfmonCsv } from './utils/csvParser';
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
  selectedModule: TipoModulo;
  onChangeModule: (module: TipoModulo) => void;
  counters: DatosContadorPerfmon[];
  alerts: ViolacionUmbral[];
  thresholdConfig: ConfiguracionUmbrales;
  onUpdateThresholds: (config: ConfiguracionUmbrales) => void;
  onAnalyzeFile: (
    parsedCounters: DatosContadorPerfmon[],
    parsedAlerts: ViolacionUmbral[],
    filename: string
  ) => void;
  onNavigate?: (view: ModoVista) => void;
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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [activeCounterId, setActiveCounterId] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [successToast, setSuccessToast] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<string>('Todos');

    const [uploadedFiles, setUploadedFiles] = useState<{
      id: string;
      name: string;
      module: TipoModulo;
      uploadedAt: string;
      counters: DatosContadorPerfmon[];
      alerts: ViolacionUmbral[];
    }[]>(() => {
      try {
        const raw = localStorage.getItem('perfmon_uploaded_files');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem('perfmon_uploaded_files', JSON.stringify(uploadedFiles));
      } catch {}
    }, [uploadedFiles]);

    const filteredCounters = useMemo(() => {
      return counters.filter(
        (c) => (c.modulo === selectedModule || !c.modulo) && (selectedServer === 'Todos' || c.nombreServidor === selectedServer)
      );
    }, [counters, selectedModule, selectedServer]);

    const activeCounter = useMemo(
      () => filteredCounters.find((c) => c.id === activeCounterId) || filteredCounters[0],
      [filteredCounters, activeCounterId]
    );

    const activeCounterAlerts = useMemo(
      () => (activeCounter ? alerts.filter((a) => a.contadorId === activeCounter.id) : []),
      [alerts, activeCounter]
    );

    const activeCounterIndex = useMemo(
      () => (activeCounter ? filteredCounters.findIndex((c) => c.id === activeCounter.id) + 1 : 1),
      [filteredCounters, activeCounter]
    );

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      setErrorMessage(null);
      if (files.length > 0) {
        setSelectedFiles(files);
        setSelectedFile(files[0] ?? null);
      }
    }, []);

    const handleProcessCsv = useCallback(async () => {
      const filesToProcess = selectedFiles.length > 0 ? selectedFiles : selectedFile ? [selectedFile] : [];
      if (filesToProcess.length === 0) return;

      setIsAnalyzing(true);
      setErrorMessage(null);

      try {
        const texts = await Promise.all(
          filesToProcess.map((f) =>
            new Promise<{ name: string; text: string }>((resolve, reject) => {
              const r = new FileReader();
              r.onload = (ev) => resolve({ name: f.name, text: ev.target?.result as string });
              r.onerror = () => reject(new Error('Error leyendo archivo'));
              r.readAsText(f);
            })
          )
        );

        const { counters: parsedCounters, alerts: parsedAlerts, error } = parseMultiplePerfmonCsv(texts, selectedModule, thresholdConfig);

        setIsAnalyzing(false);

        if (error) {
          setErrorMessage(error);
          return;
        }

        const fileEntryId = `upload-${Date.now()}`;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: fileEntryId,
            name: filesToProcess.map((f) => f.name).join(', '),
            module: selectedModule,
            uploadedAt: new Date().toISOString(),
            counters: parsedCounters,
            alerts: parsedAlerts,
          },
        ]);

        onAnalyzeFile(parsedCounters, parsedAlerts, filesToProcess.map((f) => f.name).join(', '));
        setActiveCounterId(parsedCounters[0]?.id ?? '');
        setSuccessToast(`Procesados ${filesToProcess.length} archivo(s).`);
        setTimeout(() => setSuccessToast(null), 4000);
      } catch (err) {
        setIsAnalyzing(false);
        setErrorMessage('Error procesando los archivos seleccionados.');
      }
    }, [selectedFile, selectedFiles, selectedModule, thresholdConfig, onAnalyzeFile]);

    return (
      <div className="space-y-8 pb-12">
        {/* Top controls: servidor selector + repo count */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase text-gray-500">Servidor:</label>
            <select value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-[#002395] bg-white">
              <option value="Todos">Todos</option>
              {Array.from(new Set(counters.map((c) => c.nombreServidor))).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">Repositorio: {uploadedFiles.length} archivo(s)</div>
        </div>

        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
          <button type="button" onClick={() => onNavigate?.('hub')} className="hover:text-[#002395] hover:underline cursor-pointer">Análisis SQL</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button type="button" onClick={() => onNavigate?.('module-select')} className="hover:text-[#002395] hover:underline cursor-pointer">Selección Módulo</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#002395] font-bold">Perfmon {selectedModule}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[#002395] tracking-tight">Perfmon SQL {selectedModule}</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Cargue un archivo de registros .csv o .blg para generar los gráficos de diagnóstico técnico.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            <div className="flex-grow">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Seleccionar archivo (.csv, .blg)</label>
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="file-upload-input" className="cursor-pointer bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-[#002395] transition-colors flex items-center gap-2 shadow-2xs">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Cargar archivo(s) o carpeta</span>
                  <input id="file-upload-input" className="hidden" type="file" accept=".csv, .blg" multiple {...({ webkitdirectory: true } as any)} onChange={handleFileUpload} />
                </label>

                <span className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 truncate max-w-xs">
                  {selectedFiles.length > 0 ? selectedFiles.map((f) => f.name).join(', ') : selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
                </span>

                <button type="button" onClick={handleProcessCsv} disabled={isAnalyzing || (selectedFiles.length === 0 && !selectedFile)} className="bg-[#002395] hover:bg-[#001a70] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Procesar archivo(s)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setIsReportModalOpen(true)} disabled={filteredCounters.length === 0} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                <FileText className="w-4 h-4" /> Generar Reporte Completo
              </button>
              <button type="button" onClick={() => setIsSettingsOpen(true)} className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4 text-[#002395]" /> Configuración
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
              <p className="text-sm text-gray-500 mt-1">Seleccione y procese un archivo <code className="text-[#002395] font-mono font-semibold">.csv</code> para renderizar los gráficos de contadores del Módulo {selectedModule}.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filteredCounters.map((cnt, idx) => (
                <button key={cnt.id} type="button" onClick={() => setActiveCounterId(cnt.id)} className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${activeCounter?.id === cnt.id ? 'bg-[#002395] text-white border-[#002395] shadow-xs' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  <span className="font-mono">{idx + 1}.</span>
                  <span className="truncate max-w-[10rem]">{cnt.nombre}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${cnt.condicion === 'CRITICAL' ? 'bg-red-400 animate-pulse' : cnt.condicion === 'WARNING' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                </button>
              ))}
            </div>

            {activeCounter && <PerfmonChartCard key={activeCounter.id} counterData={activeCounter} counterIndex={activeCounterIndex} alerts={activeCounterAlerts} />}

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-[#002395] mb-3">Repositorio de Archivos Cargados</h3>
              {uploadedFiles.length === 0 ? (
                <p className="text-xs text-gray-500">No hay archivos guardados en el repositorio.</p>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 border p-3 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold">{f.name}</div>
                        <div className="text-xs text-gray-500">{new Date(f.uploadedAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { onAnalyzeFile(f.counters, f.alerts, f.name); setActiveCounterId(f.counters[0]?.id ?? ''); setSuccessToast(`Archivo '${f.name}' cargado desde repositorio.`); setTimeout(() => setSuccessToast(null), 3000); }} className="px-3 py-2 rounded-lg bg-[#002395] text-white text-xs font-semibold">Seleccionar</button>
                        <button onClick={() => { const nuevo = prompt('Nuevo nombre para el archivo', f.name); if (nuevo && nuevo.trim()) { setUploadedFiles((prev) => prev.map((it) => (it.id === f.id ? { ...it, name: nuevo } : it))); } }} className="px-3 py-2 rounded-lg bg-white border text-xs">Renombrar</button>
                        <button onClick={() => { if (!confirm(`Eliminar '${f.name}' del repositorio?`)) return; setUploadedFiles((prev) => prev.filter((it) => it.id !== f.id)); }} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <ThresholdsModal isOpen={isSettingsOpen} config={thresholdConfig} onClose={() => setIsSettingsOpen(false)} onSave={onUpdateThresholds} />

        <ReportExportModal isOpen={isReportModalOpen} selectedModule={selectedModule} selectedFileName={selectedFile?.name || 'log.csv'} counters={filteredCounters} alerts={alerts} onClose={() => setIsReportModalOpen(false)} />
      </div>
    );
  };
