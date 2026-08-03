import React, { useState } from "react";
import {
  ViewMode,
  ModuleType,
  PerfmonCounterData,
  ThresholdViolation,
  OperationHistoryItem,
  ThresholdConfig,
} from "./types";
import { initialOperationHistory } from "./modules/perfmon-analyzer/data/mockPerfmonData";
import { analyzeCounters } from "./modules/perfmon-analyzer/utils/thresholdDetector";
import { TopNavBar } from "./components/layout/TopNavBar";
import { InicioVista } from "./views/InicioVista";
import { HistorialVista } from "./views/HistorialVista";
import { SeleccionModulo } from "./modules/perfmon-analyzer/components/SeleccionModulo";
import { PerfmonAnalyzerView } from "./modules/perfmon-analyzer/PerfmonAnalyzerView";
import { Footer } from "./components/layout/Footer";
import { NotasYTareas } from "./views/NotasYTareas";

// ============================================================================
// CONFIGURACIÓN DE UMBRALES DE RESPALDO (S&A CHILE STANDARDS)
// ============================================================================
const defaultThresholds: ThresholdConfig = {
  memoryPagesSecLimit: 20,
  cpuWarning: 50,
  cpuCritical: 80,
  cacheHitRatioOLTP: 95,
  cacheHitRatioOLAP: 80,
  sqlCompilationsSecLimit: 100,
  locksSecLimit: 1000,
  bufferWarning: 95,
  bufferCritical: 80,
};

export default function App() {
  // ==========================================
  // ESTADOS PRINCIPALES DE LA APLICACIÓN
  // ==========================================
  const [currentView, setCurrentView] = useState<ViewMode>("hub");
  const [selectedModule, setSelectedModule] = useState<ModuleType>("SII");
  const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfig>(defaultThresholds);
  const [history, setHistory] = useState<OperationHistoryItem[]>(initialOperationHistory);

  // 🟢 ESTADO INICIAL VACÍO PARA CONTADORES Y ALERTAS
  const [counters, setCounters] = useState<PerfmonCounterData[]>([]);
  const [alerts, setAlerts] = useState<ThresholdViolation[]>([]);

  // ==========================================
  // MANEJADORES DE CAMBIO DE MÓDULO Y NAVEGACIÓN
  // ==========================================

  const handleModuleChange = (module: ModuleType) => {
    setSelectedModule(module);
    setCounters([]);
    setAlerts([]);
  };

  const handleSelectModule = (module: ModuleType) => {
    setSelectedModule(module);
    setCounters([]);
    setAlerts([]);
    setCurrentView("analyzer");
  };

  // ==========================================
  // PROCESAMIENTO Y ANÁLISIS DE ARCHIVOS LOG
  // ==========================================

  const handleAnalyzeFile = (
    parsedCounters: PerfmonCounterData[],
    parsedAlerts: ThresholdViolation[],
    filename: string
  ) => {
    setCounters(parsedCounters);
    setAlerts(parsedAlerts);

    const newItem: OperationHistoryItem = {
      id: `op-${Date.now()}`,
      herramienta: `Perfmon Diagnostics (${selectedModule})`,
      usuario: "T. Sandoval",
      fecha:
        new Date().toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        `, ${new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`,
      estado: "Completado",
      modulo: selectedModule,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const handleUpdateThresholds = async (newConfig: ThresholdConfig) => {
    setThresholdConfig(newConfig);

    if (counters.length > 0) {
      const { counters: updatedCounters, alerts: updatedAlerts } = analyzeCounters(
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

  // ==========================================
  // RENDERIZADO DE ESTRUCTURA Y VISTAS
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-slate-900 font-sans antialiased">
      
      {/* Header & Barra de Navegación */}
      <TopNavBar
        currentView={currentView}
        selectedModule={selectedModule}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Contenedor */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {currentView === "hub" && (
          <InicioVista
            onSelectTool={() => setCurrentView("module-select")}
            onOpenModule={(mod) => handleSelectModule(mod)}
          />
        )}

        {currentView === "history" && (
          <HistorialVista
            history={history}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "tasks" && (
          <NotasYTareas onNavigate={(view) => setCurrentView(view)} />
        )}

        {currentView === "module-select" && (
          <SeleccionModulo
            onSelectModule={(mod) => handleSelectModule(mod)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "analyzer" && (
          <PerfmonAnalyzerView
            selectedModule={selectedModule}
            onChangeModule={(mod) => handleModuleChange(mod)}
            counters={counters}
            alerts={alerts}
            thresholdConfig={thresholdConfig}
            onUpdateThresholds={handleUpdateThresholds}
            onAnalyzeFile={handleAnalyzeFile}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}