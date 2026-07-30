export type ViewMode = 'hub' | 'module-select' | 'analyzer' | 'history' | 'tasks';

export type ModuleType = 'SII' | 'TGR';

export type MetricKey =
  | 'memoria'
  | 'cpu'
  | 'full_scans'
  | 'buffer'
  | 'transacciones'
  | 'conexiones';

export interface PerfmonCounterData {
  id: string;
  name: string;
  counterName: string;
  instance: string;
  serverName: string;
  module: ModuleType;
  unit: string;
  metricKey?: MetricKey;
  condition: 'OK' | 'WARNING' | 'CRITICAL';
  conditionDetail?: string;
  description: string;
  min: number;
  avg: number;
  max: number;
  stdDev?: number;
  limit?: number;
  timeLabels: string[];
  fullTimestamps?: string[];
  values: number[];
}

export interface ThresholdViolation {
  id: string;
  counterId: string;
  dataIndex?: number;
  timeRange: string;
  condition: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  counter: string;
  avgValue: number;
  limit: number;
}

export interface OperationHistoryItem {
  id: string;
  herramienta: string;
  usuario: string;
  fecha: string;
  estado: 'Completado' | 'Pendiente' | 'En Proceso' | 'Error';
  modulo?: ModuleType;
}

export interface ThresholdConfig {
  memoryPagesSecLimit: number;
  cpuWarning: number;
  cpuCritical: number;
  cacheHitRatioOLTP: number;
  cacheHitRatioOLAP: number;
  sqlCompilationsSecLimit: number;
  locksSecLimit: number;
  bufferWarning: number;
  bufferCritical: number;
}