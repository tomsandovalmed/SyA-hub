import React, { useMemo, useState } from 'react';
import { ChevronLeft, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import type { User } from '../types';
import type { ViewMode } from '../modules/perfmon-analyzer/types/perfmon.types';
import { demoUsers } from '../config/auth';

interface AdminDashboardViewProps {
  user: User;
  onNavigate: (view: ViewMode) => void;
}

const getCredentialHint = (role: User['role']) => {
  if (role === 'CLIENT') return 'client123';
  return `${role.toLowerCase()}123`;
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user, onNavigate }) => {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRoleChange = (id: string, nextRole: User['role']) => {
    setUsers((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, role: nextRole } : entry))
    );
    setStatusMessage('Rol actualizado correctamente.');
    window.setTimeout(() => setStatusMessage(null), 2800);
  };

  const totalAdmins = useMemo(
    () => users.filter((entry) => entry.role === 'ADMIN').length,
    [users]
  );

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#002395]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">
              <ShieldCheck className="h-4 w-4" />
              Portal administrativo
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#001360]">Administración de usuarios</h1>
            <p className="mt-2 text-sm text-slate-600">
              Gestiona usuarios, roles y credenciales simuladas del sistema S&A Hub.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('hub')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#002395] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#001a70]"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al Hub
          </button>
        </div>
      </section>

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#002395]">Usuarios simulados</p>
            <p className="mt-1 text-sm text-slate-600">{users.length} registros de acceso configurados</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-[#002395]/5 px-4 py-2 text-sm font-semibold text-[#002395]">
            <UserCheck className="h-4 w-4" />
            {totalAdmins} ADMIN
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Rol</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Client ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Credencial demo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{entry.name}</div>
                    <div className="text-xs text-slate-500">{entry.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-[220px]">
                      <select
                        value={entry.role}
                        onChange={(event) => handleRoleChange(entry.id, event.target.value as User['role'])}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="WORKER">WORKER</option>
                        <option value="CLIENT">CLIENT</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{entry.clientId ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                      {getCredentialHint(entry.role)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-[#eef3ff] p-5">
          <h2 className="text-base font-semibold text-[#001360]">Sugerencias de administración</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cambia el rol de cualquier usuario y la credencial demo se actualizará de forma inmediata. Los clientes no comparten contraseñas de administrador ni de trabajador.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
          <h2 className="text-base font-semibold text-[#001360]">Acceso y seguridad</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Mantén el rol ADMIN como supervisor del sistema. El resto de usuarios pueden continuar con el flujo de Hub y clientes con permisos limitados.
          </p>
        </div>
      </section>
    </div>
  );
};