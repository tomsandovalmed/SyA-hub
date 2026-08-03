import React, { useState } from 'react';
import { PerfmonCounterData, ThresholdViolation, ModuleType } from '../../../types';
import { FileText, Download, Check, X, FileSpreadsheet, Code2 } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  selectedModule: ModuleType;
  selectedFileName: string;
  counters: PerfmonCounterData[];
  alerts: ThresholdViolation[];
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  selectedModule,
  selectedFileName,
  counters,
  alerts,
  onClose,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<'csv' | 'json' | null>(null);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Reporte Perfmon SQL ${selectedModule}\n`;
    csvContent += `Archivo Orig,${selectedFileName}\n`;
    csvContent += `Fecha Generacion,${new Date().toLocaleString()}\n\n`;

    csvContent += `CONTADORES Y PROMEDIOS\n`;
    csvContent += `Contador,Instancia,Min,Avg,Max,Estado\n`;
    counters.forEach(c => {
      csvContent += `"${c.counterName}","${c.instance}",${c.min},${c.avg},${c.max},"${c.condition}"\n`;
    });

    csvContent += `\nALERTAS Y VIOLACIONES DE UMBRAL\n`;
    csvContent += `Rango Tiempo,Condicion,Contador,Valor Promedio,Limite\n`;
    alerts.forEach(a => {
      csvContent += `"${a.timeRange}","${a.condition}","${a.counter}",${a.avgValue},${a.limit}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Perfmon_${selectedModule}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedFormat('csv');
    setTimeout(() => setDownloadedFormat(null), 3000);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      module: selectedModule,
      fileName: selectedFileName,
      generatedAt: new Date().toISOString(),
      countersSummary: counters,
      alertsSummary: alerts,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Reporte_Perfmon_${selectedModule}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedFormat('json');
    setTimeout(() => setDownloadedFormat(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5 text-[#002395]">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">Generación de Reporte Completo</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Overview Card */}
        <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 font-semibold">Módulo Activo:</span>
            <span className="font-bold text-[#002395]">Perfmon SQL {selectedModule}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-semibold">Archivo Analizado:</span>
            <span className="font-mono text-gray-800">{selectedFileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-semibold">Contadores Interpretados:</span>
            <span className="font-mono text-gray-800">{counters.length} métricas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-semibold">Alertas Críticas:</span>
            <span className="font-mono text-red-600 font-bold">{alerts.length} violaciones</span>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Exportar Resultados
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button
              onClick={handleDownloadCSV}
              className="p-4 border-2 border-gray-200 hover:border-[#002395] rounded-xl flex flex-col items-center justify-center gap-2 text-center hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <FileSpreadsheet className="w-8 h-8 text-[#002395] group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-gray-800">Descargar Formato CSV</span>
              <span className="text-[11px] text-gray-500">Para Excel y hojas de cálculo</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-4 border-2 border-gray-200 hover:border-[#002395] rounded-xl flex flex-col items-center justify-center gap-2 text-center hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <Code2 className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-gray-800">Descargar JSON API</span>
              <span className="text-[11px] text-gray-500">Para integración de sistemas</span>
            </button>

          </div>
        </div>

        {downloadedFormat && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-semibold">¡Reporte en formato {downloadedFormat.toUpperCase()} descargado exitosamente!</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs uppercase tracking-wider"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
