import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { getSamplePerfmonCounters, getSampleAlerts, initialOperationHistory, initialThresholds } from "./src/modules/analizador-rendimiento/data/datosSimulados";
import { demoReports, usersStore } from "./src/config/auth";

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

  app.get("/api/v1/perfmon/history", (_req, res) => {
    res.json({ success: true, history: initialOperationHistory });
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

  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    const allUsers = usersStore.getUsers();
    const user = allUsers.find((entry) => entry.email === email);

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const expected = user.password ?? `${user.role.toLowerCase()}123`;
    if (password !== expected) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    return res.json({
      success: true,
      user,
      token: `mock-${user.id}`,
      backend: {
        provider: "firebase-auth-ready",
        database: "postgresql-ready",
        note: "La lógica de autenticación y reportes está preparada para conectar con Firebase Auth y PostgreSQL en una siguiente iteración.",
      },
    });
  });

  app.get("/api/v1/reports", (req, res) => {
    const clientId = req.query.clientId as string | undefined;
    const reports = demoReports.filter((report) => !clientId || report.clientId === clientId);

    res.json({
      success: true,
      clientId: clientId || null,
      reports,
      backend: {
        provider: "postgresql-ready",
        note: "Los informes se filtran por clientId en este mock y pueden migrarse a una tabla relacional en PostgreSQL.",
      },
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