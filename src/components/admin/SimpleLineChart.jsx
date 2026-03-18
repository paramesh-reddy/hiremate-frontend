import { Box, Typography } from '@mui/material';

/**
 * Lightweight SVG line chart with area fill and dot markers. No extra deps.
 * data: [{ date, count }]
 */
export default function SimpleLineChart({ data, height = 200, label }) {
  if (!data?.length) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--text-muted)' }}>
          No data available
        </Typography>
      </Box>
    );
  }

  const values = data.map((d) => d.count ?? 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const w = 800;
  const h = height - 32;
  const padding = { top: 12, right: 12, bottom: 12, left: 44 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const pts = values.map((v, i) => ({
    x: padding.left + (values.length > 1 ? (i / (values.length - 1)) * chartW : chartW / 2),
    y: padding.top + chartH - ((v - minVal) / range) * chartH,
  }));

  const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');

  // Area fill polygon: line points + bottom-right + bottom-left
  const areaPoints = [
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${padding.top + chartH}`,
    `${pts[0].x},${padding.top + chartH}`,
  ].join(' ');

  // Subtle horizontal grid lines
  const gridLines = [...Array(5)].map((_, i) => {
    const y = padding.top + (i / 4) * chartH;
    return (
      <line
        key={i}
        x1={padding.left}
        y1={y}
        x2={w - padding.right}
        y2={y}
        stroke="var(--border-color)"
        strokeOpacity={0.25}
        strokeDasharray="4 4"
      />
    );
  });

  return (
    <Box>
      {label && (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            mb: 1,
          }}
        >
          {label}
        </Typography>
      )}
      <Box sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <svg width={w} height={height} style={{ minWidth: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines}

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#chartAreaGradient)"
          />

          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dot markers */}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={values.length <= 15 ? 3.5 : 0}
              fill="var(--primary)"
              stroke="var(--bg-paper)"
              strokeWidth={2}
            />
          ))}
        </svg>
      </Box>
    </Box>
  );
}
