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
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { getAdminCompaniesViewedAPI } from '../../services';

function buildDateParams(range) {
  if (range?.from && range?.to) return { from_date: range.from, to_date: range.to };
  return {};
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

export default function AdminCompaniesViewed() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [dateRange, setDateRange] = useState({ preset: 30, from: null, to: null });
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('last_visited_at');
  const [orderDir, setOrderDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { page, limit, ...buildDateParams(dateRange) };
    getAdminCompaniesViewedAPI(params)
      .then((res) => {
        setCompanies(res?.data?.companies || []);
        setTotal(res?.data?.total || 0);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load');
        setCompanies([]);
      })
      .finally(() => setLoading(false));
  }, [page, limit, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const s = search.trim().toLowerCase();
    return companies.filter((c) => (c.company_name || '').toLowerCase().includes(s));
  }, [companies, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const mult = orderDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let va = a[orderBy];
      let vb = b[orderBy];
      if (orderBy === 'last_visited_at') {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
        return mult * (va - vb);
      }
      if (typeof va === 'string') return mult * (va.localeCompare(vb) || 0);
      return mult * ((va ?? 0) - (vb ?? 0));
    });
    return arr;
  }, [filtered, orderBy, orderDir]);

  const handleSort = (key) => {
    if (orderBy === key) setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else setOrderBy(key);
  };

  const maxUsers = Math.max(...companies.map((c) => c.unique_users || 0), 1);

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
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
              Companies Viewed
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
              Companies from career page visits and saved jobs
            </Typography>
          </Box>
        </Box>
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
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={BusinessRoundedIcon}
            label="Total Companies"
            value={loading ? undefined : total}
            sublabel="In date range"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleRoundedIcon}
            label="On This Page"
            value={loading ? undefined : companies.length}
            sublabel="Current page"
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
                <TableCell sx={{ ...tableCellHeadSx, width: 56 }}>Rank</TableCell>
                <TableCell sx={tableCellHeadSx}>
                  <TableSortLabel
                    active={orderBy === 'company_name'}
                    direction={orderBy === 'company_name' ? orderDir : 'asc'}
                    onClick={() => handleSort('company_name')}
                  >
                    Company
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>
                  <TableSortLabel
                    active={orderBy === 'unique_users'}
                    direction={orderBy === 'unique_users' ? orderDir : 'desc'}
                    onClick={() => handleSort('unique_users')}
                  >
                    Unique Users
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>
                  <TableSortLabel
                    active={orderBy === 'total_visits'}
                    direction={orderBy === 'total_visits' ? orderDir : 'desc'}
                    onClick={() => handleSort('total_visits')}
                  >
                    Total Visits
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Autofill</TableCell>
                <TableCell sx={tableCellHeadSx}>
                  <TableSortLabel
                    active={orderBy === 'last_visited_at'}
                    direction={orderBy === 'last_visited_at' ? orderDir : 'desc'}
                    onClick={() => handleSort('last_visited_at')}
                  >
                    Last Visited
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={6} />
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 'none' }}>
                    <EmptyState
                      icon={InboxOutlinedIcon}
                      title="No companies found"
                      description="Try a different date range or search term."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((c, i) => (
                  <TableRow
                    key={(c.company_name || '') + i}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
                      '& td': { borderBottom: '1px solid var(--divider)' },
                    }}
                  >
                    {/* Rank */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          bgcolor: i === 0 ? 'var(--light-blue-bg-15)' : 'var(--grey-4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: i === 0 ? 'var(--primary)' : 'var(--text-muted)',
                          }}
                        >
                          {(page - 1) * limit + i + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Company + bar */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', mb: 0.5 }}>
                        {c.company_name || '—'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={((c.unique_users || 0) / maxUsers) * 100}
                        sx={{
                          height: 5,
                          borderRadius: '999px',
                          bgcolor: 'var(--grey-4)',
                          '& .MuiLinearProgress-bar': { borderRadius: '999px', bgcolor: 'var(--primary)', opacity: 0.7 },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', py: 1.5 }}>
                      {c.unique_users ?? 0}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                      {c.total_visits ?? 0}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                      {c.autofill_uses ?? 0}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                      {c.last_visited_at
                        ? new Date(c.last_visited_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={search ? sorted.length : total}
          page={search ? 0 : page - 1}
          onPageChange={search ? () => { } : (_, p) => setPage(p + 1)}
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
