export type { ViewMode, ModuleType, MetricKey, PerfmonCounterData, ThresholdViolation, OperationHistoryItem, ThresholdConfig } from './modules/perfmon-analyzer/types/perfmon.types';

export type Role = 'ADMIN' | 'WORKER' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  clientId?: 'SII' | 'TGR';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ReportItem {
  id: string;
  title: string;
  clientId: 'SII' | 'TGR';
  type: string;
  status: string;
  createdAt: string;
  summary: string;
  fileName: string;
}