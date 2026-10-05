import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { getSamplePerfmonCounters, getSampleAlerts, initialThresholds } from "./src/modules/analizador-rendimiento/data/datosSimulados";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (FastAPI-compatible structure)
  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", service: "Perfmon SQL Analyzer API", version: "1.0.0" });
  });

  app.get("/api/v1/perfmon/counters", (req, res) => {
    const moduleType = (req.query.module as string) === "TGR" ? "TGR" : "SII";
    const counters = getSamplePerfmonCounters(moduleType);
    res.json({ success: true, module: moduleType, counters });
  });

  app.get("/api/v1/perfmon/alerts", (req, res) => {
    const moduleType = (req.query.module as string) === "TGR" ? "TGR" : "SII";
    const alerts = getSampleAlerts(moduleType);
    res.json({ success: true, module: moduleType, alerts });
  });

  app.post("/api/v1/perfmon/analyze", (req, res) => {
    const { filename, moduleType } = req.body || {};
    const mod = moduleType === "TGR" ? "TGR" : "SII";
    const fname = filename || "ESCORPIO_SERVER_LOG_02062026.csv";
    
    // Simulate log processing
    const counters = getSamplePerfmonCounters(mod);
    const alerts = getSampleAlerts(mod);

    res.json({
      success: true,
      message: `Log file ${fname} successfully processed for module ${mod}`,
      summary: {
        filename: fname,
        processedAt: new Date().toISOString(),
        totalRecords: 14280,
        module: mod,
        criticalAlertsCount: alerts.filter(a => a.severity === 'CRITICAL').length,
        countersCount: counters.length
      },
      counters,
      alerts
    });
  });

  app.post("/api/v1/perfmon/thresholds", (req, res) => {
    const newConfig = req.body || initialThresholds;
    res.json({
      success: true,
      message: "Thresholds configuration updated successfully",
      config: newConfig
    });
  });

  // Verificación estricta: si existe la carpeta 'dist', sirve la versión compilada/ofuscada
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath);

  if (isProduction) {
    console.log("Modo Producción: Sirviendo assets ofuscados desde /dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("Modo Desarrollo: Middleware Vite activo");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();