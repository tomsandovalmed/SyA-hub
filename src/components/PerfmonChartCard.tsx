import React from 'react';
import { PerfmonCounterData } from '../types';
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
} from 'chart.js';
import { Copy, Server } from 'lucide-react';

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
  counterData: PerfmonCounterData;
  counterIndex: number;
}

export const PerfmonChartCard: React.FC<PerfmonChartCardProps> = ({ counterData, counterIndex }) => {
  const chartData = {
    labels: counterData.timeLabels,
    datasets: [
      {
        label: counterData.name,
        data: counterData.values,
        borderColor: '#002395',
        borderWidth: 2,
        tension: 0.35, // Curva Spline idéntica al proyecto original
        pointRadius: 0, // 🟢 ELIMINA LOS PUNTOS GIGANTES SATURADOS
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#002395',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 35, 149, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 35, 149, 0.25)');
          gradient.addColorStop(1, 'rgba(0, 35, 149, 0.01)');
          return gradient;
        },
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10, family: 'monospace' },
          color: '#64748b',
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { dash: [4, 4], drawBorder: false },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#002395]">
            {counterIndex}. Contador: {counterData.counterName}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
            <Server className="w-3.5 h-3.5 text-[#002395]" />
            <span>Servidor: <strong className="text-gray-700">{counterData.serverName}</strong></span>
          </div>
        </div>

        <button 
          onClick={() => navigator.clipboard.writeText(counterData.counterName)}
          className="text-xs font-semibold text-gray-600 hover:text-[#002395] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          Copiar Nombre
        </button>
      </div>

      {/* Gráfico Estilizado Limpio */}
      <div className="h-72 w-full">
        <Line data={chartData} options={options} />
      </div>

      {/* Descripción */}
      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900">
        💡 {counterData.description}
      </div>

      {/* Tabla de estadísticas exactas */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">CONDITION</th>
              <th className="p-3">COUNTER</th>
              <th className="p-3 text-right">MIN</th>
              <th className="p-3 text-right">AVG</th>
              <th className="p-3 text-right">MAX</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-mono">
            <tr>
              <td className="p-3 font-sans font-bold">
                <span className={`px-2.5 py-1 rounded-full text-2xs ${
                  counterData.condition === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {counterData.condition}
                </span>
              </td>
              <td className="p-3 text-gray-600">{counterData.counterName}</td>
              <td className="p-3 text-right font-bold">{counterData.min.toFixed(2)} {counterData.unit}</td>
              <td className="p-3 text-right font-bold text-[#002395]">{counterData.avg.toFixed(2)} {counterData.unit}</td>
              <td className="p-3 text-right font-bold">{counterData.max.toFixed(2)} {counterData.unit}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};