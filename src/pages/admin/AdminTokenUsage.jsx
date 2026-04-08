import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import PageContainer from '../../components/common/PageContainer';
import { getAdminTokenUsageAPI } from '../../services';

function normalizeRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items || payload.records || payload.rows || [];
}

function formatTokens(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatRowDate(value) {
  if (value == null || value === '') return '—';
  try {
    const d = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(d)) return String(value);
    return format(d, 'MMM d, hh:mm a');
  } catch {
    return String(value);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Demo rows when API is unavailable or returns no data */
function generateMockTokenRows(count = 14) {
  const models = ['composer-2', 'auto', 'gpt-4o', 'claude-3-opus'];
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const tokens = randomInt(45_000, 2_200_000);
    const occurred = new Date(now - i * randomInt(3, 95) * 60 * 1000);
    return {
      id: `demo-${i}-${occurred.getTime()}`,
      occurred_at: occurred.toISOString(),
      type: 'Included',
      model: models[randomInt(0, models.length - 1)],
      tokens,
      cost: 'Included',
    };
  });
}

const tablePaperSx = {
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'rgba(226, 232, 240, 0.95)',
  bgcolor: '#fff',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
};

const headCellSx = {
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#64748b',
  bgcolor: 'rgba(248, 250, 252, 0.92)',
  borderBottom: '1px solid #e2e8f0',
  py: 1.75,
  px: 2,
  fontFamily: 'var(--font-family)',
};

const bodyCellSx = {
  color: '#0f172a',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderBottom: '1px solid #f1f5f9',
  py: 2,
  px: 2,
  fontFamily: 'var(--font-family)',
};

/** Column widths: Date ~28%, Type 15%, Model ~27%, Tokens 15%, Cost 15% (sums to 100%) */
const COLUMN_WIDTHS = ['28%', '15%', '27%', '15%', '15%'];

const tableLayoutSx = {
  tableLayout: 'fixed',
  width: '100%',
};

export default function AdminTokenUsage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminTokenUsageAPI()
      .then((res) => {
        if (cancelled) return;
        const list = normalizeRows(res?.data);
        setRows(list.length > 0 ? list : generateMockTokenRows());
      })
      .catch(() => {
        if (cancelled) return;
        setRows(generateMockTokenRows());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tableRows = useMemo(
    () =>
      rows.map((row, i) => {
        const occurred =
          row.occurred_at ?? row.date ?? row.created_at ?? row.timestamp ?? row.at;
        const type = row.type ?? row.billing_type ?? '—';
        const model = row.model ?? row.model_name ?? '—';
        const tokens = row.tokens ?? row.token_count ?? row.total_tokens;
        const cost = row.cost ?? row.cost_label ?? '—';
        return {
          key: row.id ?? `${occurred}-${i}`,
          occurred,
          type,
          model,
          tokens,
          cost,
        };
      }),
    [rows],
  );

  return (
    <PageContainer
      sx={{
        maxWidth: 1120,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, sm: 3 },
        bgcolor: 'var(--bg-light)',
      }}
    >
      <TableContainer component={Paper} elevation={0} sx={tablePaperSx}>
        <Table size="medium" sx={{ ...tableLayoutSx, minWidth: 560 }}>
          <colgroup>
            {COLUMN_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              {['Date', 'Type', 'Model', 'Tokens', 'Cost'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    ...headCellSx,
                    ...(h === 'Tokens' || h === 'Cost' ? { textAlign: 'right' } : {}),
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <TableCell key={j} sx={{ ...bodyCellSx, borderBottom: '1px solid #f1f5f9' }}>
                      <Skeleton variant="text" width={j >= 4 ? 56 : '88%'} sx={{ bgcolor: 'rgba(148,163,184,0.12)' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              tableRows.map((r, idx) => (
                <TableRow
                  key={r.key}
                  hover
                  sx={{
                    '&:last-of-type td': { borderBottom: 'none' },
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.03)' },
                    ...(idx % 2 === 1 ? { bgcolor: 'rgba(248, 250, 252, 0.65)' } : {}),
                  }}
                >
                  <TableCell sx={{ ...bodyCellSx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatRowDate(r.occurred)}
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, color: '#334155' }}>{r.type}</TableCell>
                  <TableCell
                    sx={{
                      ...bodyCellSx,
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.8125rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.model}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...bodyCellSx,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: '#0f172a',
                      fontWeight: 600,
                    }}
                  >
                    {formatTokens(r.tokens)}
                  </TableCell>
                  <TableCell sx={{ ...bodyCellSx, textAlign: 'right', color: '#64748b' }}>{r.cost}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageContainer>
  );
}
