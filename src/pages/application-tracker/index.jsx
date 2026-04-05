import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, TextField, InputAdornment, Button, Chip,
  Tabs, Tab, Tooltip, IconButton, Select, MenuItem, FormControl,
  Menu, useMediaQuery, useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DateFilter from '../../components/dashboard/DateFilter';
import AddApplicationModal from './AddApplicationModal';
import {
  listApplicationsAPI,
  triggerSyncAPI,
  getSyncStatusAPI,
  stopSyncAPI,
} from '../../services/applicationsService';
import ChatWidget from './ChatWidget';
import PermissionGuard from '../../components/application-tracker/PermissionGuard';
import { useSelector } from 'react-redux';

const COLUMNS = [
  {
    id: 'saved',
    label: 'SAVED',
    statuses: ['saved', 'not_yet_applied', 'i_have_not_yet_applied'],
    accent: '#1E293B',
    emptyMsg: 'No saved jobs',
  },
  {
    id: 'applied',
    label: 'APPLIED',
    statuses: ['applied', 'acknowledged'],
    accent: '#2563EB',
    emptyMsg: 'No applications yet',
  },
  {
    id: 'in_review',
    label: 'IN REVIEW',
    statuses: ['in_review'],
    accent: '#3B82F6',
    emptyMsg: 'None under review',
  },
  {
    id: 'interviewing',
    label: 'INTERVIEWING',
    statuses: ['interview_scheduled', 'interview_completed'],
    accent: '#6366F1',
    emptyMsg: 'No interviews scheduled',
  },
  {
    id: 'offer',
    label: 'OFFER',
    statuses: ['offer_received'],
    accent: '#0EA5E9',
    emptyMsg: 'No offers received',
  },
  {
    id: 'rejected',
    label: 'REJECTED',
    statuses: ['rejected', 'ghosted', 'withdrawn'],
    accent: '#94A3B8',
    emptyMsg: 'No rejected jobs',
  },
];

const AVATAR_PALETTE = [
  '#2563EB', '#3B82F6', '#6366F1', '#0891B2',
  '#0D9488', '#7C3AED', '#DB2777', '#D97706',
];

const getAvatarColor = (name = '') =>
  AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function FavoriteButton({ appId }) {
  const [liked, setLiked] = useState(false);
  return (
    <IconButton
      size="small"
      onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
      sx={{
        p: 0.5,
        color: liked ? '#EF4444' : 'var(--text-muted)',
        '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' },
      }}
    >
      {liked
        ? <FavoriteRoundedIcon sx={{ fontSize: 15 }} />
        : <FavoriteBorderRoundedIcon sx={{ fontSize: 15 }} />}
    </IconButton>
  );
}

