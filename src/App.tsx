import React, { useState } from "react";
import {
  DatosContadorPerfmon,
  ViolacionUmbral,
  ConfiguracionUmbrales,
} from "./modules/analizador-rendimiento/types/tiposAnalizador";
import { analizarContadores } from "./modules/analizador-rendimiento/utils/detectorUmbrales";
import { VistaAnalizadorRendimiento } from "./modules/analizador-rendimiento/VistaAnalizadorRendimiento";

// ============================================================================
// CONFIGURACIÓN DE UMBRALES DE RESPALDO (S&A CHILE STANDARDS)
// ============================================================================
const defaultThresholds: ConfiguracionUmbrales = {
  limitePaginasMemoriaPorSeg: 20,
  avisoCpu: 50,
  criticoCpu: 80,
  proporcionAciertoCacheOLTP: 95,
  proporcionAciertoCacheOLAP: 80,
  limiteCompilacionesSqlPorSeg: 100,
  limiteBloqueosPorSeg: 1000,
  avisoBuffer: 95,
  criticoBuffer: 80,
};

export default function App() {
  const [thresholdConfig, setThresholdConfig] = useState<ConfiguracionUmbrales>(defaultThresholds);
  const [counters, setCounters] = useState<DatosContadorPerfmon[]>([]);
  const [alerts, setAlerts] = useState<ViolacionUmbral[]>([]);

  const handleAnalyzeFile = (
    parsedCounters: DatosContadorPerfmon[],
    parsedAlerts: ViolacionUmbral[]
  ) => {
    setCounters(parsedCounters);
    setAlerts(parsedAlerts);
  };

  const handleUpdateThresholds = async (newConfig: ConfiguracionUmbrales) => {
    setThresholdConfig(newConfig);

    if (counters.length > 0) {
      const { counters: updatedCounters, alerts: updatedAlerts } = analizarContadores(
        counters,
        newConfig
      );
      setCounters(updatedCounters);
      setAlerts(updatedAlerts);
    }

    try {
      await fetch("/api/v1/perfmon/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch {
      // Ignorar errores de red en entorno local
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <VistaAnalizadorRendimiento
          selectedModule="SII"
          counters={counters}
          alerts={alerts}
          thresholdConfig={thresholdConfig}
          onUpdateThresholds={handleUpdateThresholds}
          onAnalyzeFile={handleAnalyzeFile}
        />
      </main>
    </div>
  );
}