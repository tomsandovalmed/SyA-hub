export type { ModoVista, TipoModulo, ClaveMetrica, DatosContadorPerfmon, ViolacionUmbral, ItemHistorialOperacion, ConfiguracionUmbrales } from './modules/analizador-rendimiento/types/tiposAnalizador';

export type Role = 'ADMIN' | 'WORKER' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  clientId?: string;
  password?: string;
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
  clientId: string;
  type: string;
  status: string;
  createdAt: string;
  summary: string;
  fileName: string;
}