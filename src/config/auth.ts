import type { ReportItem, User } from '../types';

const initialUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@sachile.cl',
    name: 'Administrador S&A',
    role: 'ADMIN',
  },
  {
    id: 'worker-1',
    email: 'worker@sachile.cl',
    name: 'Trabajador S&A',
    role: 'WORKER',
  },
  {
    id: 'client-sii',
    email: 'cliente.sii@sachile.cl',
    name: 'Cliente SII',
    role: 'CLIENT',
    clientId: 'SII',
  },
  {
    id: 'client-tgr',
    email: 'cliente.tgr@sachile.cl',
    name: 'Cliente TGR',
    role: 'CLIENT',
    clientId: 'TGR',
  },
];

let users: User[] = [...initialUsers];

export const usersStore = {
  getUsers: () => users.slice(),
  setUsers: (next: User[]) => {
    users = next.slice();
  },
  addUser: (u: User) => {
    users = [u, ...users];
  },
  updateUser: (u: User) => {
    users = users.map((x) => (x.id === u.id ? { ...x, ...u } : x));
  },
  deleteUser: (id: string) => {
    users = users.filter((x) => x.id !== id);
  },
};

export const demoReports: ReportItem[] = [
  {
    id: 'rep-sii-01',
    title: 'Resumen mensual SII',
    clientId: 'SII',
    type: 'Executive Summary',
    status: 'Ready',
    createdAt: '2026-08-01',
    summary: 'Indicadores de desempeño y anomalías del módulo SII.',
    fileName: 'sii-resumen-mensual.pdf',
  },
  {
    id: 'rep-sii-02',
    title: 'Detección de cuellos de botella',
    clientId: 'SII',
    type: 'Perfmon Analysis',
    status: 'Ready',
    createdAt: '2026-08-05',
    summary: 'Análisis de eventos críticos para el proceso de validación tributaria.',
    fileName: 'sii-perfmon-analysis.pdf',
  },
  {
    id: 'rep-tgr-01',
    title: 'Consolidado TGR',
    clientId: 'TGR',
    type: 'Operations Report',
    status: 'Ready',
    createdAt: '2026-08-03',
    summary: 'Reporte de conciliación y procesamiento de pagos nocturnos.',
    fileName: 'tgr-consolidado.pdf',
  },
];
