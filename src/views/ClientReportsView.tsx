import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, LogOut, ShieldCheck, Search, Filter } from 'lucide-react';
import type { ReportItem, User } from '../types';
import { getClientReports } from '../core/auth';

interface ClientReportsViewProps {
  user: User;
  reports?: ReportItem[];
  onLogout?: () => void;
}

export const ClientReportsView: React.FC<ClientReportsViewProps> = ({ user, reports: initialReports, onLogout }) => {
  const [reports, setReports] = useState<ReportItem[]>(initialReports ?? []);
  const [isLoading, setIsLoading] = useState(!initialReports?.length);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('Todas');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getClientReports(user.clientId)
      .then((nextReports) => {
        if (isMounted) {
          setReports(nextReports);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.clientId]);

  const categoryList = useMemo(() => {
    const types = Array.from(new Set(reports.map((report) => report.type)));
    return ['Todas', ...types];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesType = selectedType === 'Todas' || report.type === selectedType;
      const matchesSearch =
        report.title.toLowerCase().includes(normalizedSearch) ||
        report.summary.toLowerCase().includes(normalizedSearch) ||
        report.type.toLowerCase().includes(normalizedSearch);
      return matchesType && (!normalizedSearch || matchesSearch);
    });
  }, [reports, searchText, selectedType]);

  const reportsByType = useMemo(
    () =>
      filteredReports.reduce<Record<string, ReportItem[]>>((acc, report) => {
        acc[report.type] = acc[report.type] || [];
        acc[report.type].push(report);
        return acc;
      }, {}),
    [filteredReports]
  );

  const handleDownload = (report: ReportItem) => {
    const content = `Reporte: ${report.title}\nCliente: ${report.clientId}\nEstado: ${report.status}\nResumen: ${report.summary}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#002395] tracking-tight">S&A</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#002395]">CHILE</span>
              </div>
              <div className="h-5 w-px bg-slate-200" />
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-slate-900">Portal Corporativo Cliente</span>
                <span className="text-xs text-slate-500">Interfaz profesional para clientes como SII, TGR y organismos públicos.</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[#002395]/5 px-4 py-2 text-sm font-semibold text-[#002395]">
                <ShieldCheck className="h-4 w-4" />
                {user.clientId ?? 'Cliente Corporativo'}
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#002395]">Bienvenido, {user.name}</p>
              <h1 className="mt-3 text-3xl font-bold text-[#001360]">Centro de informes corporativo</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Explora reportes verificados, filtra por tipo y utiliza el catálogo modular pensado para clientes institucionales.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-[#eef3ff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">Total de reportes</p>
                <p className="mt-3 text-3xl font-bold text-[#001360]">{reports.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-[#f8f9ff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">Categorías</p>
                <p className="mt-3 text-3xl font-bold text-[#001360]">{categoryList.length - 1}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-[#f8f9ff] p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Buscar por título, resumen o tipo de informe"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#002395]">
                <Filter className="h-4 w-4" />
                Filtrar por tipo
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryList.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedType === type
                        ? 'bg-[#002395] text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-[#002395]/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Informes disponibles</h2>
              <p className="mt-1 text-sm text-slate-600">Filtrado dinámico en base a tu entidad y tipo de reporte.</p>
            </div>
            <div className="rounded-2xl bg-[#f8f9ff] px-4 py-2 text-sm font-semibold text-[#002395]">
              {filteredReports.length} resultados
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-600 text-center">
              Cargando informes protegidos…
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-600 text-center">
              No hay informes que coincidan con la búsqueda actual.
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {Object.entries(reportsByType).map(([type, group]) => (
                <div key={type} className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#002395]">{type}</p>
                      <p className="mt-2 text-sm text-slate-600">{group.length} informe{group.length > 1 ? 's' : ''} en esta categoría</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                      Cliente: {user.clientId ?? 'General'}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {group.map((report) => (
                      <article key={report.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">{report.type}</p>
                            <h3 className="mt-3 text-xl font-semibold text-slate-900">{report.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                            {report.status}
                          </span>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                          <span>Publicado: {report.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => handleDownload(report)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#002395] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#001a70]"
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