export default function ApplicationTrackerPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ preset: 7, from: null, to: null });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedUntil, setAppliedUntil] = useState('');
  const prevStatusRef = useRef(null);

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down(1600));
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const handleMoreOpen = (e) => setMoreAnchorEl(e.currentTarget);
  const handleMoreClose = () => setMoreAnchorEl(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => listApplicationsAPI().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: syncStatus } = useQuery({
    queryKey: ['sync-status'],
    queryFn: () => getSyncStatusAPI().then((r) => r.data),
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 2000 : 15_000,
  });

  useEffect(() => {
    if (prevStatusRef.current === 'running' && syncStatus?.status !== 'running') {
      setLastSyncTime(new Date());
    }
    prevStatusRef.current = syncStatus?.status;
  }, [syncStatus?.status]);

  const getSyncDates = () => {
    if (dateRange?.from && dateRange?.to) return { from: dateRange.from, to: dateRange.to };
    if (dateRange?.preset) {
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - dateRange.preset * 86400000).toISOString().slice(0, 10);
      return { from, to };
    }
    return { from: '', to: '' };
  };

  const syncMutation = useMutation({
    mutationFn: () => {
      const { from, to } = getSyncDates();
      return triggerSyncAPI(from, to);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sync-status'] }),
  });

  const stopMutation = useMutation({
    mutationFn: stopSyncAPI,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-status'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const isSyncing = syncStatus?.status === 'running' || syncMutation.isPending;
  const progress =
    syncStatus?.total_threads > 0
      ? Math.round((syncStatus.parsed_count / syncStatus.total_threads) * 100)
      : 0;

  const filtered = apps.filter((app) => {
    const matchesSearch =
      (app.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.role || '').toLowerCase().includes(search.toLowerCase());
    const matchesJobType = jobTypeFilter === 'all' || app.job_type === jobTypeFilter;
    const matchesStatus = statusFilter === 'all' || app.current_status === statusFilter;
    const appDate = app.applied_date ? app.applied_date.slice(0, 10) : null;
    const matchesFrom = !appliedFrom || (appDate && appDate >= appliedFrom);
    const matchesUntil = !appliedUntil || (appDate && appDate <= appliedUntil);
    return matchesSearch && matchesJobType && matchesStatus && matchesFrom && matchesUntil;
  });

  const toggleColumn = (colId) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  const user = useSelector((state) => state.auth.user);
  console.log(user);
  const hasGmailPermission = user?.gmail_sync_enabled;

  if (!hasGmailPermission) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <PermissionGuard />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? '#0b0f19' : '#F0F4FF',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          pt: 1.5,
          pb: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {/* Row 1: Title + action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              fontWeight={800}
              sx={{ fontSize: 20, letterSpacing: '-0.4px', color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              Your Job Tracker
            </Typography>
            <Chip
              label={`${filtered.length} TOTAL JOBS`}
              size="small"
              sx={{
                height: 22,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
                color: '#2563EB',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.3)' : '#BFDBFE',
                letterSpacing: '0.04em',
                '& .MuiChip-label': { px: 1.25 },
              }}
            />
            {lastSyncTime && (
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: 11, color: '#94A3B8' }}>
                · Synced {lastSyncTime.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              height: 34, px: 2.5, borderRadius: 2, whiteSpace: 'nowrap',
              textTransform: 'none', fontWeight: 700, fontSize: 12,
              bgcolor: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Add Application
          </Button>
        </Box>
      </Box>

      {/* ── Toolbar ── */}
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: 1.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search roles or companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260, flexShrink: 0 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 16 }} />
                </InputAdornment>
              ),
              sx: {
                height: 38, borderRadius: '10px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', fontSize: 13,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
              },
            },
          }}
        />

        <Box sx={{ flex: 1 }} />

        {/* From Date */}
        <TextField
          size="small"
          type="date"
          value={appliedFrom}
          onChange={(e) => setAppliedFrom(e.target.value)}
          sx={{ width: 140, flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>From</Typography>
                </InputAdornment>
              ),
              endAdornment: appliedFrom && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setAppliedFrom('')} sx={{ mr: -0.5 }}>
                    <ClearRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                height: 38, borderRadius: '10px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', fontSize: 13,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' }
              },
            }
          }}
        />

        {/* Until Date */}
        <TextField
          size="small"
          type="date"
          value={appliedUntil}
          onChange={(e) => setAppliedUntil(e.target.value)}
          sx={{ width: 140, flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Until</Typography>
                </InputAdornment>
              ),
              endAdornment: appliedUntil && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setAppliedUntil('')} sx={{ mr: -0.5 }}>
                    <ClearRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                height: 38, borderRadius: '10px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', fontSize: 13,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' }
              },
            }
          }}
        />

        {/* Secondary Filters (Desktop) */}
        {!isTablet && (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                displayEmpty
                sx={{
                  height: 38, borderRadius: '10px', fontSize: 13, fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', 
                  color: jobTypeFilter === 'all' ? 'text.disabled' : 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: 13, color: '#94A3B8' }}>Job Type</MenuItem>
                <MenuItem value="full_time" sx={{ fontSize: 13 }}>Full-time</MenuItem>
                <MenuItem value="part_time" sx={{ fontSize: 13 }}>Part-time</MenuItem>
                <MenuItem value="contract" sx={{ fontSize: 13 }}>Contract</MenuItem>
                <MenuItem value="internship" sx={{ fontSize: 13 }}>Internship</MenuItem>
                <MenuItem value="remote" sx={{ fontSize: 13 }}>Remote</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  height: 38, borderRadius: '10px', fontSize: 13, fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', 
                  color: statusFilter === 'all' ? 'text.disabled' : 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93C5FD' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: 13, color: '#94A3B8' }}>Status</MenuItem>
                <MenuItem value="applied" sx={{ fontSize: 13 }}>Applied</MenuItem>
                <MenuItem value="acknowledged" sx={{ fontSize: 13 }}>Acknowledged</MenuItem>
                <MenuItem value="in_review" sx={{ fontSize: 13 }}>In Review</MenuItem>
                <MenuItem value="interview_scheduled" sx={{ fontSize: 13 }}>Interview Scheduled</MenuItem>
                <MenuItem value="interview_completed" sx={{ fontSize: 13 }}>Interview Completed</MenuItem>
                <MenuItem value="offer_received" sx={{ fontSize: 13 }}>Offer Received</MenuItem>
                <MenuItem value="rejected" sx={{ fontSize: 13 }}>Rejected</MenuItem>
                <MenuItem value="ghosted" sx={{ fontSize: 13 }}>Ghosted</MenuItem>
                <MenuItem value="withdrawn" sx={{ fontSize: 13 }}>Withdrawn</MenuItem>
              </Select>
            </FormControl>

            <DateFilter value={dateRange} onChange={setDateRange} />
          </>
        )}

        {/* More Dropdown (Tablet/Mobile) */}
        {isTablet && (
          <>
            <Button
              variant="text"
              startIcon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
              endIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handleMoreOpen}
              sx={{
                height: 38, px: 2, borderRadius: '10px',
                textTransform: 'none', fontWeight: 700, fontSize: 13,
                color: 'text.secondary', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: '1px solid', borderColor: 'divider',
                '&:hover': { bgcolor: 'background.paper', borderColor: '#CBD5E1' },
              }}
            >
              More
            </Button>
            <Menu
              anchorEl={moreAnchorEl}
              open={Boolean(moreAnchorEl)}
              onClose={handleMoreClose}
              PaperProps={{
                sx: { 
                  mt: 1, p: 1.5, minWidth: 400, borderRadius: 3, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '1px solid', borderColor: 'divider',
                  '& .MuiMenuItem-root': { px: 1, py: 0.5, borderRadius: 1.5 }
                }
              }}
            >
              <Typography variant="overline" sx={{ px: 1, fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    displayEmpty
                    sx={{ height: 34, borderRadius: 2, fontSize: 13 }}
                  >
                    <MenuItem value="all">Job Type: All</MenuItem>
                    <MenuItem value="full_time">Full-time</MenuItem>
                    <MenuItem value="part_time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    sx={{ height: 34, borderRadius: 2, fontSize: 13 }}
                  >
                    <MenuItem value="all">Status: All</MenuItem>
                    <MenuItem value="applied">Applied</MenuItem>
                    <MenuItem value="in_review">In Review</MenuItem>
                    <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ px: 0.5 }}>
                  <DateFilter isInline={true} value={dateRange} onChange={(val) => setDateRange(val)} />
                </Box>
              </Box>
            </Menu>
          </>
        )}

        <Button
          variant="outlined"
          startIcon={<SyncRoundedIcon sx={{ fontSize: 15, animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
          onClick={() => syncMutation.mutate()}
          disabled={isSyncing}
          sx={{
            height: 38, px: 2, borderRadius: '10px', whiteSpace: 'nowrap',
            textTransform: 'none', fontWeight: 700, fontSize: 13,
            borderColor: 'divider', color: 'text.secondary',
            '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: 'rgba(37,99,235,0.08)' },
            '&:disabled': { opacity: 0.5 },
          }}
        >
          {isSyncing ? 'Syncing…' : 'Sync Gmail'}
        </Button>

      </Box>

      {/* ── Kanban Board ── */}
      <Box
        sx={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          alignItems: 'stretch',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 99 },
        }}
      >
        {COLUMNS.map((col) => {
          const colApps = filtered.filter((a) =>
            col.statuses.includes(a.current_status),
          );
          const isHidden = hiddenCols.has(col.id);

          if (isHidden) {
            return (
              <Box
                key={col.id}
                sx={{
                  width: 40,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  pt: 1.5,
                }}
              >
                <Tooltip title={`Show ${col.label}`} placement="right">
                  <IconButton
                    size="small"
                    onClick={() => toggleColumn(col.id)}
                    sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                      color: 'text.disabled',
                      '&:hover': { bgcolor: 'rgba(37,99,235,0.08)', color: '#2563EB', borderColor: '#93C5FD' },
                    }}
                  >
                    <VisibilityRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Typography
                  sx={{
                    fontSize: 10, fontWeight: 800, color: '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    writingMode: 'vertical-rl', textOrientation: 'mixed',
                    mt: 0.5,
                  }}
                >
                  {col.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Box
              key={col.id}
              sx={{
                minWidth: 320,
                width: 320,
                flex: '0 0 320px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'transparent',
              }}
            >
              {/* Column header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.75,
                  gap: 1,
                  bgcolor: 'transparent', // Match lane background
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => toggleColumn(col.id)}
                  sx={{ p: 0.5, color: '#94A3B8', '&:hover': { color: '#64748B', bgcolor: 'rgba(0,0,0,0.05)' } }}
                >
                  <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 900,
                    color: '#64748B', // Grayish header text as in image
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    flex: 1,
                    textAlign: 'center',
                    pr: 3,
                  }}
                >
                  {col.label} ({colApps.length})
                </Typography>
              </Box>

              {/* Cards area */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  p: 2,
                  bgcolor: 'transparent',
                  maxHeight: 'calc(100vh - 200px)',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 99 },
                }}
              >
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        height: 100, borderRadius: 2,
                        bgcolor: '#EFF6FF',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  ))
                ) : colApps.length === 0 ? (
                  <Box
                    sx={{
                      py: 5,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mt: 0.5,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ fontSize: 12, color: '#94A3B8' }}
                    >
                      {col.emptyMsg}
                    </Typography>
                  </Box>
                ) : (
                  <AnimatePresence>
                    {colApps.map((app, idx) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        onClick={() => navigate(`/application-tracker/${app.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Box
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 1.75,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,23,42,0.05)',
                            transition: 'box-shadow 0.18s, border-color 0.18s',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(37,99,235,0.1)',
                              borderColor: '#93C5FD',
                            },
                          }}
                        >
                          {/* Main Row: Logo + Info + Heart */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1.5,
                                flexShrink: 0,
                                bgcolor: getAvatarColor(app.company || ''),
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: 18,
                              }}
                            >
                              {(app.company || '?')[0].toUpperCase()}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  lineHeight: 1.25,
                                  mb: 0.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {app.role || '—'}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 13, fontWeight: 700, color: '#64748B', mb: 0.5 }}
                              >
                                {app.company || 'Unknown'}
                              </Typography>
                              {app.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                                  <Typography
                                    sx={{
                                      fontSize: 11.5, fontWeight: 600, color: '#94A3B8',
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {app.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <FavoriteButton appId={app.id} />
                          </Box>

                          {/* Footer Meta: Date only now to match minimal image style */}
                          {app.applied_date && (
                            <Box
                              sx={{
                                mt: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 0.5,
                              }}
                            >
                              <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#CBD5E1' }} />
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase' }}>
                                {formatDate(app.applied_date)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Chat Widget ── */}
      <ChatWidget />

      {/* ── Sync progress overlay ── */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1400,
              width: 380,
            }}
          >
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 16px 48px rgba(15,23,42,0.12)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ height: 3, bgcolor: '#2563EB' }} />
              <Box sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: '#2563EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <SyncRoundedIcon sx={{ fontSize: 16, color: 'white', animation: 'spin 1s linear infinite' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                        Syncing Gmail
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>
                        {syncStatus?.total_threads || 0} emails found
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => stopMutation.mutate()}
                    disabled={stopMutation.isPending}
                    sx={{
                      minWidth: 0, px: 1.5, py: 0.5, borderRadius: 1.5,
                      bgcolor: 'rgba(239,68,68,0.08)', color: '#DC2626',
                      fontSize: 11, fontWeight: 800, textTransform: 'none',
                      border: '1px solid #FECACA',
                      '&:hover': { bgcolor: '#DC2626', color: 'white', borderColor: '#DC2626' },
                      '&:disabled': { opacity: 0.5 },
                    }}
                  >
                    Stop
                  </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                      Processing…
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#2563EB' }}>
                      {progress}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 5, bgcolor: '#EFF6FF', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      style={{
                        height: '100%',
                        bgcolor: '#2563EB',
                        borderRadius: 99,
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {[
                    { label: 'Scanned', value: syncStatus?.parsed_count ?? 0, bg: '#F8FAFC', color: '#1E293B' },
                    { label: 'Jobs Found', value: syncStatus?.ai_count ?? 0, bg: '#EFF6FF', color: '#2563EB' },
                    {
                      label: 'Remaining',
                      value: Math.max(0, (syncStatus?.total_threads ?? 0) - (syncStatus?.parsed_count ?? 0)),
                      bg: 'rgba(245,158,11,0.08)',
                      color: '#F59E0B',
                    },
                  ].map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{ textAlign: 'center', py: 1.25, borderRadius: 2, bgcolor: stat.bg }}
                    >
                      <Typography sx={{ fontSize: 15, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Application Modal ── */}
      <AddApplicationModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['applications'] })}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input[type="date"].date-placeholder:before {
          content: attr(data-placeholder);
          color: #94A3B8;
          font-weight: 600;
          font-size: 13px;
        }
        input[type="date"].date-placeholder::-webkit-datetime-edit { display: none; }
        input[type="date"].date-placeholder::-webkit-calendar-picker-indicator { opacity: 0.4; }
      `}</style>
    </Box>
  );
}
