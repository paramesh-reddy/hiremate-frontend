import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  InputAdornment,
  TextField,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { listResumesAPI, deleteResumeAPI } from '../../services';
import { BASE_URL } from '../../utilities/const';

const RESUME_GEN_STORAGE_KEY = 'resumeGeneratorView';
const RESUME_GEN_SELECTED_KEY = 'resumeGeneratorSelectedId';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ResumeInitials(name = '') {
  return (name || '').split(/[_\s]+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || 'R';
}

const AVATAR_COLORS = [
  ['#dbeafe', '#2563eb'],
  ['#ede9fe', '#7c3aed'],
  ['#dcfce7', '#16a34a'],
  ['#fef3c7', '#d97706'],
  ['#fce7f3', '#be185d'],
];

export default function ResumeGeneratorStart() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    listResumesAPI()
      .then(({ data }) => setResumes(Array.isArray(data) ? data : []))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredResumes = resumes.filter((r) =>
    (r.resume_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStartFromProfile = () => {
    try {
      localStorage.removeItem(RESUME_GEN_SELECTED_KEY);
      localStorage.setItem(RESUME_GEN_STORAGE_KEY, 'inputs');
    } catch { /* ignore */ }
    navigate('/resume-generator/build');
  };

  const handleSelectResume = (resume) => {
    try {
      localStorage.setItem(RESUME_GEN_SELECTED_KEY, String(resume.id));
      localStorage.setItem(RESUME_GEN_STORAGE_KEY, 'preview');
    } catch { /* ignore */ }
    // Pass resume_id explicitly so the editor doesn't have to guess
    navigate(`/resume-generator/build?resume_id=${resume.id}`);
  };

  const handleViewResume = async (e, resume) => {
    e.stopPropagation();
    const url = `${BASE_URL}/resume/${resume.id}/file`;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to load');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch { /* ignore */ }
  };

  const handleDeleteClick = (e, resume) => {
    e.stopPropagation();
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;
    setDeleting(true);
    try {
      await deleteResumeAPI(resumeToDelete.id);
      setResumes((prev) => prev.filter((r) => r.id !== resumeToDelete.id));
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    } catch (err) {
      console.error('Failed to delete resume:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        fontFamily: 'var(--font-family)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/ai-resume-studio')}
          size="small"
          sx={{
            textTransform: 'none',
            fontFamily: 'var(--font-family)',
            fontWeight: 500,
            color: '#6b7280',
            fontSize: '0.875rem',
            '&:hover': { color: 'var(--primary)', bgcolor: 'transparent' },
          }}
        >
          AI Resume Studio
        </Button>
        <ChevronRightRoundedIcon sx={{ fontSize: 14, color: '#d1d5db' }} />
        <Typography sx={{ fontSize: '0.875rem', color: '#374151', fontFamily: 'var(--font-family)', fontWeight: 500 }}>
          New Resume
        </Typography>
      </Box>

      {/* Page content */}
      <Box sx={{ flex: 1, maxWidth: 860, width: '100%', mx: 'auto', px: 3, pt: 5, pb: 10 }}>

        {/* Page header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              color: '#0f172a',
              letterSpacing: '-0.02em',
              mb: 0.75,
            }}
          >
            Create a new resume
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-family)',
              fontSize: '1rem',
              color: '#64748b',
              fontWeight: 400,
            }}
          >
            Start from your profile or base it on an existing resume.
          </Typography>
        </Box>

        {/* Option 1 — Start From Profile */}
        <Box
          onClick={handleStartFromProfile}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 3,
            mb: 2.5,
            bgcolor: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.18s',
            '&:hover': {
              borderColor: 'var(--primary)',
              boxShadow: '0 0 0 4px rgba(37,99,235,0.06)',
              '& .profile-arrow': { transform: 'translateX(4px)', color: 'var(--primary)' },
              '& .profile-icon-wrap': { bgcolor: 'rgba(37,99,235,0.1)' },
            },
          }}
        >
          {/* Icon */}
          <Box
            className="profile-icon-wrap"
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: 'rgba(37,99,235,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.18s',
            }}
          >
            <PersonOutlineRoundedIcon sx={{ fontSize: 26, color: 'var(--primary)' }} />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375 }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                Start from my profile
              </Typography>
              <Chip
                label="Recommended"
                size="small"
                sx={{
                  height: 20,
                  bgcolor: 'rgba(37,99,235,0.08)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-family)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
              Pull in your work experience, education, and skills automatically from your profile.
            </Typography>
          </Box>

          <ChevronRightRoundedIcon
            className="profile-arrow"
            sx={{ fontSize: 22, color: '#9ca3af', flexShrink: 0, transition: 'all 0.18s' }}
          />
        </Box>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e7eb' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'var(--font-family)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            or copy from existing
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: '#e5e7eb' }} />
        </Box>

        {/* Option 2 — Existing Resumes */}
        <Box
          sx={{
            bgcolor: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <Box
            sx={{
              px: 3,
              pt: 2.5,
              pb: 2,
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(124,58,237,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 17, color: '#7c3aed' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', lineHeight: 1.2 }}>
                  Use an existing resume
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.2 }}>
                  Only generated resumes appear here
                </Typography>
              </Box>
            </Box>
            {!loading && resumes.length > 0 && (
              <Chip
                label={`${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: '#f1f5f9',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-family)',
                }}
              />
            )}
          </Box>

          {/* Search */}
          <Box sx={{ px: 3, py: 1.75, borderBottom: '1px solid #f8fafc' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: {
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                },
              }}
            />
          </Box>

          {/* Resume list */}
          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={22} sx={{ color: 'var(--primary)' }} />
              </Box>
            ) : filteredResumes.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
                  {resumes.length === 0 ? 'No generated resumes yet' : 'No results found'}
                </Typography>
                {resumes.length === 0 && (
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.8rem', color: '#cbd5e1', mt: 0.5 }}>
                    Generate your first resume using "Start from my profile" above
                  </Typography>
                )}
              </Box>
            ) : (
              filteredResumes.map((r, idx) => {
                const [bgColor, textColor] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const initials = ResumeInitials(r.resume_name);
                const date = formatDate(r.updated_at || r.created_at);
                return (
                  <Box
                    key={r.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 3,
                      py: 1.75,
                      borderBottom: idx < filteredResumes.length - 1 ? '1px solid #f8fafc' : 'none',
                      transition: 'background 0.12s',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: bgColor,
                        color: textColor,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-family)',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: 'var(--font-family)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#0f172a',
                          lineHeight: 1.3,
                        }}
                      >
                        {r.resume_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                        <Chip
                          label="Generated"
                          size="small"
                          sx={{
                            height: 17,
                            bgcolor: '#ecfdf5',
                            color: '#059669',
                            fontWeight: 700,
                            fontSize: '0.6rem',
                            fontFamily: 'var(--font-family)',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                        {date && (
                          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.72rem', color: '#94a3b8' }}>
                            {date}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteClick(e, r)}
                        sx={{
                          color: '#94a3b8',
                          '&:hover': {
                            color: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.06)',
                          },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={(e) => handleViewResume(e, r)}
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          textTransform: 'none',
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: '#64748b',
                          px: 1.25,
                          '&:hover': { color: 'var(--primary)', bgcolor: 'transparent' },
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSelectResume(r)}
                        sx={{
                          textTransform: 'none',
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: '#0f172a',
                          color: 'white',
                          borderRadius: '8px',
                          px: 1.75,
                          py: 0.625,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#1e293b',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        Select →
                      </Button>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'var(--font-family)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
          Delete Resume
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
            Are you sure you want to delete "{resumeToDelete?.resume_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{
              textTransform: 'none',
              fontFamily: 'var(--font-family)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              px: 2.5,
              py: 0.875,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontFamily: 'var(--font-family)',
              fontSize: '0.875rem',
              fontWeight: 600,
              bgcolor: '#ef4444',
              color: 'white',
              px: 2.5,
              py: 0.875,
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#dc2626',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
              },
              '&:disabled': {
                bgcolor: '#fca5a5',
                color: 'white',
              },
            }}
          >
            {deleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
