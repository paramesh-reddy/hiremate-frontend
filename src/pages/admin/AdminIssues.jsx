import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PageContainer from '../../components/common/PageContainer';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';
import { listIssuesAPI, updateIssueStatusAPI } from '../../services';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = ['', 'open', 'in_progress', 'resolved'];
const CATEGORY_OPTIONS = ['', 'bug', 'feature_request', 'ui_issue', 'performance', 'other'];
const SOURCE_OPTIONS = ['', 'web', 'extension'];

const STATUS_COLORS = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
};

const CATEGORY_LABELS = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  ui_issue: 'UI Issue',
  performance: 'Performance',
  other: 'Other',
};

const tableCellHeadSx = {
  fontWeight: 700,
  fontSize: 12,
  color: 'var(--text-muted)',
  bgcolor: 'var(--bg-light)',
  borderBottom: '2px solid var(--divider)',
  py: 1.5,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function IssueDetailModal({ issue, onClose, onStatusChange }) {
  const [status, setStatus] = useState(issue?.status ?? 'open');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStatus(issue?.status ?? 'open'); }, [issue]);

  if (!issue) return null;

  const handleSave = async () => {
    if (status === issue.status) { onClose(); return; }
    setSaving(true);
    try {
      await updateIssueStatusAPI(issue.id, status);
      onStatusChange(issue.id, status);
      onClose();
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  };

  const meta = issue.metadata ?? {};

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'var(--bg-paper)',
          backgroundImage: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 2,
          gap: 2,
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', mb: 0.5 }}>
            #{issue.id} — {issue.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
            <Chip
              label={CATEGORY_LABELS[issue.category] ?? issue.category}
              size="small"
              sx={{ fontSize: 11, fontWeight: 600, height: 24 }}
            />
            <Chip
              label={issue.source}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11, fontWeight: 600, height: 24 }}
            />
            <Chip
              label={issue.status.replace('_', ' ')}
              size="small"
              color={STATUS_COLORS[issue.status] ?? 'default'}
              sx={{ fontSize: 11, fontWeight: 600, height: 24, textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Description
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--divider)',
            }}
          >
            {issue.description}
          </Typography>
        </Box>

        {issue.screenshot_url && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Screenshot
            </Typography>
            <Button
              component="a"
              href={issue.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'var(--divider)',
                color: 'var(--primary)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              View Screenshot
            </Button>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Context
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {[
              { icon: EmailRoundedIcon, label: 'User', value: issue.user_email || 'Anonymous' },
              { icon: AccessTimeRoundedIcon, label: 'Submitted', value: new Date(issue.created_at).toLocaleString() },
              { icon: LanguageRoundedIcon, label: 'Page URL', value: meta.url || 'Not provided' },
              { icon: ComputerRoundedIcon, label: 'Environment', value: meta.browser && meta.os ? `${meta.browser} · ${meta.os}` : 'Not provided' },
            ].map(({ icon: Icon, label, value }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--divider)',
                }}
              >
                <Icon sx={{ fontSize: 18, color: 'var(--text-muted)', mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all', lineHeight: 1.5 }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Update Status
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid var(--divider)' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: 'var(--divider)',
              color: 'var(--text-secondary)',
              px: 3,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              },
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterSource && { source: filterSource }),
      };
      const { data } = await listIssuesAPI(params);
      setIssues(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterStatus, filterCategory, filterSource]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (issueId, newStatus) => {
    setIssues((prev) => prev.map((iss) => iss.id === issueId ? { ...iss, status: newStatus } : iss));
  };

  return (
    <PageContainer title="Issue Reports" subtitle="User-submitted bugs, feature requests, and feedback">
      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--divider)',
          borderRadius: 2.5,
          p: 2.5,
          mb: 3,
          bgcolor: 'var(--bg-paper)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterListRoundedIcon sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Filters
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              {total} issue{total !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search title, description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'var(--bg-light)',
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={handleFilterChange(setFilterStatus)}
              sx={{ borderRadius: 2, bgcolor: 'var(--bg-light)' }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={handleFilterChange(setFilterCategory)}
              sx={{ borderRadius: 2, bgcolor: 'var(--bg-light)' }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={filterSource}
              label="Source"
              onChange={handleFilterChange(setFilterSource)}
              sx={{ borderRadius: 2, bgcolor: 'var(--bg-light)' }}
            >
              <MenuItem value="">All Sources</MenuItem>
              <MenuItem value="web">Web</MenuItem>
              <MenuItem value="extension">Extension</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--divider)',
          borderRadius: 2.5,
          overflow: 'hidden',
          boxShadow: 'var(--dashboard-card-shadow)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['#', 'Title', 'Category', 'Status', 'Source', 'Submitted by', 'Date'].map((h) => (
                  <TableCell key={h} sx={tableCellHeadSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} cols={7} />
              ) : issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8 }}>
                    <EmptyState
                      icon={<BugReportOutlinedIcon sx={{ fontSize: 48, color: 'var(--text-muted)' }} />}
                      message="No issues found"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((iss) => (
                  <TableRow
                    key={iss.id}
                    hover
                    onClick={() => setSelectedIssue(iss)}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td': { border: 0 },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <TableCell sx={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                      #{iss.id}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {iss.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={CATEGORY_LABELS[iss.category] ?? iss.category}
                        size="small"
                        sx={{ fontSize: 11, fontWeight: 600, height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={iss.status.replace('_', ' ')}
                        size="small"
                        color={STATUS_COLORS[iss.status] ?? 'default'}
                        sx={{ fontSize: 11, fontWeight: 600, height: 24, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={iss.source}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11, fontWeight: 600, height: 24, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {iss.user_email ?? 'Anonymous'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(iss.created_at).toLocaleDateString()}
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
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            borderTop: '1px solid var(--divider)',
            bgcolor: 'var(--bg-light)',
            '& .MuiTablePagination-toolbar': { minHeight: 52 },
          }}
        />
      </Paper>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </PageContainer>
  );
}
