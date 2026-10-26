import api, { USE_MOCK, getMock, toQuery } from './api';

export const reportService = {
  async dashboard() {
    if (USE_MOCK) return (await getMock()).getDashboardStats();
    return api.get('/admin/reports/dashboard');
  },

  async summary(params = {}) {
    if (USE_MOCK) return (await getMock()).getReports(params);
    return api.get('/admin/reports', { params: toQuery(params) });
  },

  async auditLogs() {
    if (USE_MOCK) return (await getMock()).getAuditLogs();
    return api.get('/admin/reports/audit');
  },

  /** Build a CSV string from rows for client-side export. */
  toCsv(rows, columns) {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = columns.map((c) => esc(c.label)).join(',');
    const body = rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(','));
    return [head, ...body].join('\n');
  },

  downloadCsv(filename, csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default reportService;
