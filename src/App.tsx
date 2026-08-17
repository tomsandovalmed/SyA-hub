import React, { useState } from "react";
import {
  ModoVista,
  TipoModulo,
  DatosContadorPerfmon,
  ViolacionUmbral,
  ItemHistorialOperacion,
  ConfiguracionUmbrales,
} from "./modules/analizador-rendimiento/types/tiposAnalizador";
import { initialOperationHistory } from "./modules/analizador-rendimiento/data/datosSimulados";
import { analizarContadores } from "./modules/analizador-rendimiento/utils/detectorUmbrales";
import { TopNavBar } from "./components/ui/TopNavBar";
import { InicioVista } from "./views/InicioVista";
import { HistorialVista } from "./views/HistorialVista";
import { SeleccionModulo } from "./modules/analizador-rendimiento/components/SeleccionModulo";
import { VistaAnalizadorRendimiento } from "./modules/analizador-rendimiento/VistaAnalizadorRendimiento";
import { Footer } from "./components/ui/Footer";
import { NotasYTareas } from "./views/NotasYTareas";
import { LoginView } from "./views/LoginView";
import { ClientReportsView } from "./views/ClientReportsView";
import { AdminDashboardView } from "./views/AdminDashboardView";
import type { User } from "./types";

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
  // ==========================================
  // ESTADOS PRINCIPALES DE LA APLICACIÓN
  // ==========================================
  const [currentView, setCurrentView] = useState<ModoVista>("hub");
  const [selectedModule, setSelectedModule] = useState<TipoModulo>("SII");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [thresholdConfig, setThresholdConfig] = useState<ConfiguracionUmbrales>(defaultThresholds);
  const [history, setHistory] = useState<ItemHistorialOperacion[]>(initialOperationHistory);

  // 🟢 ESTADO INICIAL VACÍO PARA CONTADORES Y ALERTAS
  const [counters, setCounters] = useState<DatosContadorPerfmon[]>([]);
  const [alerts, setAlerts] = useState<ViolacionUmbral[]>([]);

  // ==========================================
  // MANEJADORES DE CAMBIO DE MÓDULO Y NAVEGACIÓN
  // ==========================================

  const handleModuleChange = (module: TipoModulo) => {
    setSelectedModule(module);
    setCounters([]);
    setAlerts([]);
  };

  const handleSelectModule = (module: TipoModulo) => {
    setSelectedModule(module);
    setCounters([]);
    setAlerts([]);
    setCurrentView("analyzer");
  };

  const handleLoginSuccess = (user: User) => {
    setAuthUser(user);
    setCurrentView(user.role === "CLIENT" ? "client" : user.role === "ADMIN" ? "admin" : "hub");
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentView("hub");
  };

  // ==========================================
  // PROCESAMIENTO Y ANÁLISIS DE ARCHIVOS LOG
  // ==========================================

  const handleAnalyzeFile = (
    parsedCounters: DatosContadorPerfmon[],
    parsedAlerts: ViolacionUmbral[],
    filename: string
  ) => {
    setCounters(parsedCounters);
    setAlerts(parsedAlerts);

    const newItem: ItemHistorialOperacion = {
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

  // ==========================================
  // RENDERIZADO DE ESTRUCTURA Y VISTAS
  // ==========================================
  if (!authUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (authUser.role === "CLIENT") {
    return <ClientReportsView user={authUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-slate-900 font-sans antialiased">
      
      {/* Header & Barra de Navegación */}
      <TopNavBar
        currentView={currentView}
        selectedModule={selectedModule}
        authUser={authUser}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
      />

      {/* Main Contenedor */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
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
          <VistaAnalizadorRendimiento
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

        {currentView === "admin" && authUser && (
          <AdminDashboardView user={authUser} onNavigate={(view) => setCurrentView(view)} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}