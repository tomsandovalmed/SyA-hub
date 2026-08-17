import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import {
  TipoModulo,
  DatosContadorPerfmon,
  ViolacionUmbral,
  ConfiguracionUmbrales,
} from '../types/tiposAnalizador';
import { parseMultiplePerfmonCsv } from '../utils/procesadorCsv';

const REPOSITORIO_ARCHIVOS_KEY = 'perfmon_uploaded_files';
const REPOSITORIO_METADATOS_KEY = 'perfmon_uploaded_files_meta';
const MENSAJE_CUOTA = 'El archivo es muy grande para el repositorio local';

interface ArchivoCargado {
  id: string;
  name: string;
  module: TipoModulo;
  uploadedAt: string;
  counters: DatosContadorPerfmon[];
  alerts: ViolacionUmbral[];
}

interface ArchivoCargadoMetadato {
  id: string;
  name: string;
  module: TipoModulo;
  uploadedAt: string;
}

interface EstadoInicialRepositorio {
  archivos: ArchivoCargado[];
  persistirSoloMetadatos: boolean;
}

export interface UseAnalizadorRendimientoParams {
  selectedModule: TipoModulo;
  counters: DatosContadorPerfmon[];
  alerts: ViolacionUmbral[];
  thresholdConfig: ConfiguracionUmbrales;
  onAnalyzeFile: (
    parsedCounters: DatosContadorPerfmon[],
    parsedAlerts: ViolacionUmbral[],
    filename: string
  ) => void;
}

const toMetadatos = (archivos: ArchivoCargado[]): ArchivoCargadoMetadato[] =>
  archivos.map(({ id, name, module, uploadedAt }) => ({ id, name, module, uploadedAt }));

const restaurarDesdeMetadatos = (metadatos: ArchivoCargadoMetadato[]): ArchivoCargado[] =>
  metadatos.map((meta) => ({ ...meta, counters: [], alerts: [] }));

/**
 * Determina si un error corresponde a un desborde de cuota de localStorage.
 */
const esErrorCuotaLocalStorage = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false;
  }
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014
  );
};

const leerRepositorioInicial = (): EstadoInicialRepositorio => {
  try {
    const rawCompleto = localStorage.getItem(REPOSITORIO_ARCHIVOS_KEY);
    if (rawCompleto) {
      return {
        archivos: JSON.parse(rawCompleto) as ArchivoCargado[],
        persistirSoloMetadatos: false,
      };
    }

    const rawMetadatos = localStorage.getItem(REPOSITORIO_METADATOS_KEY);
    if (rawMetadatos) {
      return {
        archivos: restaurarDesdeMetadatos(JSON.parse(rawMetadatos) as ArchivoCargadoMetadato[]),
        persistirSoloMetadatos: true,
      };
    }
  } catch {
    return { archivos: [], persistirSoloMetadatos: false };
  }

  return { archivos: [], persistirSoloMetadatos: false };
};

/**
 * Hook de negocio del analizador: administra estados de UI, procesamiento CSV y repositorio local.
 */
