import { Box, Button, Chip, Pagination, Skeleton, Typography } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

function companyInitials(name) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function CorpusJobCard({ job }) {
  const snippet =
    job.description && job.description.length > 220
      ? `${job.description.slice(0, 220)}…`
      : job.description || '';
  const posted = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const initials = companyInitials(job.company);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        border: `1px solid ${THEME.border}`,
        borderRadius: 2,
        p: 2,
        bgcolor: THEME.surface,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: 'transparent',
          borderRadius: '2px 0 0 2px',
          transition: 'background-color 0.2s ease',
        },
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          borderColor: 'rgba(51, 94, 222, 0.22)',
          '&::before': { bgcolor: THEME.primary },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.25 }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(145deg, ${THEME.primarySoft} 0%, rgba(51, 94, 222, 0.12) 100%)`,
              border: `1px solid rgba(51, 94, 222, 0.12)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontWeight: 800,
              fontSize: '0.8rem',
              color: THEME.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: THEME.textPrimary,
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}
            >
              {job.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: THEME.textSecondary,
                fontWeight: 600,
                mt: 0.35,
              }}
            >
              {job.company}
            </Typography>
          </Box>
        </Box>
        {job.url && (
          <Button
            component="a"
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="contained"
            disableElevation
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              height: 34,
              px: 1.5,
              flexShrink: 0,
              borderRadius: 1,
              bgcolor: THEME.primary,
              boxShadow: 'none',
              '&:hover': { bgcolor: THEME.primaryDark, boxShadow: 'none' },
            }}
          >
            Apply
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          mb: snippet ? 1.25 : 0,
          pl: { xs: 0, sm: 7.75 },
        }}
      >
        {job.location && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
            <PlaceOutlinedIcon sx={{ fontSize: 15, color: THEME.textSecondary, opacity: 0.85 }} />
            <Typography sx={{ fontSize: '0.78rem', color: THEME.textSecondary, fontWeight: 500 }}>
              {job.location}
            </Typography>
          </Box>
        )}
        {job.remote && (
          <Chip
            label="Remote"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(34, 197, 94, 0.12)',
              color: 'success.dark',
            }}
          />
        )}
        {posted && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
            <ScheduleRoundedIcon sx={{ fontSize: 15, color: THEME.textSecondary, opacity: 0.85 }} />
            <Typography sx={{ fontSize: '0.75rem', color: THEME.textSecondary, fontWeight: 500 }}>
              Posted {posted}
            </Typography>
          </Box>
        )}
        {job.source && (
          <Chip
            label={job.source}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.65rem',
              fontWeight: 600,
              borderColor: THEME.border,
              color: THEME.textSecondary,
            }}
          />
        )}
      </Box>

      {snippet && (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: THEME.textSecondary,
            lineHeight: 1.6,
            pl: { xs: 0, sm: 7.75 },
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {snippet}
        </Typography>
      )}
    </Box>
  );
}

export default function CorpusJobList({
  jobs,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onClearFilters,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const gridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
    gap: 2,
    alignItems: 'stretch',
  };

  if (loading && (!jobs || jobs.length === 0)) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={168} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          py: { xs: 5, sm: 7 },
          px: 2,
          textAlign: 'center',
          borderRadius: 2,
          border: `1px dashed ${THEME.border}`,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(51, 94, 222, 0.09) 0%, ${THEME.previewCanvas} 55%, ${THEME.surface} 100%)`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            backgroundImage: 'radial-gradient(rgba(51, 94, 222, 0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              mx: 'auto',
              mb: 2,
              bgcolor: THEME.surface,
              border: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)',
            }}
          >
            <SearchOffRoundedIcon sx={{ fontSize: 36, color: THEME.primary, opacity: 0.9 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: THEME.textPrimary, mb: 1 }}>
            No roles match your filters
          </Typography>
          <Typography
            sx={{
              color: THEME.textSecondary,
              fontSize: '0.9rem',
              lineHeight: 1.6,
              maxWidth: 400,
              mx: 'auto',
              mb: onClearFilters ? 2.5 : 0,
            }}
          >
            Try a broader search term, remove skills one at a time, or clear the posted date range to see more
            listings from our corpus.
          </Typography>
          {onClearFilters && (
            <Button
              variant="outlined"
              onClick={onClearFilters}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                px: 2.5,
                borderColor: THEME.mutedBorder,
                color: THEME.primary,
                '&:hover': { borderColor: THEME.primary, bgcolor: THEME.primarySoft },
              }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
          pb: 1.5,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkOutlineRoundedIcon sx={{ fontSize: 20, color: THEME.primary }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: THEME.textPrimary }}>
            {total} role{total !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: THEME.textSecondary,
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Showing {start}–{end} of {total}
        </Typography>
      </Box>

      <Box sx={gridSx}>
        {jobs.map((job) => (
          <CorpusJobCard key={job.id} job={job} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            shape="rounded"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': { fontWeight: 600, fontSize: '0.875rem' },
              '& .Mui-selected': {
                bgcolor: `${THEME.primarySoft} !important`,
                color: `${THEME.primary} !important`,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
