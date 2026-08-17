import {
  DatosContadorPerfmon,
  TipoModulo,
  ViolacionUmbral,
  ConfiguracionUmbrales,
  ClaveMetrica,
} from '../types/tiposAnalizador';
import { evaluarCondicionContador, detectarAlertasPorContador } from './detectorUmbrales';

export interface ParseResult {
  counters: DatosContadorPerfmon[];
  alerts: ViolacionUmbral[];
  error?: string;
}

interface MetricaObjetivo {
  key: ClaveMetrica;
  pattern: string;
  name: string;
  unit: string;
}

interface ColumnaMapeada {
  colIdx: number;
  metric: MetricaObjetivo;
  serverName: string;
  header: string;
}

interface DatosCrudosColumna {
  valores: number[];
  etiquetasTiempo: string[];
  timestampsCompletos: string[];
}

const TARGET_METRICS: MetricaObjetivo[] = [
  { key: 'memoria', pattern: 'Memory\\Available MBytes', name: 'Memory Available MBytes', unit: 'MB' },
  { key: 'cpu', pattern: '% Processor Time', name: 'Processor Time %', unit: '%' },
  { key: 'full_scans', pattern: 'Full Scans/sec', name: 'Full Scans/sec', unit: '/sec' },
  { key: 'buffer', pattern: 'Buffer cache hit ratio', name: 'Buffer Cache Hit Ratio', unit: '%' },
  { key: 'transacciones', pattern: 'Transactions/sec', name: 'Transactions/sec', unit: 'tx/s' },
  { key: 'conexiones', pattern: 'User Connections', name: 'User Connections', unit: 'conn' },
];

/**
 * Normaliza un arreglo numérico conservando solo valores finitos.
 */
const normalizarValores = (values: number[]): number[] => values.filter((value) => Number.isFinite(value));

/**
 * Calcula el promedio de un arreglo numérico.
 * Retorna 0 cuando el arreglo es vacío o todos los valores son inválidos.
 */
const calcularPromedio = (values: number[]): number => {
  const valoresValidos = normalizarValores(values);
  if (valoresValidos.length === 0) {
    return 0;
  }
  const suma = valoresValidos.reduce((acc, value) => acc + value, 0);
  return suma / valoresValidos.length;
};

/**
 * Calcula la varianza poblacional de un arreglo numérico.
 * Retorna 0 cuando el arreglo es vacío o todos los valores son inválidos.
 */
const calcularVarianza = (values: number[]): number => {
  const valoresValidos = normalizarValores(values);
  if (valoresValidos.length === 0) {
    return 0;
  }
  const promedio = calcularPromedio(valoresValidos);
  return valoresValidos.reduce((acc, value) => acc + Math.pow(value - promedio, 2), 0) / valoresValidos.length;
};

/**
 * Calcula la desviación estándar de un arreglo numérico.
 * Retorna 0 cuando el arreglo es vacío o todos los valores son inválidos.
 */
const calcularDesviacionEstandar = (values: number[]): number => Math.sqrt(calcularVarianza(values));

/**
 * Obtiene el valor mínimo de un arreglo numérico.
 * Retorna 0 cuando el arreglo es vacío o todos los valores son inválidos.
 */
const calcularMinimo = (values: number[]): number => {
  const valoresValidos = normalizarValores(values);
  return valoresValidos.length > 0 ? Math.min(...valoresValidos) : 0;
};

/**
 * Obtiene el valor máximo de un arreglo numérico.
 * Retorna 0 cuando el arreglo es vacío o todos los valores son inválidos.
 */
const calcularMaximo = (values: number[]): number => {
  const valoresValidos = normalizarValores(values);
  return valoresValidos.length > 0 ? Math.max(...valoresValidos) : 0;
};

/**
 * Calcula un paquete de estadísticas sobre un conjunto de valores.
 */
const calcularEstadisticas = (values: number[]) => ({
  minimo: calcularMinimo(values),
  maximo: calcularMaximo(values),
  promedio: calcularPromedio(values),
  varianza: calcularVarianza(values),
  desviacionEstandar: calcularDesviacionEstandar(values),
});

/**
 * Limpia y normaliza una celda CSV eliminando comillas de borde.
 */
const limpiarCelda = (cell: string): string => cell.replace(/^"(.*)"$/, '$1').trim();

/**
 * Parsea una línea CSV de forma tolerante a comillas y comas internas.
 */
