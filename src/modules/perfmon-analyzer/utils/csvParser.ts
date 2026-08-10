import { PerfmonCounterData, ModuleType, ThresholdViolation, ThresholdConfig, MetricKey } from '../types/perfmon.types';
import { evaluateCounterCondition, detectAlertsForCounter } from './thresholdDetector';

export interface ParseResult {
  counters: PerfmonCounterData[];
  alerts: ThresholdViolation[];
  error?: string;
}

const TARGET_METRICS: { key: MetricKey; pattern: string; name: string; unit: string }[] = [
  { key: 'memoria', pattern: 'Memory\\Available MBytes', name: 'Memory Available MBytes', unit: 'MB' },
  { key: 'cpu', pattern: '% Processor Time', name: 'Processor Time %', unit: '%' },
  { key: 'full_scans', pattern: 'Full Scans/sec', name: 'Full Scans/sec', unit: '/sec' },
  { key: 'buffer', pattern: 'Buffer cache hit ratio', name: 'Buffer Cache Hit Ratio', unit: '%' },
  { key: 'transacciones', pattern: 'Transactions/sec', name: 'Transactions/sec', unit: 'tx/s' },
  { key: 'conexiones', pattern: 'User Connections', name: 'User Connections', unit: 'conn' },
];

export const parsePerfmonCsv = (
  csvText: string,
  moduleType: ModuleType,
  thresholds: ThresholdConfig,
  saltoPrecision: number = 5
): ParseResult => {
  const cleanText = csvText.trim();

  if (!cleanText) {
    return { counters: [], alerts: [], error: 'El archivo CSV seleccionado está completamente vacío.' };
  }

  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      counters: [],
      alerts: [],
      error: 'El archivo CSV debe contener al menos la fila de encabezados y filas de datos.',
    };
  }

  const headers = lines[0].split(',').map((h) => h.replace(/^"(.*)"$/, '$1').trim());

  const colMapping: { colIdx: number; metric: (typeof TARGET_METRICS)[0]; serverName: string }[] = [];

  headers.forEach((header, idx) => {
    if (idx === 0) return;
    for (const metric of TARGET_METRICS) {
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
      alerts: [],
      error:
        'El archivo CSV no contiene contadores válidos de Perfmon SQL Server (Memory, Processor Time, Buffer Manager, etc.).',
    };
  }

  const allTimeLabels: string[] = [];
  const fullTimestamps: string[] = [];
  const rawData: Record<number, number[]> = {};
  colMapping.forEach((c) => (rawData[c.colIdx] = []));

  for (let i = 1; i < lines.length; i++) {
    if ((i - 1) % saltoPrecision !== 0) continue;

    const row = lines[i].split(',').map((cell) => cell.replace(/^"(.*)"$/, '$1').trim());
    if (row.length < 2) continue;

    const rawTime = row[0];
    const dateMatch = rawTime.match(/\d{2}\/\d{2}\/\d{4}/) || rawTime.match(/\d{4}-\d{2}-\d{2}/);
    const dateOnly = dateMatch ? dateMatch[0] : rawTime.split(' ')[0] || `Punto ${i}`;

    allTimeLabels.push(dateOnly);
    fullTimestamps.push(rawTime);

    colMapping.forEach((c) => {
      const val = parseFloat(row[c.colIdx]);
      rawData[c.colIdx].push(Number.isNaN(val) ? 0 : val);
    });
  }

  const generatedAlerts: ThresholdViolation[] = [];

  const parsedCounters: PerfmonCounterData[] = colMapping.map((c, idx) => {
    const values = rawData[c.colIdx];
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? sum / values.length : 0;

    const variance = values.length
      ? values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length
      : 0;
    const stdDev = Math.sqrt(variance);

    const counterId = `cnt-${c.metric.key}-${idx}`;
    const { condition, conditionDetail, limit } = evaluateCounterCondition(
      c.metric.key,
      min,
      max,
      thresholds
    );

    const counter: PerfmonCounterData = {
      id: counterId,
      name: `${idx + 1}. ${c.metric.name}`,
      counterName: headers[c.colIdx],
      instance: 'default',
      serverName: c.serverName,
      module: moduleType,
      unit: c.metric.unit,
      metricKey: c.metric.key,
      condition,
      conditionDetail,
      description: `Contador extraído de ${headers[c.colIdx]}`,
      min,
      avg,
      max,
      stdDev,
      limit,
      timeLabels: allTimeLabels,
      fullTimestamps,
      values,
    };

    generatedAlerts.push(...detectAlertsForCounter(counter, thresholds));

    return counter;
  });

  return { counters: parsedCounters, alerts: generatedAlerts };
};
