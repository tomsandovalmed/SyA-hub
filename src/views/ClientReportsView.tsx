import React, { useEffect, useState } from 'react';
import { Download, FileText, LogOut, ShieldCheck } from 'lucide-react';
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
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#002395]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">
                <ShieldCheck className="h-4 w-4" />
                Portal cliente
              </div>
              <h1 className="mt-3 text-2xl font-bold text-[#001360]">Bienvenido, {user.name}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Solo puedes ver y descargar informes asignados a tu organización: {user.clientId}.
              </p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            )}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Informes disponibles</h2>
              <p className="mt-1 text-sm text-slate-600">Filtrado simulado por clientId para preparar la integración con PostgreSQL.</p>
            </div>
            <div className="rounded-2xl bg-[#f8f9ff] px-4 py-2 text-sm font-semibold text-[#002395]">
              {reports.length} reportes
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Cargando informes protegidos…
            </div>
          ) : reports.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No hay informes disponibles para este cliente en este momento.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {reports.map((report) => (
                <article key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#002395]">
                        <FileText className="h-4 w-4" />
                        {report.type}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{report.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{report.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(report)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#002395] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#001a70]"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
