import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { RESUME_STUDIO_THEME as THEME } from '../../utilities/resumeStudioTheme';

const STATUS_COLORS = {
  pending: { bg: 'rgba(234,179,8,0.1)', color: '#b45309', border: 'rgba(234,179,8,0.3)' },
  done:    { bg: 'rgba(16,185,129,0.1)', color: '#047857', border: 'rgba(16,185,129,0.3)' },
  error:   { bg: 'rgba(239,68,68,0.1)',  color: '#b91c1c', border: 'rgba(239,68,68,0.3)' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontFamily: 'var(--font-family)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        bgcolor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        height: 20,
      }}
    />
  );
}

function JobCard({ job }) {
  return (
    <Box
      sx={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 2,
        p: 1.5,
        mb: 1,
        bgcolor: THEME.surface,
        '&:last-child': { mb: 0 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: THEME.textPrimary }}>
            {job.title}
          </Typography>
          {job.location && (
            <Typography sx={{ fontSize: '0.8rem', color: THEME.textSecondary, mt: 0.25 }}>
              {job.location}
            </Typography>
          )}
          {job.snippet && (
            <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary, mt: 0.5, lineHeight: 1.5 }}>
              {job.snippet}
            </Typography>
          )}
        </Box>
        {job.url && (
          <Button
            component="a"
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              fontSize: '0.8125rem',
              textTransform: 'none',
              fontWeight: 600,
              flexShrink: 0,
              borderRadius: 1,
              color: THEME.primary,
              borderColor: 'rgba(51, 94, 222, 0.35)',
              '&:hover': { borderColor: THEME.primary, bgcolor: THEME.primarySoft },
            }}
          >
            View
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default function JobResultsList({ events = [] }) {
  // Most recently updated company is the last one that arrived
  const latestCompany = events.length > 0 ? events[events.length - 1].company : null;

  return (
    <Box>
      {events.map((event) => {
        const expanded = event.company === latestCompany;
        return (
          <Accordion
            key={event.company}
            defaultExpanded={expanded}
            disableGutters
            sx={{
              mb: 1,
              border: `1px solid ${THEME.border}`,
              borderRadius: '10px !important',
              boxShadow: 'none',
              bgcolor: THEME.surface,
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: '0 0 8px 0' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon sx={{ color: THEME.textSecondary }} />}
              sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 0 } }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: THEME.textPrimary, flex: 1 }}>
                {event.company}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>
                {event.jobs.length} role{event.jobs.length !== 1 ? 's' : ''}
              </Typography>
              <StatusBadge status={event.status} />
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
              {event.status === 'pending' && (
                <LinearProgress
                  sx={{
                    borderRadius: 1,
                    mb: 1.5,
                    height: 3,
                    bgcolor: 'rgba(51, 94, 222, 0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: THEME.primary },
                  }}
                />
              )}
              {event.status === 'error' && event.message && (
                <Typography sx={{ fontSize: '0.8125rem', color: '#b91c1c', fontFamily: 'var(--font-family)', mb: 1 }}>
                  {event.message}
                </Typography>
              )}
              {event.jobs.length > 0
                ? event.jobs.map((job, i) => <JobCard key={i} job={job} />)
                : event.status === 'done' && (
                    <Typography sx={{ fontSize: '0.8125rem', color: THEME.textSecondary }}>
                      No matching roles found.
                    </Typography>
                  )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
