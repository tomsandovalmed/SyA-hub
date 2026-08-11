import React, { useMemo, useState } from 'react';
import { ChevronLeft, ShieldCheck, UserCheck, Lock, Plus, Edit3, Trash2, X } from 'lucide-react';
import type { User } from '../types';
import type { ViewMode } from '../modules/perfmon-analyzer/types/perfmon.types';
import { usersStore } from '../config/auth';

interface AdminDashboardViewProps {
  user: User;
  onNavigate: (view: ViewMode) => void;
}

type ModalMode = 'create' | 'edit';

const getCredentialHint = (role: User['role']) => {
  if (role === 'CLIENT') return 'client123';
  return `${role.toLowerCase()}123`;
};

const initialFormState = {
  name: '',
  email: '',
  role: 'CLIENT' as User['role'],
  password: '',
  clientId: '',
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user, onNavigate }) => {
  const [users, setUsers] = useState<User[]>(() => usersStore.getUsers());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<'success' | 'info'>('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...initialFormState });
  const [formError, setFormError] = useState<string | null>(null);

  const totalAdmins = useMemo(
    () => users.filter((entry) => entry.role === 'ADMIN').length,
    [users]
  );

  const resetForm = () => {
    setFormData({ ...initialFormState });
    setFormError(null);
  };

  const showMessage = (message: string, variant: 'success' | 'info' = 'success') => {
    setStatusVariant(variant);
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3200);
  };

  const openCreateUser = () => {
    resetForm();
    setModalMode('create');
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const openEditUser = (entry: User) => {
    setModalMode('edit');
    setEditingUserId(entry.id);
    setFormData({
      name: entry.name,
      email: entry.email,
      role: entry.role,
      password: '',
      clientId: entry.clientId ?? '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSaveUser = () => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    if (!trimmedName || !trimmedEmail) {
      setFormError('Nombre y correo son obligatorios.');
      return;
    }

    if (modalMode === 'create') {
      const newUser: User = {
        id: crypto?.randomUUID?.() ?? `user-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: formData.role,
        clientId: formData.clientId.trim() || undefined,
        password: formData.password?.trim() || undefined,
      };

      usersStore.addUser(newUser);
      setUsers(usersStore.getUsers());
      showMessage('Usuario creado correctamente.');
    } else if (editingUserId) {
      const updated: User = {
        id: editingUserId,
        name: trimmedName,
        email: trimmedEmail,
        role: formData.role,
        clientId: formData.clientId.trim() || undefined,
        password: formData.password?.trim() || undefined,
      };
      usersStore.updateUser(updated);
      setUsers(usersStore.getUsers());
      showMessage(
        `Usuario ${formData.password ? 'actualizado y contraseña reenviada' : 'actualizado'} correctamente.`,
        'info'
      );
    }

    closeModal();
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find((entry) => entry.id === id);
    if (!target) return;

    const confirmation = window.confirm(
      `¿Estás seguro de eliminar al usuario ${target.name}? Esta acción es irreversible en el entorno de demostración.`
    );
    if (!confirmation) return;

    usersStore.deleteUser(id);
    setUsers(usersStore.getUsers());
    showMessage('Usuario eliminado del sistema.');
  };

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
              Gestiona cuentas, roles y credenciales demo para el ecosistema S&A Hub.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openCreateUser}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#002395] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#001a70]"
            >
              <Plus className="h-4 w-4" />
              Crear nuevo usuario
            </button>
            <button
              type="button"
              onClick={() => onNavigate('hub')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al Hub
            </button>
          </div>
        </div>
      </section>

      {statusMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            statusVariant === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          {statusMessage}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#002395]">Usuarios simulados</p>
            <p className="mt-1 text-sm text-slate-600">{users.length} perfiles gestionados</p>
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
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
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
                        onChange={(event) => {
                          const nextRole = event.target.value as User['role'];
                          const updated: User = { ...entry, role: nextRole };
                          usersStore.updateUser(updated);
                          setUsers(usersStore.getUsers());
                        }}
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
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditUser(entry)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-[#eef3ff]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(entry.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
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
            Mantén el rol ADMIN como supervisor del sistema. El resto de usuarios puede continuar con el flujo de Hub y clientes con permisos limitados.
          </p>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#002395]">
                  {modalMode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#001360]">
                  {modalMode === 'create' ? 'Crear cuenta' : 'Actualizar usuario'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Nombre</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  placeholder="Ej. María Pérez"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Correo</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                  placeholder="usuario@sachile.cl"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Rol</span>
                <select
                  value={formData.role}
                  onChange={(event) => handleFormChange('role', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="WORKER">WORKER</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Client ID (opcional)</span>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(event) => handleFormChange('clientId', event.target.value)}
                  placeholder="Ej. SII, TGR, SAT, DGII"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                />
              </label>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <label className="space-y-2 text-sm block w-full">
                <span className="font-semibold text-slate-700">Contraseña</span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleFormChange('password', event.target.value)}
                  placeholder="Ingrese una contraseña segura"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/20"
                />
              </label>
              <p className="text-xs text-slate-500">
                Solo se usa para creación o actualización local de la cuenta demo. No hay almacenamiento de contraseña real en este entorno.
              </p>
            </div>

            {formError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#002395] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001a70]"
              >
                <UserCheck className="h-4 w-4" />
                {modalMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};