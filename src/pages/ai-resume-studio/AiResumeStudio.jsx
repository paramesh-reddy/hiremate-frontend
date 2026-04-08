import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  OutlinedInput,
} from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  listResumesAPI,
  deleteResumeAPI,
  uploadResumeAPI,
  renameResumeAPI,
} from '../../services';
import { BASE_URL } from '../../utilities/const';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

/** Original AI Resume Studio tools — all fields except `features` are shown on each card. */
const TOOLS = [
  {
    route: '/resume-generator',
    icon: AutoAwesomeRoundedIcon,
    category: 'AI-Powered',
    title: 'Resume Generator',
    subtitle: 'Build a tailored, job-winning resume in seconds',
    cta: 'Build My Resume',
    accent: false,
  },
  {
    route: '/job-scan',
    icon: TrackChangesRoundedIcon,
    category: 'ATS Analysis',
    title: 'ATS Scanner',
    subtitle: 'Know your ATS score before you apply',
    cta: 'Scan My Resume',
    accent: true,
  },
  {
    route: '/resume-analyzer',
    icon: InsightsRoundedIcon,
    category: 'Deep Analysis',
    title: 'Resume Scan',
    subtitle: 'Get deep AI insights on your resume quality',
    cta: 'Analyze Resume',
    accent: false,
  },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'default', label: 'Default' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'generated', label: 'Generated' },
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function sourceLabel(source) {
  const map = {
    uploaded: 'Uploaded',
    generated: 'Generated',
    generator: 'Generator',
    default: 'Default',
  };
  return map[source] || source || '—';
}

function passesFilter(row, filter) {
  if (filter === 'all') return true;
  if (filter === 'default') return Boolean(row.is_default);
  if (filter === 'uploaded') return row.resume_source === 'uploaded';
  if (filter === 'generated') {
    return row.resume_source === 'generated' || row.resume_source === 'generator';
  }
  return true;
}

