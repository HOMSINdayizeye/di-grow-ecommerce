/** Shared recharts styling so every admin chart reads as one system. */
export const CHART_COLORS = {
  brand: '#16a35a',
  accent: '#e98039',
  gold: '#fba100',
  success: '#22c55e',
  danger: '#ef4444',
};

export const STATUS_COLORS = {
  new: '#0ea5e9',
  contacted: '#fba100',
  confirmed: '#e98039',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export const AXIS_TICK = { fill: '#9aa3b2', fontSize: 12 };
export const AXIS_LINE = { stroke: 'rgba(154,163,178,0.25)' };
export const GRID_STROKE = 'rgba(154,163,178,0.18)';

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgb(var(--c-surface))',
    border: '1px solid var(--glass-border)',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    color: 'rgb(var(--c-ink))',
    fontSize: 13,
    padding: '8px 12px',
  },
  labelStyle: { color: 'rgb(var(--c-ink))', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: 'rgb(var(--c-muted))', padding: 0 },
  cursor: { stroke: 'rgba(154,163,178,0.35)', fill: 'rgba(154,163,178,0.08)' },
};
