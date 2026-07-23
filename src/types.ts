export type ViewMode = 'hub' | 'module-select' | 'analyzer' | 'history' | 'tasks';

export type ModuleType = 'SII' | 'TGR';

export interface PerfmonCounterData {
  id: string;
  name: string;
  counterName: string;
  instance: string;
  serverName: string;
  module?: ModuleType;
  condition: 'OK' | 'WARNING' | 'CRITICAL';
  unit: string;
  description: string;
  min: number;
  avg: number;
  max: number;
  limit?: number;
  timeLabels: string[];
  values: number[];
}

export interface ThresholdViolation {
  id: string;
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
  cpuCriticalLimit: number;
  memoryMinAvailableMB: number;
  pageLifeExpectancySec: number;
  bufferCacheHitRatio: number;
  diskQueueLengthMax: number;
}