export default function AiResumeStudio() {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [renameBusy, setRenameBusy] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const loadResumes = useCallback(async () => {
    setListError(null);
    setListLoading(true);
    try {
      const { data } = await listResumesAPI();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(e?.response?.data?.detail || e?.message || 'Failed to load resumes.');
      setDocuments([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  useEffect(() => {
    const onSaved = () => loadResumes();
    window.addEventListener('HIREMATE_RESUME_SAVED', onSaved);
    return () => window.removeEventListener('HIREMATE_RESUME_SAVED', onSaved);
  }, [loadResumes]);

  const filteredRows = useMemo(() => {
    return documents.filter((row) => {
      if (!passesFilter(row, filter)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const name = (row.resume_name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [documents, filter, search]);

  const allVisibleSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.id));
  const someVisibleSelected = filteredRows.some((r) => selected.has(r.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteByIds = async (ids) => {
    if (!ids.length) return;
    setDeleteBusy(true);
    try {
      await Promise.all(ids.map((id) => deleteResumeAPI(id)));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      await loadResumes();
    } catch (e) {
      setListError(e?.response?.data?.detail || e?.message || 'Delete failed.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleBulkDelete = () => {
    deleteByIds([...selected]);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
  };

  const openRename = (row) => {
    setRenameTargetId(row.id);
    setRenameValue(row.resume_name || '');
    setRenameOpen(true);
    closeMenu();
  };

  const confirmRename = async () => {
    const name = renameValue.trim();
    if (!name || renameTargetId == null) return;
    setRenameBusy(true);
    try {
      await renameResumeAPI(renameTargetId, name);
      setRenameOpen(false);
      setRenameTargetId(null);
      await loadResumes();
    } catch (e) {
      setListError(e?.response?.data?.detail || e?.message || 'Rename failed.');
    } finally {
      setRenameBusy(false);
    }
  };

  const handleUploadClick = () => uploadInputRef.current?.click();

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadBusy(true);
    setListError(null);
    try {
      await uploadResumeAPI(file);
      await loadResumes();
    } catch (err) {
      setListError(err?.response?.data?.detail || err?.message || 'Upload failed.');
    } finally {
      setUploadBusy(false);
    }
  };

  const openPdf = async (row) => {
    if (row.resume_url) {
      window.open(row.resume_url, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/resume/${row.id}/file`, { headers });
      if (!res.ok) throw new Error('Failed to load PDF');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      setListError('Could not open PDF.');
    }
    closeMenu();
  };

  const goEdit = (id) => {
    navigate(`/resume-generator/build?resume_id=${id}`);
    closeMenu();
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
        pb: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 0,
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: { xs: 3, sm: 4 },
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            color: THEME.textPrimary,
            mb: 0.5,
          }}
        >
          My Documents
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '0.95rem', mb: 2 }}>
          Manage and tailor all of your job search documents here!
        </Typography>

        {listError && (
          <Alert severity="error" onClose={() => setListError(null)} sx={{ mb: 2 }}>
            {listError}
          </Alert>
        )}

        <input
          ref={uploadInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          hidden
          onChange={handleUploadFile}
        />

        {/* Action cards — horizontal row, image 3 style */}
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: THEME.textPrimary, mb: 1.5 }}>
          Choose Your Tool
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.route}
                onClick={() => navigate(tool.route)}
                elevation={0}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  pt: tool.accent ? 2.5 : 2,
                  borderRadius: 2,
                  border: tool.accent
                    ? '1.5px solid rgba(51, 94, 222, 0.28)'
                    : `1px solid ${THEME.border}`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  bgcolor: '#fff',
                  boxShadow: tool.accent ? '0 4px 20px rgba(51, 94, 222, 0.1)' : 'none',
                  overflow: 'visible',
                  '&:hover': {
                    boxShadow: tool.accent
                      ? '0 8px 28px rgba(51, 94, 222, 0.16)'
                      : '0 4px 16px rgba(0, 0, 0, 0.08)',
                    borderColor: 'rgba(51, 94, 222, 0.4)',
                  },
                }}
              >

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: tool.accent ? THEME.primary : THEME.primarySoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 24, color: tool.accent ? '#fff' : THEME.primary }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        color: THEME.primary,
                        textTransform: 'uppercase',
                        mb: 0.35,
                      }}
                    >
                      {tool.category}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: THEME.textPrimary,
                        fontSize: '0.98rem',
                        lineHeight: 1.25,
                        mb: 0.5,
                      }}
                    >
                      {tool.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: THEME.textSecondary,
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {tool.subtitle}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(tool.route);
                    }}
                    sx={{ color: THEME.primary, p: 0.5, mt: -0.25 }}
                    aria-label={`Open ${tool.title}`}
                  >
                    <AddRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                <Button
                  fullWidth
                  variant={tool.accent ? 'contained' : 'outlined'}
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '16px !important' }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tool.route);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: 1.5,
                    py: 0.85,
                    ...(tool.accent
                      ? {
                          bgcolor: THEME.primary,
                          color: '#fff',
                          '&:hover': { bgcolor: 'var(--primary-dark, #2a4bc4)' },
                        }
                      : {
                          color: THEME.primary,
                          borderColor: THEME.primary,
                          '&:hover': { bgcolor: THEME.primarySoft },
                        }),
                  }}
                >
                  {tool.cta}
                </Button>
              </Card>
            );
          })}
        </Box>

        {/* Tabs + documents panel */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            mb: 2,
            pb: 2,
          }}
        >
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1, borderBottom: `1px solid ${THEME.border}` }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: THEME.textSecondary,
              },
              '& .Mui-selected': { color: `${THEME.primary} !important` },
              '& .MuiTabs-indicator': { bgcolor: THEME.primary, height: 3 },
            }}
          >
            <Tab
              icon={<DescriptionRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Resumes"
            />
          </Tabs>
        </Box>

        {/* Data grid: toolbar + table are full width of card */}
        <TableContainer
          sx={{
            overflow: 'auto',
            position: 'relative',
            minHeight: listLoading ? 220 : undefined,
            bgcolor: '#fff',
          }}
        >
          {listLoading && (
            <Box
              aria-busy="true"
              aria-live="polite"
              aria-label="Loading documents"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(4px)',
                /* Sticky thead cells use z-index: 2 (MUI) — stay above toolbar + header row */
                zIndex: 10,
              }}
            >
              <CircularProgress size={40} thickness={4} sx={{ color: THEME.primary }} />
            </Box>
          )}

          {/* Toolbar — single flat row, fixed control height, external Source label (no floating-label overlap) */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.25,
              bgcolor: '#fff',
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              spacing={1.25}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: THEME.textSecondary,
                    minWidth: 'fit-content',
                  }}
                >
                  {selected.size} selected
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={selected.size === 0 || deleteBusy}
                  onClick={handleBulkDelete}
                  sx={{
                    height: 36,
                    minHeight: 36,
                    px: 1.75,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    borderColor: selected.size === 0 ? 'rgba(15, 23, 42, 0.12)' : 'rgba(211, 47, 47, 0.35)',
                    color: selected.size === 0 ? 'action.disabled' : 'error.main',
                    bgcolor: 'transparent',
                    '&:hover': {
                      borderColor: selected.size === 0 ? undefined : 'error.main',
                      bgcolor: selected.size === 0 ? undefined : 'rgba(211, 47, 47, 0.06)',
                    },
                  }}
                >
                  {deleteBusy ? 'Deleting…' : 'Delete'}
                </Button>
              </Stack>

                <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1.25}
                flexWrap="wrap"
                sx={{ justifyContent: { md: 'flex-end' } }}
              >
                <Button
                  variant="contained"
                  disableElevation
                  disabled={uploadBusy}
                  onClick={handleUploadClick}
                  startIcon={
                    uploadBusy ? <CircularProgress size={14} color="inherit" /> : <UploadFileRoundedIcon sx={{ fontSize: 18 }} />
                  }
                  sx={{
                    height: 36,
                    minHeight: 36,
                    px: 2,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    bgcolor: THEME.primary,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'var(--primary-dark, #2a4bc4)', boxShadow: 'none' },
                  }}
                >
                  Upload
                </Button>

                <Divider
                  orientation="vertical"
                  sx={{ display: { xs: 'none', sm: 'block' }, height: 20, alignSelf: 'center', borderColor: THEME.border }}
                />

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{ minWidth: 0 }}
                >
                  <Typography
                    component="label"
                    htmlFor="resume-source-filter"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: THEME.textSecondary,
                      whiteSpace: 'nowrap',
                      lineHeight: '36px',
                    }}
                  >
                    Source
                  </Typography>
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: { xs: '100%', sm: 152 },
                      maxWidth: 200,
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        py: 0,
                      },
                    }}
                  >
                    <Select
                      id="resume-source-filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      displayEmpty
                      input={
                        <OutlinedInput
                          notched={false}
                          startAdornment={
                            <InputAdornment position="start">
                              <TuneRoundedIcon sx={{ fontSize: 17, color: 'action.active' }} />
                            </InputAdornment>
                          }
                          sx={{
                            height: 36,
                            borderRadius: 1,
                            bgcolor: '#fff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(15, 23, 42, 0.12)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(51, 94, 222, 0.35)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderWidth: 1,
                              borderColor: THEME.primary,
                            },
                          }}
                        />
                      }
                      renderValue={(v) => FILTER_OPTIONS.find((o) => o.value === v)?.label ?? 'All'}
                      MenuProps={{
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                        PaperProps: {
                          elevation: 3,
                          sx: {
                            borderRadius: 1,
                            mt: 0.5,
                            minWidth: 200,
                            border: `1px solid ${THEME.border}`,
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
                          },
                        },
                      }}
                      inputProps={{ 'aria-label': 'Filter resumes by source' }}
                    >
                      {FILTER_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value} dense sx={{ fontSize: '0.8125rem', py: 1 }}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <TextField
                  id="resume-search"
                  size="small"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  hiddenLabel
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: THEME.textSecondary, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: '100%', sm: 260 },
                    flex: { sm: '1 1 220px' },
                    maxWidth: { sm: 320 },
                    '& .MuiOutlinedInput-root': {
                      height: 36,
                      borderRadius: 1,
                      bgcolor: '#fff',
                      fontSize: '0.8125rem',
                      pl: 0.5,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.12)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(51, 94, 222, 0.35)',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 1,
                      borderColor: THEME.primary,
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          <Table
            stickyHeader
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& .MuiTableCell-root': {
                borderColor: 'rgba(0,0,0,0.06)',
                verticalAlign: 'middle',
              },
              '& .MuiTableCell-head': {
                py: 1.25,
                px: 2,
                lineHeight: 1.25,
              },
              '& .MuiTableCell-body': {
                py: 1.125,
                px: 2,
              },
              '& .MuiTableCell-paddingCheckbox': {
                px: 1,
              },
            }}
          >
            <colgroup>
              <col style={{ width: 44 }} />
              <col />
              <col style={{ width: 156 }} />
              <col style={{ width: 156 }} />
              <col style={{ width: 132 }} />
            </colgroup>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: THEME.textSecondary,
                    bgcolor: '#f1f5f9',
                    borderBottom: `1px solid ${THEME.border}`,
                    textAlign: 'left',
                  },
                }}
              >
                <TableCell padding="checkbox" sx={{ width: 44 }}>
                  <Checkbox
                    size="small"
                    indeterminate={someVisibleSelected && !allVisibleSelected}
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    sx={{ p: 0.5, color: THEME.primary, '&.Mui-checked': { color: THEME.primary } }}
                  />
                </TableCell>
                <TableCell>Resume name</TableCell>
                <TableCell align="right" sx={{ textAlign: 'right' }}>
                  Created
                </TableCell>
                <TableCell align="right" sx={{ textAlign: 'right' }}>
                  Last edited
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading ? null : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6, border: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.25,
                        textAlign: 'center',
                        maxWidth: 360,
                        mx: 'auto',
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: 'rgba(51, 94, 222, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FolderOpenRoundedIcon sx={{ fontSize: 28, color: THEME.primary, opacity: 0.9 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: THEME.textPrimary }}>
                        No resumes yet
                      </Typography>
                      <Typography sx={{ color: THEME.textSecondary, fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {search.trim() || filter !== 'all'
                          ? 'No resumes match your filters. Try adjusting search or filter.'
                          : 'Upload a PDF or use the Resume Generator to create your first document.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      transition: 'background-color 0.15s ease',
                      '&:nth-of-type(even)': { bgcolor: 'rgba(248, 250, 252, 0.85)' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ width: 44 }}>
                      <Checkbox
                        size="small"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        sx={{ p: 0.5, color: THEME.primary, '&.Mui-checked': { color: THEME.primary } }}
                      />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <DescriptionRoundedIcon sx={{ fontSize: 18, color: THEME.primary, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            noWrap
                            title={row.resume_name || 'Untitled'}
                            sx={{ fontWeight: 600, fontSize: '0.8125rem', color: THEME.textPrimary, lineHeight: 1.3 }}
                          >
                            {row.resume_name || 'Untitled'}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mt: 0.35 }}>
                            <Chip
                              label={sourceLabel(row.resume_source)}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: THEME.primarySoft,
                                color: THEME.primary,
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                            {row.is_default && (
                              <Chip
                                label="Default"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  bgcolor: 'rgba(34, 197, 94, 0.12)',
                                  color: 'success.dark',
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: THEME.textSecondary,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: THEME.textSecondary,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {formatDate(row.updated_at)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button
                        size="small"
                        startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => goEdit(row.id)}
                        sx={{
                          textTransform: 'none',
                          color: THEME.primary,
                          fontWeight: 600,
                          minWidth: 0,
                          py: 0.25,
                          px: 0.75,
                          fontSize: '0.8125rem',
                          mr: 0.25,
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setMenuRowId(row.id);
                        }}
                        aria-label="More actions"
                        sx={{ p: 0.5 }}
                      >
                        <MoreVertRoundedIcon sx={{ fontSize: 18, color: THEME.textSecondary }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              const row = documents.find((d) => d.id === menuRowId);
              if (row) goEdit(row.id);
            }}
          >
            <EditRoundedIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              const row = documents.find((d) => d.id === menuRowId);
              if (row) openRename(row);
            }}
          >
            <DriveFileRenameOutlineIcon sx={{ mr: 1, fontSize: 20 }} /> Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              const row = documents.find((d) => d.id === menuRowId);
              if (row) openPdf(row);
            }}
          >
            <PictureAsPdfOutlinedIcon sx={{ mr: 1, fontSize: 20 }} /> Download PDF
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (menuRowId != null) deleteByIds([menuRowId]);
              closeMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineRoundedIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
          </MenuItem>
        </Menu>

        <Dialog open={renameOpen} onClose={() => !renameBusy && setRenameOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Rename resume</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Resume name"
              fullWidth
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameOpen(false)} disabled={renameBusy}>
              Cancel
            </Button>
            <Button variant="contained" onClick={confirmRename} disabled={renameBusy || !renameValue.trim()}>
              {renameBusy ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
