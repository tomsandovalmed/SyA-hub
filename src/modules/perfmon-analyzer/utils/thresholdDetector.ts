import {
  PerfmonCounterData,
  ThresholdConfig,
  ThresholdViolation,
  MetricKey,
} from '../types/perfmon.types';

export interface ConditionResult {
  condition: 'OK' | 'WARNING' | 'CRITICAL';
  conditionDetail: string;
  limit?: number;
}

export function evaluateCounterCondition(
  metricKey: MetricKey | undefined,
  min: number,
  max: number,
  thresholds: ThresholdConfig
): ConditionResult {
  switch (metricKey) {
    case 'cpu': {
      if (max >= thresholds.cpuCritical) {
        return {
          condition: 'CRITICAL',
          conditionDetail: `Saturación del procesador por sobre el ${thresholds.cpuCritical}% (Criterio S&A Chile)`,
          limit: thresholds.cpuCritical,
        };
      }
      if (max >= thresholds.cpuWarning) {
        return {
          condition: 'WARNING',
          conditionDetail: `Carga moderada del procesador (Entre ${thresholds.cpuWarning}% y ${thresholds.cpuCritical}%)`,
          limit: thresholds.cpuCritical,
        };
      }
      break;
    }
    case 'buffer': {
      if (min <= thresholds.bufferCritical) {
        return {
          condition: 'CRITICAL',
          conditionDetail: `Eficiencia crítica de memoria caché (< ${thresholds.bufferCritical}%)`,
          limit: thresholds.bufferWarning,
        };
      }
      if (min <= thresholds.bufferWarning) {
        return {
          condition: 'WARNING',
          conditionDetail: `Lecturas desde disco elevadas (Caché entre ${thresholds.bufferCritical}% y ${thresholds.bufferWarning}%)`,
          limit: thresholds.bufferWarning,
        };
      }
      break;
    }
    default:
      break;
  }

  return {
    condition: 'OK',
    conditionDetail: 'Rendimiento dentro del rango ideal estándar.',
  };
}

export function detectAlertsForCounter(
  counter: Pick<
    PerfmonCounterData,
    'id' | 'metricKey' | 'name' | 'counterName' | 'values' | 'timeLabels' | 'fullTimestamps'
  >,
  thresholds: ThresholdConfig
): ThresholdViolation[] {
  const alerts: ThresholdViolation[] = [];
  const { metricKey, values, id, name, counterName } = counter;
  const timeLabels = counter.timeLabels;
  const fullTimestamps = counter.fullTimestamps ?? timeLabels;

  values.forEach((value, index) => {
    if (metricKey === 'cpu') {
      if (value >= thresholds.cpuCritical) {
        alerts.push({
          id: `alert-${id}-crit-${index}`,
          counterId: id,
          dataIndex: index,
          timeRange: fullTimestamps[index] || timeLabels[index],
          condition: `Procesador >= ${thresholds.cpuCritical}%`,
          severity: 'CRITICAL',
          counter: counterName || name,
          avgValue: value,
          limit: thresholds.cpuCritical,
        });
      } else if (value >= thresholds.cpuWarning) {
        alerts.push({
          id: `alert-${id}-warn-${index}`,
          counterId: id,
          dataIndex: index,
          timeRange: fullTimestamps[index] || timeLabels[index],
          condition: `Procesador >= ${thresholds.cpuWarning}%`,
          severity: 'WARNING',
          counter: counterName || name,
          avgValue: value,
          limit: thresholds.cpuWarning,
        });
      }
    } else if (metricKey === 'buffer') {
      if (value <= thresholds.bufferCritical) {
        alerts.push({
          id: `alert-${id}-crit-${index}`,
          counterId: id,
          dataIndex: index,
          timeRange: fullTimestamps[index] || timeLabels[index],
          condition: `Buffer Cache <= ${thresholds.bufferCritical}%`,
          severity: 'CRITICAL',
          counter: counterName || name,
          avgValue: value,
          limit: thresholds.bufferCritical,
        });
      } else if (value <= thresholds.bufferWarning) {
        alerts.push({
          id: `alert-${id}-warn-${index}`,
          counterId: id,
          dataIndex: index,
          timeRange: fullTimestamps[index] || timeLabels[index],
          condition: `Buffer Cache <= ${thresholds.bufferWarning}%`,
          severity: 'WARNING',
          counter: counterName || name,
          avgValue: value,
          limit: thresholds.bufferWarning,
        });
      }
    }
  });

  return alerts;
}

export function analyzeCounters(
  counters: PerfmonCounterData[],
  thresholds: ThresholdConfig
): { counters: PerfmonCounterData[]; alerts: ThresholdViolation[] } {
  const updatedCounters = counters.map((counter) => {
    const { condition, conditionDetail, limit } = evaluateCounterCondition(
      counter.metricKey,
      counter.min,
      counter.max,
      thresholds
    );
    return { ...counter, condition, conditionDetail, limit };
  });

  const alerts = updatedCounters.flatMap((counter) =>
    detectAlertsForCounter(counter, thresholds)
  );

  return { counters: updatedCounters, alerts };
}
