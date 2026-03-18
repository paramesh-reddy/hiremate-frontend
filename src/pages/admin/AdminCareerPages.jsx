import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
  LinearProgress,
  Grid,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PageContainer from '../../components/common/PageContainer';
import DateFilter from '../../components/dashboard/DateFilter';
import { EmptyState, TableRowsSkeleton, StatCard } from '../../components/admin';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { getAdminCareerPageLinksAPI } from '../../services';

function buildDateParams(range) {
  if (range?.from && range?.to) return { from_date: range.from, to_date: range.to };
  return {};
}

function getDomain(url) {
  if (!url) return '—';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.slice(0, 50) || '—';
  }
}

function truncateUrl(url, max = 56) {
  if (!url) return '—';
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + '...';
}

const tableCellHeadSx = {
  fontWeight: 700,
  fontSize: 13,
  bgcolor: 'var(--grey-4)',
  borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  letterSpacing: '0.02em',
  py: 1.5,
};

export default function AdminCareerPages() {
  const [links, setLinks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [dateRange, setDateRange] = useState({ preset: 30, from: null, to: null });
  const [domainFilter, setDomainFilter] = useState('');
  const [orderBy, setOrderBy] = useState('visit_count');
  const [orderDir, setOrderDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { page, limit, ...buildDateParams(dateRange) };
    getAdminCareerPageLinksAPI(params)
      .then((res) => {
        setLinks(res?.data?.links || []);
        setTotal(res?.data?.total || 0);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load');
        setLinks([]);
      })
      .finally(() => setLoading(false));
  }, [page, limit, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let arr = links;
    if (domainFilter.trim()) {
      const d = domainFilter.trim().toLowerCase();
      arr = arr.filter((l) => getDomain(l.page_url).toLowerCase().includes(d));
    }
    return arr;
  }, [links, domainFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const mult = orderDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => mult * ((a[orderBy] ?? 0) - (b[orderBy] ?? 0)));
    return arr;
  }, [filtered, orderBy, orderDir]);

  const handleSort = (key) => {
    if (orderBy === key) setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else setOrderBy(key);
  };

  const maxVisits = Math.max(...sorted.map((l) => l.visit_count || 0), 1);
  const totalVisits = links.reduce((acc, l) => acc + (l.visit_count || 0), 0);

  return (
    <PageContainer
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        bgcolor: 'var(--bg-light)',
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid var(--divider)' }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 22, md: 28 },
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Career Page Links
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
          Top career page URLs by visits and autofill activity
        </Typography>
      </Box>

      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          mb: 3,
          p: 1.5,
          bgcolor: 'var(--bg-paper)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          boxShadow: 'var(--dashboard-card-shadow)',
        }}
      >
        <TextField
          size="small"
          placeholder="Filter by domain..."
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 220,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: 'var(--bg-light)',
              '& fieldset': { borderColor: 'var(--border-color)' },
              '&:hover fieldset': { borderColor: 'var(--border-hover)' },
            },
          }}
        />
        <DateFilter value={dateRange} onChange={setDateRange} />
      </Box>

      {/* Error banner */}
      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '10px',
            bgcolor: 'var(--error-bg)',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--error-dark)', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Stat summary */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={LinkRoundedIcon}
            label="Total Links"
            value={loading ? undefined : total}
            sublabel="In date range"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={VisibilityRoundedIcon}
            label="Total Visits"
            value={loading ? undefined : totalVisits}
            sublabel="This page"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--dashboard-card-shadow)',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 420px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellHeadSx}>Page URL</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>
                  <TableSortLabel
                    active={orderBy === 'visit_count'}
                    direction={orderBy === 'visit_count' ? orderDir : 'desc'}
                    onClick={() => handleSort('visit_count')}
                  >
                    Visits
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Autofill</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Unique Users</TableCell>
                <TableCell sx={{ ...tableCellHeadSx, width: '28%' }}>Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={5} />
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ border: 'none' }}>
                    <EmptyState
                      icon={LinkOffRoundedIcon}
                      title="No career page links"
                      description="Try a different date range or domain filter."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((l, i) => {
                  const domain = getDomain(l.page_url);
                  const pct = ((l.visit_count || 0) / maxVisits) * 100;
                  return (
                    <TableRow
                      key={(l.page_url || '') + i}
                      hover
                      sx={{
                        '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
                        '& td': { borderBottom: '1px solid var(--divider)' },
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--primary)',
                            mb: 0.25,
                          }}
                        >
                          {domain}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                          }}
                          title={l.page_url}
                        >
                          {truncateUrl(l.page_url, 70)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', py: 1.5 }}>
                        {(l.visit_count ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                        {(l.autofill_count ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                        {(l.unique_users ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 5,
                            borderRadius: '999px',
                            bgcolor: 'var(--grey-4)',
                            '& .MuiLinearProgress-bar': { borderRadius: '999px', bgcolor: 'var(--primary)' },
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.5, display: 'block' }}>
                          {pct.toFixed(0)}% of max
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={domainFilter ? sorted.length : total}
          page={domainFilter ? 0 : page - 1}
          onPageChange={domainFilter ? () => { } : (_, p) => setPage(p + 1)}
          rowsPerPage={limit}
          rowsPerPageOptions={[limit]}
          sx={{
            borderTop: '1px solid var(--border-color)',
            bgcolor: 'var(--bg-paper)',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: 13,
              color: 'var(--text-secondary)',
            },
          }}
        />
      </Paper>
    </PageContainer>
  );
}