const parsearFilaCsv = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(limpiarCelda(current));
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(limpiarCelda(current));
  return cells;
};

/**
 * Extrae una fecha resumida y un timestamp completo desde la celda temporal.
 */
const extraerEtiquetasTiempo = (
  rawTime: string,
  fallbackIndex: number
): { etiqueta: string; timestampCompleto: string } => {
  const texto = rawTime.trim();
  const dateMatch = texto.match(/\d{2}\/\d{2}\/\d{4}/) || texto.match(/\d{4}-\d{2}-\d{2}/);
  const etiqueta = dateMatch?.[0] || texto.split(' ')[0] || `Punto ${fallbackIndex}`;
  return { etiqueta, timestampCompleto: texto || `Punto ${fallbackIndex}` };
};

/**
 * Determina el servidor desde un encabezado de contador Perfmon.
 */
const extraerServidorDesdeHeader = (header: string, moduleType: TipoModulo): string => {
  const defaultServer = moduleType === 'SII' ? 'ESCORPIO_SQL_SRV' : 'PERSONALNEW';
  if (!header.startsWith('\\\\')) {
    return defaultServer;
  }
  const parts = header.split('\\');
  return parts[2] || defaultServer;
};

/**
 * Paso A: limpia el texto CSV y valida estructura básica.
 */
const validarYLimpiarTextoCsv = (csvText: string): { lineas: string[]; error?: string } => {
  const cleanText = csvText.trim();
  if (!cleanText) {
    return { lineas: [], error: 'El archivo CSV seleccionado está completamente vacío.' };
  }

  const lineas = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lineas.length < 2) {
    return {
      lineas: [],
      error: 'El archivo CSV debe contener al menos la fila de encabezados y filas de datos.',
    };
  }

  return { lineas };
};

/**
 * Paso B: extrae encabezados y construye el mapeo de columnas válidas de métricas.
 */
const construirMapeoColumnas = (
  headers: string[],
  moduleType: TipoModulo
): { colMapping: ColumnaMapeada[]; error?: string } => {
  const colMapping: ColumnaMapeada[] = [];

  headers.forEach((header, idx) => {
    if (idx === 0) {
      return;
    }

    const metric = TARGET_METRICS.find((target) => header.includes(target.pattern));
    if (!metric) {
      return;
    }

    colMapping.push({
      colIdx: idx,
      metric,
      serverName: extraerServidorDesdeHeader(header, moduleType),
      header,
    });
  });

  if (colMapping.length === 0) {
    return {
      colMapping: [],
      error:
        'El archivo CSV no contiene contadores válidos de Perfmon SQL Server (Memory, Processor Time, Buffer Manager, etc.).',
    };
  }

  return { colMapping };
};

/**
 * Paso C: recorre filas de forma segura y almacena datos numéricos crudos por columna.
 */
const recolectarDatosCrudos = (
  lineas: string[],
  colMapping: ColumnaMapeada[],
  saltoPrecision: number
): Record<number, DatosCrudosColumna> => {
  const datosPorColumna: Record<number, DatosCrudosColumna> = {};
  colMapping.forEach(({ colIdx }) => {
    datosPorColumna[colIdx] = { valores: [], etiquetasTiempo: [], timestampsCompletos: [] };
  });

  const paso = Math.max(1, Math.floor(saltoPrecision));
  for (let i = 1; i < lineas.length; i++) {
    if ((i - 1) % paso !== 0) {
      continue;
    }

    const row = parsearFilaCsv(lineas[i]);
    if (row.length < 2) {
      continue;
    }

    const { etiqueta, timestampCompleto } = extraerEtiquetasTiempo(row[0] ?? '', i);

    colMapping.forEach(({ colIdx }) => {
      const celda = row[colIdx] ?? '';
      const valor = Number.parseFloat(celda);
      const valorSeguro = Number.isFinite(valor) ? valor : 0;

      const data = datosPorColumna[colIdx];
      data.valores.push(valorSeguro);
      data.etiquetasTiempo.push(etiqueta);
      data.timestampsCompletos.push(timestampCompleto);
    });
  }

  return datosPorColumna;
};

/**
 * Paso D: construye los contadores finales con estadísticas y alertas.
 */
