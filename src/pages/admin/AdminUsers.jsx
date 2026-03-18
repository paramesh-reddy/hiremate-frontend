import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { getAdminUsersAPI } from '../../services';

function getInitials(firstName, lastName, email) {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

function exportCSV(users) {
  if (!users?.length) return;
  const headers = ['Email', 'First Name', 'Last Name', 'Created', 'Last Activity', 'Jobs', 'Visits'];
  const rows = users.map((u) => [
    u.email || '',
    u.first_name || '',
    u.last_name || '',
    u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    u.last_activity_at ? new Date(u.last_activity_at).toLocaleDateString() : '',
    u.jobs_count ?? 0,
    u.career_visits_count ?? 0,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `admin-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
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

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminUsersAPI({ page, limit, search: searchDebounced || undefined })
      .then((res) => {
        setUsers(res?.data?.users || []);
        setTotal(res?.data?.total || 0);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || 'Failed to load users');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [page, limit, searchDebounced]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid var(--divider)',
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
            Users
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
            All registered users and their activity
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by email or name..."
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
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: 'var(--bg-paper)',
                '& fieldset': { borderColor: 'var(--border-color)' },
                '&:hover fieldset': { borderColor: 'var(--border-hover)' },
              },
            }}
          />
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => exportCSV(users)}
            disabled={!users.length}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              bgcolor: 'var(--bg-paper)',
              px: 2,
              '&:hover': {
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                bgcolor: 'var(--light-blue-bg-08)',
              },
            }}
          >
            Export CSV
          </Button>
        </Box>
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
        <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellHeadSx}>User</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Jobs</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Visits</TableCell>
                <TableCell sx={tableCellHeadSx}>Last Activity</TableCell>
                <TableCell sx={tableCellHeadSx}>Status</TableCell>
                <TableCell width={72} sx={tableCellHeadSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={6} />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ border: 'none' }}>
                    <EmptyState
                      icon={InboxOutlinedIcon}
                      title="No users found"
                      description="Try a different search term or check back later."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'var(--light-blue-bg-02)' },
                      transition: 'background 0.15s ease',
                      '& td': { borderBottom: '1px solid var(--divider)' },
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            fontWeight: 700,
                            bgcolor: 'var(--light-blue-bg-08)',
                            color: 'var(--primary)',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(u.first_name, u.last_name, u.email)}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                            }}
                          >
                            {u.email || '—'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: 12, color: 'var(--text-muted)' }}
                          >
                            Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', py: 1.5 }}>
                      {u.jobs_count ?? 0}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', py: 1.5 }}>
                      {u.career_visits_count ?? 0}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)', py: 1.5 }}>
                      {u.last_activity_at
                        ? new Date(u.last_activity_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : '—'}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: '0.02em',
                          bgcolor: 'var(--success-bg)',
                          color: 'var(--success-dark)',
                          border: 'none',
                          borderRadius: '999px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        title="View usage"
                        sx={{
                          color: 'var(--text-muted)',
                          '&:hover': { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' },
                        }}
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(_, p) => setPage(p + 1)}
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
