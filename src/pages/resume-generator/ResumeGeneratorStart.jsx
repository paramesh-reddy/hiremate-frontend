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
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { listResumesAPI, deleteResumeAPI } from '../../services';
import { BASE_URL } from '../../utilities/const';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

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
        minHeight: '100%',
        width: '100%',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
        display: 'flex',
        flexDirection: 'column',
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
        <PageBreadcrumb
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'New Resume' },
          ]}
        />

        {/* Page header — matches "My Documents" block */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            color: THEME.textPrimary,
            mb: 0.5,
          }}
        >
          Create a new resume
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '0.95rem', mb: 3 }}>
          Start from your profile or base it on an existing resume.
        </Typography>

        {/* Option 1 — Start From Profile */}
        <Box
          onClick={handleStartFromProfile}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 2.5,
            mb: 3,
            bgcolor: '#fff',
            border: `1px solid ${THEME.border}`,
            borderRadius: 2,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': {
              borderColor: 'rgba(51, 94, 222, 0.35)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              '& .profile-arrow': { transform: 'translateX(4px)', color: THEME.primary },
              '& .profile-icon-wrap': { bgcolor: THEME.primarySoft },
            },
          }}
        >
          {/* Icon */}
          <Box
            className="profile-icon-wrap"
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: THEME.primarySoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <PersonOutlineRoundedIcon sx={{ fontSize: 26, color: THEME.primary }} />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.375, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  color: THEME.textPrimary,
                }}
              >
                Start from my profile
              </Typography>
              <Chip
                label="Recommended"
                size="small"
                sx={{
                  height: 20,
                  bgcolor: THEME.primarySoft,
                  color: THEME.primary,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-family)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-family)',
                fontSize: '0.8rem',
                color: THEME.textSecondary,
                lineHeight: 1.45,
              }}
            >
              Pull in your work experience, education, and skills automatically from your profile.
            </Typography>
          </Box>

          <ChevronRightRoundedIcon
            className="profile-arrow"
            sx={{ fontSize: 22, color: THEME.textSecondary, flexShrink: 0, transition: 'all 0.2s', opacity: 0.85 }}
          />
        </Box>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: THEME.border }} />
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: THEME.textSecondary,
              fontFamily: 'var(--font-family)',
              textTransform: 'uppercase',
            }}
          >
            or copy from existing
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: THEME.border }} />
        </Box>

        {/* Option 2 — Existing Resumes (documents panel style) */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            mb: 2,
            pb: 0,
          }}
        >
          {/* Section header */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pt: 2,
              pb: 1.75,
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: THEME.primarySoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 22, color: THEME.primary }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: THEME.textPrimary,
                    lineHeight: 1.25,
                  }}
                >
                  Use an existing resume
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.8rem',
                    color: THEME.textSecondary,
                    lineHeight: 1.45,
                    mt: 0.25,
                  }}
                >
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
                  color: THEME.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-family)',
                }}
              />
            )}
          </Box>

          {/* Search — toolbar row aligned with My Documents table toolbar */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.25,
              bgcolor: '#fff',
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <TextField
              fullWidth
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
                maxWidth: 320,
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  borderRadius: 1,
                  bgcolor: '#fff',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-family)',
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
          </Box>

          {/* Resume list */}
          <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={36} sx={{ color: THEME.primary }} />
              </Box>
            ) : filteredResumes.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: THEME.border, mb: 1 }} />
                <Typography
                  sx={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.875rem',
                    color: THEME.textSecondary,
                    fontWeight: 500,
                  }}
                >
                  {resumes.length === 0 ? 'No generated resumes yet' : 'No results found'}
                </Typography>
                {resumes.length === 0 && (
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.8rem',
                      color: THEME.textSecondary,
                      mt: 0.5,
                      opacity: 0.85,
                    }}
                  >
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
                      px: { xs: 2, sm: 2.5 },
                      py: 1.5,
                      borderBottom:
                        idx < filteredResumes.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                      transition: 'background 0.12s',
                      '&:hover': { bgcolor: '#fafbfc' },
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
                          color: THEME.textPrimary,
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
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-family)',
                              fontSize: '0.72rem',
                              color: THEME.textSecondary,
                            }}
                          >
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
                          color: THEME.textSecondary,
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
                          fontWeight: 600,
                          color: THEME.textSecondary,
                          px: 1.25,
                          borderRadius: 1,
                          '&:hover': { color: THEME.primary, bgcolor: 'transparent' },
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={() => handleSelectResume(r)}
                        sx={{
                          textTransform: 'none',
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: THEME.primary,
                          color: '#fff',
                          borderRadius: 1,
                          height: 36,
                          minHeight: 36,
                          px: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: 'var(--primary-dark, #1d4ed8)',
                            boxShadow: 'none',
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
        <DialogTitle
          sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1.125rem', color: THEME.textPrimary }}
        >
          Delete Resume
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.9375rem', color: THEME.textSecondary, lineHeight: 1.6 }}>
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
              color: THEME.textSecondary,
              px: 2.5,
              py: 0.875,
              borderRadius: 1,
              '&:hover': { bgcolor: '#fafbfc' },
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