const construirContadoresFinales = (
  headers: string[],
  colMapping: ColumnaMapeada[],
  datosPorColumna: Record<number, DatosCrudosColumna>,
  moduleType: TipoModulo,
  thresholds: ConfiguracionUmbrales
): ParseResult => {
  const generatedAlerts: ViolacionUmbral[] = [];

  const counters = colMapping.map((column, idx) => {
    const data = datosPorColumna[column.colIdx] ?? {
      valores: [],
      etiquetasTiempo: [],
      timestampsCompletos: [],
    };
    const estadisticas = calcularEstadisticas(data.valores);
    const counterId = `cnt-${column.metric.key}-${idx}`;

    const { condicion, detalleCondicion, limite } = evaluarCondicionContador(
      column.metric.key,
      estadisticas.minimo,
      estadisticas.maximo,
      thresholds
    );

    const counter: DatosContadorPerfmon = {
      id: counterId,
      nombre: `${idx + 1}. ${column.metric.name}`,
      nombreContador: headers[column.colIdx] || column.header,
      instancia: 'default',
      nombreServidor: column.serverName,
      modulo: moduleType,
      unidad: column.metric.unit,
      claveMetrica: column.metric.key,
      condicion,
      detalleCondicion,
      descripcion: `Contador extraído de ${headers[column.colIdx] || column.header}`,
      minimo: estadisticas.minimo,
      promedio: estadisticas.promedio,
      maximo: estadisticas.maximo,
      desviacionEstandar: estadisticas.desviacionEstandar,
      limite,
      etiquetasTiempo: data.etiquetasTiempo,
      timestampsCompletos: data.timestampsCompletos,
      valores: data.valores,
    };

    generatedAlerts.push(...detectarAlertasPorContador(counter, thresholds));
    return counter;
  });

  return { counters, alerts: generatedAlerts };
};

/**
 * Parsea un archivo CSV de Perfmon y retorna contadores + alertas con tolerancia a datos inválidos.
 */
export const parsePerfmonCsv = (
  csvText: string,
  moduleType: TipoModulo,
  thresholds: ConfiguracionUmbrales,
  saltoPrecision: number = 5
): ParseResult => {
  const validacion = validarYLimpiarTextoCsv(csvText);
  if (validacion.error) {
    return { counters: [], alerts: [], error: validacion.error };
  }

  const headers = parsearFilaCsv(validacion.lineas[0]);
  const mapeo = construirMapeoColumnas(headers, moduleType);
  if (mapeo.error) {
    return { counters: [], alerts: [], error: mapeo.error };
  }

  const datosCrudos = recolectarDatosCrudos(validacion.lineas, mapeo.colMapping, saltoPrecision);
  return construirContadoresFinales(headers, mapeo.colMapping, datosCrudos, moduleType, thresholds);
};

/**
 * Combina múltiples archivos Perfmon en un solo resultado consolidado.
 */
export const parseMultiplePerfmonCsv = (
  files: { name: string; text: string }[],
  moduleType: TipoModulo,
  thresholds: ConfiguracionUmbrales,
  saltoPrecision: number = 5
): ParseResult => {
  const allCountersMap: Record<string, DatosContadorPerfmon> = {};
  const allAlerts: ViolacionUmbral[] = [];
  const errores: string[] = [];

  for (const file of files) {
    const res = parsePerfmonCsv(file.text, moduleType, thresholds, saltoPrecision);
    if (res.error) {
      errores.push(`${file.name}: ${res.error}`);
    }

    for (const counter of res.counters) {
      const existing = allCountersMap[counter.id];
      if (!existing) {
        allCountersMap[counter.id] = { ...counter };
        continue;
      }

      const mergedValores = existing.valores.concat(counter.valores);
      const mergedEtiquetas = existing.etiquetasTiempo.concat(counter.etiquetasTiempo);
      const mergedTimestamps = (existing.timestampsCompletos || []).concat(counter.timestampsCompletos || []);
      const estadisticas = calcularEstadisticas(mergedValores);

      allCountersMap[counter.id] = {
        ...existing,
        valores: mergedValores,
        etiquetasTiempo: mergedEtiquetas,
        timestampsCompletos: mergedTimestamps,
        minimo: estadisticas.minimo,
        maximo: estadisticas.maximo,
        promedio: estadisticas.promedio,
        desviacionEstandar: estadisticas.desviacionEstandar,
      };
    }

    allAlerts.push(...res.alerts);
  }

  const mergedCounters = Object.values(allCountersMap);
  if (mergedCounters.length === 0 && errores.length > 0) {
    return { counters: [], alerts: [], error: errores.join(' | ') };
  }

  return { counters: mergedCounters, alerts: allAlerts };
};

