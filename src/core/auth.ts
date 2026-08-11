import type { AuthCredentials, AuthResponse, ReportItem, User } from '../types';
import { demoReports, usersStore } from '../config/auth';

export const isClientRole = (role: User['role']) => role === 'CLIENT';
export const canAccessHub = (user?: User | null) => Boolean(user && !isClientRole(user.role));

export const authenticateUser = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.user) {
        return data;
      }
    }
  } catch {
    // Fallback local para entorno de desarrollo sin backend activo.
  }

  const allUsers = usersStore.getUsers();
  const user = allUsers.find((entry) => entry.email === credentials.email);
  if (!user) {
    throw new Error('Credenciales inválidas. Prueba con las cuentas demo del panel.');
  }

  // If the user has a custom password, validate against it. Otherwise fall back to role-based demo password.
  const expected = user.password ?? `${user.role.toLowerCase()}123`;
  if (credentials.password !== expected) {
    throw new Error('Contraseña incorrecta. Usa la contraseña demo indicada en la vista.');
  }

  return {
    user,
    token: `mock-${user.id}`,
  };
};

export const getClientReports = async (clientId?: User['clientId']): Promise<ReportItem[]> => {
  if (!clientId) {
    return [];
  }

  try {
    const response = await fetch(`/api/v1/reports?clientId=${encodeURIComponent(clientId)}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.reports)) {
        return data.reports;
      }
    }
  } catch {
    // Fallback local.
  }

  return demoReports.filter((report) => report.clientId === clientId);
};
