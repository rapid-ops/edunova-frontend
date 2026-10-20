export interface Series { name: string; color: string; values: (number | null)[] }

const Legend = ({ items }: { items: { name: string; color: string }[] }) => (
  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
    {items.map((i) => <span key={i.name} className="flex items-center gap-1.5 text-xs text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />{i.name}</span>)}
  </div>
);

export function LineChart({ labels, series, height = 220, max = 100, unit = '%' }: { labels: string[]; series: Series[]; height?: number; max?: number; unit?: string }) {
  const W = 600, L = 42, R = 12, T = 10, B = 26;
  const iw = W - L - R, ih = height - T - B, n = Math.max(labels.length, 1);
  const x = (i: number) => L + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v: number) => T + ih - (Math.min(Math.max(v, 0), max) / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Line chart">
        {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" /><text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#64748b">{t}{unit}</text></g>)}
        {labels.map((l, i) => <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">{l}</text>)}
        {series.map((s) => {
          let d = ''; let pen = false;
          s.values.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i)} ${y(v)} `; pen = true; });
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => (v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={s.color} />))}
            </g>
          );
        })}
      </svg>
      <Legend items={series} />
    </div>
  );
}

export function BarChart({ labels, series, height = 220, max, format = (v: number) => String(v) }: { labels: string[]; series: Series[]; height?: number; max?: number; format?: (v: number) => string }) {
  const W = 600, L = 46, R = 12, T = 10, B = 26;
  const iw = W - L - R, ih = height - T - B, n = Math.max(labels.length, 1);
  const top = max ?? Math.max(1, ...series.flatMap((s) => s.values.map((v) => v ?? 0)));
  const gw = iw / n, bw = Math.min(26, (gw * 0.7) / Math.max(series.length, 1));
  const y = (v: number) => T + ih - (Math.min(Math.max(v, 0), top) / top) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => top * t);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Bar chart">
        {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" /><text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#64748b">{format(t)}</text></g>)}
        {labels.map((l, i) => {
          const cx = L + gw * i + gw / 2;
          const start = cx - (bw * series.length) / 2;
          return (
            <g key={i}>
              {series.map((s, k) => { const v = s.values[i]; return v == null ? null : <rect key={s.name} x={start + k * bw} y={y(v)} width={bw - 2} height={Math.max(0, T + ih - y(v))} rx="3" fill={s.color} />; })}
              <text x={cx} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">{l}</text>
            </g>
          );
        })}
      </svg>
      {series.length > 1 && <Legend items={series} />}
    </div>
  );
}

export function DonutChart({ segments, size = 160, thickness = 18, centerLabel, centerSub }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number; centerLabel?: string; centerSub?: string }) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r, cx = size / 2;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart" className="shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
      {total > 0 && segments.map((s) => {
        const len = (s.value / total) * c;
        const el = <circle key={s.label} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cx})`} />;
        offset += len;
        return el;
      })}
      {centerLabel && <text x={cx} y={cx + (centerSub ? 2 : 7)} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0b1a4a">{centerLabel}</text>}
      {centerSub && <text x={cx} y={cx + 18} textAnchor="middle" fontSize="10" fill="#64748b">{centerSub}</text>}
    </svg>
  );
}

export function ProgressRing({ value, size = 72, thickness = 8, color = '#10b981', label }: { value: number; size?: number; thickness?: number; color?: string; label?: string }) {
  const v = Math.min(100, Math.max(0, value));
  const r = (size - thickness) / 2, c = 2 * Math.PI * r, cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${v}%`} className="shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx + 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="#0b1a4a">{label ?? `${Math.round(v)}%`}</text>
    </svg>
  );
}
