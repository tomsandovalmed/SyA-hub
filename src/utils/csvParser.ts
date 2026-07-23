import { PerfmonCounterData, ModuleType } from '../types';

export interface ParseResult {
  counters: PerfmonCounterData[];
  error?: string;
}

export const parsePerfmonCsv = (
  csvText: string,
  moduleType: ModuleType,
  saltoPrecision: number = 5 // Réplica de la precisión recomendada (paso de 5 puntos)
): ParseResult => {
  const cleanText = csvText.trim();

  if (!cleanText) {
    return { counters: [], error: 'El archivo CSV seleccionado está completamente vacío.' };
  }

  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return { counters: [], error: 'El archivo CSV debe contener al menos la fila de encabezados y filas de datos.' };
  }

  // Extraer encabezados limpiando comillas
  const headers = lines[0].split(',').map(h => h.replace(/^"(.*)"$/, '$1').trim());

  // Mapeo oficial de métricas como en tu backend Main.py
  const targetMetrics = [
    { key: 'memoria', pattern: 'Memory\\Available MBytes', name: 'Memory Available MBytes', unit: 'MB' },
    { key: 'cpu', pattern: '% Processor Time', name: 'Processor Time %', unit: '%' },
    { key: 'full_scans', pattern: 'Full Scans/sec', name: 'Full Scans/sec', unit: '/sec' },
    { key: 'buffer', pattern: 'Buffer cache hit ratio', name: 'Buffer Cache Hit Ratio', unit: '%' },
    { key: 'transacciones', pattern: 'Transactions/sec', name: 'Transactions/sec', unit: 'tx/s' },
    { key: 'conexiones', pattern: 'User Connections', name: 'User Connections', unit: 'conn' },
  ];

  const colMapping: { colIdx: number; metric: typeof targetMetrics[0]; serverName: string }[] = [];

  // Buscar coincidencia de columnas exactamente igual a Main.py
  headers.forEach((header, idx) => {
    if (idx === 0) return; // Omitir columna timestamp
    for (const metric of targetMetrics) {
      if (header.includes(metric.pattern)) {
        let serverName = moduleType === 'SII' ? 'ESCORPIO_SQL_SRV' : 'PERSONALNEW';
        if (header.startsWith('\\\\')) {
          serverName = header.split('\\')[2] || serverName;
        }
        colMapping.push({ colIdx: idx, metric, serverName });
        break;
      }
    }
  });

  if (colMapping.length === 0) {
    return {
      counters: [],
      error: 'El archivo CSV no contiene contadores válidos de Perfmon SQL Server (Memory, Processor Time, Buffer Manager, etc.).',
    };
  }

  // Muestreo y extracción de marcas de tiempo
  const allTimeLabels: string[] = [];
  const rawData: { [colIdx: number]: number[] } = {};
  colMapping.forEach(c => (rawData[c.colIdx] = []));

  for (let i = 1; i < lines.length; i++) {
    // Muestreo: Aplicamos el salto de precisión definido en index.html
    if ((i - 1) % saltoPrecision !== 0) continue;

    const row = lines[i].split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
    if (row.length < 2) continue;

    // Formatear Timestamp
    const rawTime = row[0];
    const timeMatch = rawTime.match(/\d{2}:\d{2}:\d{2}/) || rawTime.match(/\d{2}:\d{2}/);
    allTimeLabels.push(timeMatch ? timeMatch[0] : `Punto ${i}`);

    colMapping.forEach(c => {
      const val = parseFloat(row[c.colIdx]);
      rawData[c.colIdx].push(isNaN(val) ? 0 : val);
    });
  }

  if (allTimeLabels.length === 0) {
    return { counters: [], error: 'No se encontraron filas de datos válidas dentro del archivo.' };
  }

  // Generar contadores estandarizados
  const parsedCounters: PerfmonCounterData[] = colMapping.map((c, idx) => {
    const values = rawData[c.colIdx];
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? sum / values.length : 0;

    const condition: 'OK' | 'WARNING' | 'CRITICAL' =
      c.metric.key === 'cpu' && max >= 80 ? 'CRITICAL' :
      c.metric.key === 'buffer' && min <= 80 ? 'CRITICAL' : 'OK';

    return {
      id: `cnt-${c.metric.key}-${Date.now()}-${idx}`,
      name: `${idx + 1}. ${c.metric.name}`,
      counterName: headers[c.colIdx],
      instance: 'default',
      serverName: c.serverName,
      module: moduleType,
      unit: c.metric.unit,
      condition,
      description: `Contador extraído de ${headers[c.colIdx]}`,
      min,
      avg,
      max,
      limit: c.metric.key === 'cpu' ? 80 : c.metric.key === 'buffer' ? 95 : undefined,
      timeLabels: allTimeLabels,
      values,
    };
  });

  return { counters: parsedCounters };
};