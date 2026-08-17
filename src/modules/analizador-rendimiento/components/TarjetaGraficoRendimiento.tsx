import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import { DatosContadorPerfmon, ViolacionUmbral } from '../types/tiposAnalizador';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  Plugin,
} from 'chart.js';
import { Download, Copy, ChevronDown, Check } from 'lucide-react';
import { SeccionAlertasDetectadas } from './SeccionAlertasDetectadas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerfmonChartCardProps {
  counterData: DatosContadorPerfmon;
  counterIndex: number;
  alerts?: ViolacionUmbral[];
}

export const TarjetaGraficoRendimiento = memo<PerfmonChartCardProps>(function TarjetaGraficoRendimiento({
  counterData,
  counterIndex,
  alerts = [],
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // Plugin personalizado para dibujar la cabecera e información centreada en el canvas
  const exportHeaderPlugin = useMemo<Plugin<'line'>>(
    () => ({
      id: 'exportHeaderPlugin',
      beforeDraw: (chart) => {
        const { ctx, width, height } = chart;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 1. Título Centrado en el lienzo
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#002395';
        ctx.textAlign = 'center';
        ctx.fillText(`Servidor: ${counterData.nombreServidor} | ${counterData.nombreContador}`, width / 2, 20);

        // Leyendas a la derecha
        ctx.textAlign = 'left';
        ctx.font = '10px sans-serif';
        
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(width - 210, 16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillText('Warning Zone', width - 200, 20);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(width - 110, 16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillText('Critical Zone', width - 100, 20);
        ctx.restore();
      },
    }),
    [counterData.serverName, counterData.counterName]
  );

  // Plugin para pintar las franjas de advertencia y peligro
  const thresholdBandsPlugin = useMemo<Plugin<'line'>>(
    () => ({
      id: 'thresholdBands',
      beforeDraw: (chart) => {
        if (!counterData.limite) return;
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.y) return;

        const limit = counterData.limite;
        const warnLimit = limit * 0.7;
        const yLimitPixel = scales.y.getPixelForValue(limit);
        const yWarnPixel = scales.y.getPixelForValue(warnLimit);
        const yTopPixel = chartArea.top;

        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(chartArea.left, yTopPixel, chartArea.width, Math.max(0, yLimitPixel - yTopPixel));
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fillRect(chartArea.left, yLimitPixel, chartArea.width, Math.max(0, yWarnPixel - yLimitPixel));
        ctx.restore();
      },
    }),
    [counterData.limit]
  );

  const handleNavigateToChart = useCallback(
    (index: number) => {
      setHighlightedIndex(index);

      chartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      requestAnimationFrame(() => {
        const chart = chartRef.current;
        if (!chart) return;

        chart.setActiveElements([{ datasetIndex: 0, index }]);
        chart.tooltip?.setActiveElements([{ datasetIndex: 0, index }], { x: 0, y: 0 });
        chart.update('none');

        const timestamp =
          counterData.timestampsCompletos?.[index] || counterData.etiquetasTiempo[index];
        showToast(`Navegando al punto: ${timestamp}`);
      });
    },
    [counterData.timestampsCompletos, counterData.etiquetasTiempo, showToast]
  );

  const handleDownload = useCallback(() => {
    if (!chartRef.current) return;
    const link = document.createElement('a');
    link.download = `${counterData.nombre.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = chartRef.current.toBase64Image('image/png', 1.0);
    link.click();
    showToast('Descargando gráfico oficial con leyenda y servidor...');
  }, [counterData.name, showToast]);

  // Estructura de datos explícitamente tipada como ChartData<'line'>
  const chartData = useMemo<ChartData<'line'>>(
    () => ({
      labels: counterData.etiquetasTiempo,
      datasets: [
        {
          label: counterData.nombreServidor,
          data: counterData.valores,
          borderColor: '#002395',
          borderWidth: 2,
          tension: 0.35,
          clip: false, // Previene el recorte de puntos en los bordes
          pointRadius: counterData.valores.map((_, idx) => (idx === highlightedIndex ? 8 : 0)),
          pointBackgroundColor: counterData.valores.map((_, idx) =>
            idx === highlightedIndex ? '#ef4444' : '#002395'
          ),
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: 'rgba(0, 35, 149, 0.05)',
        },
      ],
    }),
    [counterData.etiquetasTiempo, counterData.valores, counterData.nombreServidor, highlightedIndex]
  );

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { 
        padding: { top: 40, bottom: 10, left: 10, right: 10 }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#64748b', maxTicksLimit: 10 },
        },
        y: {
          min: 0,
          grace: '8%', // Margen porcentual superior para dar respiro al eje
          grid: { color: '#f1f5f9' },
          border: { dash: [4, 4] },
          ticks: { font: { size: 11 }, color: '#64748b' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items) =>
              counterData.timestampsCompletos?.[items[0].dataIndex] || items[0].label,
          },
        },
      },
    }),
    [counterData.timestampsCompletos]
  );

  // Arreglo de plugins tipado explícitamente como Plugin<'line'>[] para garantizar compatibilidad estricta
  const chartPlugins = useMemo<Plugin<'line'>[]>(
    () => [exportHeaderPlugin, thresholdBandsPlugin],
    [exportHeaderPlugin, thresholdBandsPlugin]
  );

  const conditionBadgeClass =
    counterData.condicion === 'CRITICAL'
      ? 'bg-red-100 text-red-700'
      : counterData.condicion === 'WARNING'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700';

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6 relative">
      {toastMsg && (
        <div className="absolute top-4 right-6 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 animate-fade-in z-20">
          <Check className="w-3.5 h-3.5 text-green-400" />
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#002395]">
            {counterIndex}. Contador: {counterData.nombreContador}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Servidor: <strong className="text-gray-700">{counterData.nombreServidor}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="bg-[#002395] hover:bg-[#001a70] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar gráfico
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Más acciones</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(counterData.condicion);
                    showToast('Condición copiada');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-400" /> Copiar condición
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Min: ${counterData.minimo} Avg: ${counterData.promedio} Max: ${counterData.maximo}`
                    );
                    showToast('Estadísticas copiadas');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-400" /> Copiar Min, Avg, Max
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={chartSectionRef} className="h-80 w-full scroll-mt-24">
        <Line ref={chartRef} data={chartData} options={chartOptions} plugins={chartPlugins} />
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Estadísticas del contador
        </h4>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">CONDITION</th>
                <th className="p-3">PROBLEM / CONDITION DETAIL</th>
                <th className="p-3 text-right">MIN</th>
                <th className="p-3 text-right">AVG</th>
                <th className="p-3 text-right">MAX</th>
                <th className="p-3 text-right">STD DEVIATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-mono">
              <tr>
                <td className="p-3 font-sans font-bold">
                  <span className={`px-2.5 py-1 rounded-full text-2xs ${conditionBadgeClass}`}>
                    {counterData.condicion}
                  </span>
                </td>
                <td className="p-3 font-sans text-gray-600 font-medium">
                  {counterData.detalleCondicion || 'Sin anomalías registradas'}
                </td>
                <td className="p-3 text-right font-bold">{counterData.minimo.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-[#002395]">
                  {counterData.promedio.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold">{counterData.maximo.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-500">
                  {(counterData.desviacionEstandar || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <SeccionAlertasDetectadas alerts={alerts} onNavigateToChart={handleNavigateToChart} />
    </div>
  );
});