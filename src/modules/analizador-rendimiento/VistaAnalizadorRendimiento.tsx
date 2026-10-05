import React from 'react';
import {
  TipoModulo,
  DatosContadorPerfmon,
  ViolacionUmbral,
  ConfiguracionUmbrales,
} from './types/tiposAnalizador';
import { TarjetaGraficoRendimiento } from './components/TarjetaGraficoRendimiento';
import { ModalUmbrales } from './components/ModalUmbrales';
import { ModalExportarReporte } from './components/ModalExportarReporte';
import { useAnalizadorRendimiento } from './hooks/useAnalizadorRendimiento';
import {
  Upload,
  FileText,
  Settings,
  RefreshCw,
  CheckCircle2,
  Play,
  FileSpreadsheet,
  AlertCircle,
  TriangleAlert,
} from 'lucide-react';

interface VistaAnalizadorRendimientoProps {
  selectedModule: TipoModulo;
  counters: DatosContadorPerfmon[];
  alerts: ViolacionUmbral[];
  thresholdConfig: ConfiguracionUmbrales;
  onUpdateThresholds: (config: ConfiguracionUmbrales) => void;
  onAnalyzeFile: (
    parsedCounters: DatosContadorPerfmon[],
    parsedAlerts: ViolacionUmbral[],
    filename: string
  ) => void;
}

export const VistaAnalizadorRendimiento: React.FC<VistaAnalizadorRendimientoProps> = ({
  selectedModule,
  counters,
  alerts,
  thresholdConfig,
  onUpdateThresholds,
  onAnalyzeFile,
}) => {
  const {
    selectedFiles,
    selectedFileName,
    activeCounterId,
    isAnalyzing,
    isSettingsOpen,
    isReportModalOpen,
    successToast,
    warningToast,
    errorMessage,
    selectedServer,
    uploadedFiles,
    filteredCounters,
    activeCounter,
    activeCounterAlerts,
    activeCounterIndex,
    setActiveCounterId,
    setSelectedServer,
    setIsSettingsOpen,
    setIsReportModalOpen,
    handleFileUpload,
    handleProcessCsv,
    handleSelectUploadedFile,
    handleRenameUploadedFile,
    handleDeleteUploadedFile,
  } = useAnalizadorRendimiento({
    selectedModule,
    counters,
    alerts,
    thresholdConfig,
    onAnalyzeFile,
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-gray-500">Servidor:</label>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-[#002395] bg-white"
          >
            <option value="Todos">Todos</option>
            {Array.from(new Set(counters.map((c) => c.nombreServidor))).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">Repositorio: {uploadedFiles.length} archivo(s)</div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-[#002395] tracking-tight">Visor Perfmon</h1>
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
                <span>Cargar archivo(s) o carpeta</span>
                <input
                  id="file-upload-input"
                  className="hidden"
                  type="file"
                  accept=".csv, .blg"
                  multiple
                  {...({ webkitdirectory: true } as any)}
                  onChange={handleFileUpload}
                />
              </label>

              <span className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 truncate max-w-xs">
                {selectedFiles.length > 0
                  ? selectedFiles.map((f) => f.name).join(', ')
                  : 'Ningún archivo seleccionado'}
              </span>

              <button
                type="button"
                onClick={handleProcessCsv}
                disabled={isAnalyzing || selectedFiles.length === 0}
                className="bg-[#002395] hover:bg-[#001a70] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Procesar archivo(s)
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
              <FileText className="w-4 h-4" /> Generar Reporte Completo
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
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

      {warningToast && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-3 shadow-xs">
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="font-semibold">{warningToast}</span>
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
              gráficos de contadores.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredCounters.map((cnt, idx) => (
              <button
                key={cnt.id}
                type="button"
                onClick={() => setActiveCounterId(cnt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${activeCounter?.id === cnt.id ? 'bg-[#002395] text-white border-[#002395] shadow-xs' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="font-mono">{idx + 1}.</span>
                <span className="truncate max-w-[10rem]">{cnt.nombre}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${cnt.condicion === 'CRITICAL' ? 'bg-red-400 animate-pulse' : cnt.condicion === 'WARNING' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
                />
              </button>
            ))}
          </div>

          {activeCounter && (
            <TarjetaGraficoRendimiento
              key={activeCounter.id}
              counterData={activeCounter}
              counterIndex={activeCounterIndex}
              alerts={activeCounterAlerts}
            />
          )}

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
                      <button
                        onClick={() => handleSelectUploadedFile(f)}
                        className="px-3 py-2 rounded-lg bg-[#002395] text-white text-xs font-semibold"
                      >
                        Seleccionar
                      </button>
                      <button
                        onClick={() => handleRenameUploadedFile(f)}
                        className="px-3 py-2 rounded-lg bg-white border text-xs"
                      >
                        Renombrar
                      </button>
                      <button
                        onClick={() => handleDeleteUploadedFile(f)}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ModalUmbrales
        isOpen={isSettingsOpen}
        config={thresholdConfig}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onUpdateThresholds}
      />

      <ModalExportarReporte
        isOpen={isReportModalOpen}
        selectedModule={selectedModule}
        selectedFileName={selectedFileName}
        counters={filteredCounters}
        alerts={alerts}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

