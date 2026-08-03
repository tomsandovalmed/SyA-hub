import React, { useState, useMemo } from 'react';
import { ThresholdViolation } from '../../../types';
import { AlertTriangle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 5;

interface DetectedAlertsSectionProps {
  alerts: ThresholdViolation[];
  onNavigateToChart: (dataIndex: number) => void;
}

const severityStyles: Record<ThresholdViolation['severity'], string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  WARNING: 'bg-amber-100 text-amber-700',
  INFO: 'bg-blue-100 text-blue-700',
};

export const DetectedAlertsSection: React.FC<DetectedAlertsSectionProps> = ({
  alerts,
  onNavigateToChart,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleAlerts = useMemo(
    () => (showAll ? alerts : alerts.slice(0, INITIAL_VISIBLE_COUNT)),
    [alerts, showAll]
  );

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  if (alerts.length === 0) {
    return (
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-gray-400" />
          Alertas Detectadas / Log de Eventos
        </h4>
        <p className="text-xs text-gray-500 italic py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
          No se registraron eventos de umbral dentro del rango de tiempo consultado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Alertas Detectadas / Log de Eventos
          <span className="text-gray-400 font-normal">({alerts.length})</span>
        </h4>

        <div className="flex items-center gap-2 text-2xs font-semibold">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Fecha / Hora</th>
              <th className="p-3">Severidad</th>
              <th className="p-3">Problema</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {visibleAlerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-mono text-gray-600 whitespace-nowrap">{alert.timeRange}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-2xs font-bold ${severityStyles[alert.severity]}`}
                  >
                    {alert.severity}
                  </span>
                </td>
                <td className="p-3 font-medium text-gray-800">{alert.condition}</td>
                <td className="p-3 text-right font-mono font-bold text-gray-900">
                  {alert.avgValue.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => alert.dataIndex !== undefined && onNavigateToChart(alert.dataIndex)}
                    disabled={alert.dataIndex === undefined}
                    className="bg-blue-50 hover:bg-blue-100 text-[#002395] border border-blue-200 px-2.5 py-1 rounded-lg text-2xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-3 h-3" />
                    Ver en gráfico
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length > INITIAL_VISIBLE_COUNT && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#002395] hover:underline cursor-pointer"
          >
            {showAll ? (
              <>
                <span>Mostrar menos</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Mostrar todas ({alerts.length - INITIAL_VISIBLE_COUNT} más)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
