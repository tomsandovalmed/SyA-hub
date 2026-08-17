import {
  DatosContadorPerfmon,
  ConfiguracionUmbrales,
  ViolacionUmbral,
  ClaveMetrica,
} from '../types/tiposAnalizador';

export interface ResultadoCondicion {
  condicion: 'OK' | 'WARNING' | 'CRITICAL';
  detalleCondicion: string;
  limite?: number;
}

export function evaluarCondicionContador(
  claveMetrica: ClaveMetrica | undefined,
  minimo: number,
  maximo: number,
  umbrales: ConfiguracionUmbrales
): ResultadoCondicion {
  switch (claveMetrica) {
    case 'cpu': {
      if (maximo >= umbrales.criticoCpu) {
        return {
          condicion: 'CRITICAL',
          detalleCondicion: `Saturación del procesador por sobre el ${umbrales.criticoCpu}% (Criterio S&A Chile)`,
          limite: umbrales.criticoCpu,
        };
      }
      if (maximo >= umbrales.avisoCpu) {
        return {
          condicion: 'WARNING',
          detalleCondicion: `Carga moderada del procesador (Entre ${umbrales.avisoCpu}% y ${umbrales.criticoCpu}%)`,
          limite: umbrales.criticoCpu,
        };
      }
      break;
    }
    case 'buffer': {
      if (minimo <= umbrales.criticoBuffer) {
        return {
          condicion: 'CRITICAL',
          detalleCondicion: `Eficiencia crítica de memoria caché (< ${umbrales.criticoBuffer}%)`,
          limite: umbrales.avisoBuffer,
        };
      }
      if (minimo <= umbrales.avisoBuffer) {
        return {
          condicion: 'WARNING',
          detalleCondicion: `Lecturas desde disco elevadas (Caché entre ${umbrales.criticoBuffer}% y ${umbrales.avisoBuffer}%)`,
          limite: umbrales.avisoBuffer,
        };
      }
      break;
    }
    default:
      break;
  }

  return {
    condicion: 'OK',
    detalleCondicion: 'Rendimiento dentro del rango ideal estándar.',
  };
}

export function detectarAlertasPorContador(
  counter: Pick<
    DatosContadorPerfmon,
    | 'id'
    | 'claveMetrica'
    | 'nombre'
    | 'nombreContador'
    | 'valores'
    | 'etiquetasTiempo'
    | 'timestampsCompletos'
  >,
  umbrales: ConfiguracionUmbrales
): ViolacionUmbral[] {
  const alerts: ViolacionUmbral[] = [];
  const { claveMetrica, valores, id, nombre, nombreContador } = counter;
  const timeLabels = counter.etiquetasTiempo;
  const fullTimestamps = counter.timestampsCompletos ?? timeLabels;

  valores.forEach((value, index) => {
    if (claveMetrica === 'cpu') {
      if (value >= umbrales.criticoCpu) {
        alerts.push({
          id: `alert-${id}-crit-${index}`,
          contadorId: id,
          indiceDatos: index,
          rangoTemporal: fullTimestamps[index] || timeLabels[index],
          condicion: `Procesador >= ${umbrales.criticoCpu}%`,
          severidad: 'CRITICAL',
          contador: nombreContador || nombre,
          valorPromedio: value,
          limite: umbrales.criticoCpu,
        });
      } else if (value >= umbrales.avisoCpu) {
        alerts.push({
          id: `alert-${id}-warn-${index}`,
          contadorId: id,
          indiceDatos: index,
          rangoTemporal: fullTimestamps[index] || timeLabels[index],
          condicion: `Procesador >= ${umbrales.avisoCpu}%`,
          severidad: 'WARNING',
          contador: nombreContador || nombre,
          valorPromedio: value,
          limite: umbrales.avisoCpu,
        });
      }
    } else if (claveMetrica === 'buffer') {
      if (value <= umbrales.criticoBuffer) {
        alerts.push({
          id: `alert-${id}-crit-${index}`,
          contadorId: id,
          indiceDatos: index,
          rangoTemporal: fullTimestamps[index] || timeLabels[index],
          condicion: `Buffer Cache <= ${umbrales.criticoBuffer}%`,
          severidad: 'CRITICAL',
          contador: nombreContador || nombre,
          valorPromedio: value,
          limite: umbrales.criticoBuffer,
        });
      } else if (value <= umbrales.avisoBuffer) {
        alerts.push({
          id: `alert-${id}-warn-${index}`,
          contadorId: id,
          indiceDatos: index,
          rangoTemporal: fullTimestamps[index] || timeLabels[index],
          condicion: `Buffer Cache <= ${umbrales.avisoBuffer}%`,
          severidad: 'WARNING',
          contador: nombreContador || nombre,
          valorPromedio: value,
          limite: umbrales.avisoBuffer,
        });
      }
    }
  });

  return alerts;
}

export function analizarContadores(
  counters: DatosContadorPerfmon[],
  umbrales: ConfiguracionUmbrales
): { counters: DatosContadorPerfmon[]; alerts: ViolacionUmbral[] } {
  const updatedCounters = counters.map((counter) => {
    const { condicion, detalleCondicion, limite } = evaluarCondicionContador(
      counter.claveMetrica,
      counter.minimo,
      counter.maximo,
      umbrales
    );
    return { ...counter, condicion, detalleCondicion, limite };
  });

  const alerts = updatedCounters.flatMap((counter) =>
    detectarAlertasPorContador(counter, umbrales)
  );

  return { counters: updatedCounters, alerts };
}