export const useAnalizadorRendimiento = ({
  selectedModule,
  counters,
  alerts,
  thresholdConfig,
  onAnalyzeFile,
}: UseAnalizadorRendimientoParams) => {
  const repositorioInicialRef = useRef<EstadoInicialRepositorio | null>(null);
  if (!repositorioInicialRef.current) {
    repositorioInicialRef.current = leerRepositorioInicial();
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeCounterId, setActiveCounterId] = useState<string>('');
  const [selectedServer, setSelectedServer] = useState<string>('Todos');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ArchivoCargado[]>(
    repositorioInicialRef.current.archivos
  );
  const [persistirSoloMetadatos, setPersistirSoloMetadatos] = useState(
    repositorioInicialRef.current.persistirSoloMetadatos
  );

  const mostrarToastTemporal = useCallback(
    (setter: Dispatch<SetStateAction<string | null>>, mensaje: string, ms = 4000) => {
      setter(mensaje);
      window.setTimeout(() => setter(null), ms);
    },
    []
  );

  const mostrarExito = useCallback(
    (mensaje: string) => mostrarToastTemporal(setSuccessToast, mensaje),
    [mostrarToastTemporal]
  );

  const mostrarAdvertencia = useCallback(
    (mensaje: string) => mostrarToastTemporal(setWarningToast, mensaje, 5000),
    [mostrarToastTemporal]
  );

  const mostrarError = useCallback((mensaje: string) => setErrorMessage(mensaje), []);

  /**
   * Lee uno o más archivos seleccionados y los transforma en contenido de texto.
   */
  const leerArchivosSeleccionados = useCallback(async (files: File[]) => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<{ name: string; text: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ name: file.name, text: ev.target?.result as string });
            reader.onerror = () => reject(new Error(`No fue posible leer ${file.name}`));
            reader.readAsText(file);
          })
      )
    );
  }, []);

  useEffect(() => {
    const metadatosSerializados = JSON.stringify(toMetadatos(uploadedFiles));

    try {
      if (!persistirSoloMetadatos) {
        localStorage.setItem(REPOSITORIO_ARCHIVOS_KEY, JSON.stringify(uploadedFiles));
        localStorage.removeItem(REPOSITORIO_METADATOS_KEY);
        return;
      }

      localStorage.setItem(REPOSITORIO_METADATOS_KEY, metadatosSerializados);
      localStorage.removeItem(REPOSITORIO_ARCHIVOS_KEY);
    } catch (error) {
      if (esErrorCuotaLocalStorage(error)) {
        setPersistirSoloMetadatos(true);
        mostrarAdvertencia(MENSAJE_CUOTA);
        try {
          localStorage.setItem(REPOSITORIO_METADATOS_KEY, metadatosSerializados);
          localStorage.removeItem(REPOSITORIO_ARCHIVOS_KEY);
        } catch {
          mostrarError('No se pudo guardar el repositorio local.');
        }
        return;
      }

      mostrarError('No se pudo guardar el repositorio local.');
    }
  }, [uploadedFiles, persistirSoloMetadatos, mostrarAdvertencia, mostrarError]);

  const filteredCounters = useMemo(
    () =>
      counters.filter(
        (c) =>
          (c.modulo === selectedModule || !c.modulo) &&
          (selectedServer === 'Todos' || c.nombreServidor === selectedServer)
      ),
    [counters, selectedModule, selectedServer]
  );

  const activeCounter = useMemo(
    () => filteredCounters.find((counter) => counter.id === activeCounterId) || filteredCounters[0],
    [filteredCounters, activeCounterId]
  );

  const activeCounterAlerts = useMemo(
    () => (activeCounter ? alerts.filter((alert) => alert.contadorId === activeCounter.id) : []),
    [alerts, activeCounter]
  );

  const activeCounterIndex = useMemo(
    () => (activeCounter ? filteredCounters.findIndex((counter) => counter.id === activeCounter.id) + 1 : 1),
    [filteredCounters, activeCounter]
  );

  const selectedFileName = selectedFiles[0]?.name || 'log.csv';

  /**
   * Maneja la selección de archivos desde el input y limpia errores previos.
   */
  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setErrorMessage(null);
    setSelectedFiles(files);
  }, []);

  /**
   * Procesa los archivos seleccionados, genera contadores/alertas y actualiza el repositorio local.
   */
  const handleProcessCsv = useCallback(async () => {
    if (selectedFiles.length === 0) {
      mostrarError('Seleccione al menos un archivo para procesar.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const filesAsText = await leerArchivosSeleccionados(selectedFiles);
      const { counters: parsedCounters, alerts: parsedAlerts, error } = parseMultiplePerfmonCsv(
        filesAsText,
        selectedModule,
        thresholdConfig
      );

      if (error) {
        mostrarError(error);
        return;
      }

      const archivoNombre = selectedFiles.map((file) => file.name).join(', ');
      const nuevoRegistro: ArchivoCargado = {
        id: `upload-${Date.now()}`,
        name: archivoNombre,
        module: selectedModule,
        uploadedAt: new Date().toISOString(),
        counters: parsedCounters,
        alerts: parsedAlerts,
      };

      setUploadedFiles((prev) => [...prev, nuevoRegistro]);
      onAnalyzeFile(parsedCounters, parsedAlerts, archivoNombre);
      setActiveCounterId(parsedCounters[0]?.id ?? '');
      mostrarExito(`Procesados ${selectedFiles.length} archivo(s).`);
    } catch {
      mostrarError('Error procesando los archivos seleccionados.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    selectedFiles,
    leerArchivosSeleccionados,
    selectedModule,
    thresholdConfig,
    onAnalyzeFile,
    mostrarExito,
    mostrarError,
  ]);

  /**
   * Carga en la vista un archivo previamente analizado del repositorio local.
   */
  const handleSelectUploadedFile = useCallback(
    (file: ArchivoCargado) => {
      if (file.counters.length === 0) {
        mostrarError(
          'Este archivo solo conserva metadatos en almacenamiento local. Reprocéselo para recuperar los datos.'
        );
        return;
      }
      onAnalyzeFile(file.counters, file.alerts, file.name);
      setActiveCounterId(file.counters[0]?.id ?? '');
      mostrarExito(`Archivo '${file.name}' cargado desde repositorio.`);
    },
    [mostrarError, onAnalyzeFile, mostrarExito]
  );

  /**
   * Renombra una entrada del repositorio local mediante confirmación del usuario.
   */
  const handleRenameUploadedFile = useCallback((file: ArchivoCargado) => {
    const nuevoNombre = prompt('Nuevo nombre para el archivo', file.name);
    if (!nuevoNombre || !nuevoNombre.trim()) {
      return;
    }
    setUploadedFiles((prev) =>
      prev.map((item) => (item.id === file.id ? { ...item, name: nuevoNombre.trim() } : item))
    );
  }, []);

  /**
   * Elimina una entrada del repositorio local tras confirmación explícita.
   */
  const handleDeleteUploadedFile = useCallback((file: ArchivoCargado) => {
    if (!confirm(`Eliminar '${file.name}' del repositorio?`)) {
      return;
    }
    setUploadedFiles((prev) => prev.filter((item) => item.id !== file.id));
  }, []);

  return {
    selectedFiles,
    selectedFileName,
    activeCounterId,
    isAnalyzing,
    isSettingsOpen,
    isReportModalOpen,
    successToast,
    warningToast,
    errorMessage,
    selectedServer,
    uploadedFiles,
    filteredCounters,
    activeCounter,
    activeCounterAlerts,
    activeCounterIndex,
    setActiveCounterId,
    setSelectedServer,
    setIsSettingsOpen,
    setIsReportModalOpen,
    handleFileUpload,
    handleProcessCsv,
    handleSelectUploadedFile,
    handleRenameUploadedFile,
    handleDeleteUploadedFile,
  };
};
