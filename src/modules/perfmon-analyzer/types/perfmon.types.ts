export type ModoVista = 'hub' | 'module-select' | 'analyzer' | 'history' | 'tasks' | 'client' | 'admin';

export type TipoModulo = 'SII' | 'TGR';

export type ClaveMetrica =
  | 'memoria'
  | 'cpu'
  | 'full_scans'
  | 'buffer'
  | 'transacciones'
  | 'conexiones';

export interface DatosContadorPerfmon {
  id: string;
  nombre: string;
  nombreContador: string;
  instancia: string;
  nombreServidor: string;
  modulo: TipoModulo;
  unidad: string;
  claveMetrica?: ClaveMetrica;
  condicion: 'OK' | 'WARNING' | 'CRITICAL';
  detalleCondicion?: string;
  descripcion: string;
  minimo: number;
  promedio: number;
  maximo: number;
  desviacionEstandar?: number;
  limite?: number;
  etiquetasTiempo: string[];
  timestampsCompletos?: string[];
  valores: number[];
}

export interface ViolacionUmbral {
  id: string;
  contadorId: string;
  indiceDatos?: number;
  rangoTemporal: string;
  condicion: string;
  severidad: 'CRITICAL' | 'WARNING' | 'INFO';
  contador: string;
  valorPromedio: number;
  limite: number;
}

export interface ItemHistorialOperacion {
  id: string;
  herramienta: string;
  usuario: string;
  fecha: string;
  estado: 'Completado' | 'Pendiente' | 'En Proceso' | 'Error';
  modulo?: TipoModulo;
}

export interface ConfiguracionUmbrales {
  limitePaginasMemoriaPorSeg: number;
  avisoCpu: number;
  criticoCpu: number;
  proporcionAciertoCacheOLTP: number;
  proporcionAciertoCacheOLAP: number;
  limiteCompilacionesSqlPorSeg: number;
  limiteBloqueosPorSeg: number;
  avisoBuffer: number;
  criticoBuffer: number;
}
