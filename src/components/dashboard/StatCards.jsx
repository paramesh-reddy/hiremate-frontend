import { Box, Card, Grid, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import DomainRoundedIcon from '@mui/icons-material/DomainRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import { APPLIED_STATUSES } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

function MiniSparkline({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const w = 64;
  const h = 32;
  const pts = data.length;
  const points = data
    .map((v, i) => {
      const x = (pts > 1 ? i / (pts - 1) : 1) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} style={{ opacity: 0.7 }}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cardBaseSx = {
  borderRadius: 'var(--dashboard-card-radius)',
  boxShadow: 'var(--dashboard-card-shadow)',
  bgcolor: 'var(--bg-paper)',
  border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: 'var(--dashboard-card-shadow-hover)',
    borderColor: 'rgba(37, 99, 235, 0.18)',
    transform: 'translateY(-2px)',
  },
};

export default function StatCards({ summary, jobs, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 'var(--dashboard-block-gap)' }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} height={120} />
        ))}
      </Box>
    );
  }

  const appliedJobs = (jobs || []).filter((j) => APPLIED_STATUSES.includes(j.application_status));
  const savedJobs = (jobs || []).filter((j) => j.application_status === 'saved');
  const interviewJobs = (jobs || []).filter((j) => j.application_status === 'interview');
  const responseRate =
    appliedJobs.length > 0 ? Math.round((interviewJobs.length / appliedJobs.length) * 100) : 0;

  const applicationsByDay = (summary?.applications_by_day || []).slice(-7);
  const sparkData = applicationsByDay.map((d) => d.count || 0);
  const sparkTrend =
    sparkData.length >= 2 ? Math.round(((sparkData[sparkData.length - 1] - sparkData[0]) / Math.max(1, sparkData[0])) * 100) : 0;

  const cards = [
    {
      icon: SendRoundedIcon,
      label: 'Applied',
      value: summary?.stats?.jobs_applied ?? 0,
      sub: null,
      sparkline: sparkData,
      tone: 'primary',
      trend: sparkData.length ? sparkTrend : 0,
    },
    {
      icon: BookmarkRoundedIcon,
      label: 'Saved',
      value: summary?.stats?.jobs_saved ?? 0,
      sub: savedJobs.length > 5 ? `${savedJobs.length} not yet applied` : null,
      subColor: 'warning',
      sparkline: null,
      tone: 'warning',
      trend: null,
    },
    {
      icon: DomainRoundedIcon,
      label: 'Companies',
      value: summary?.stats?.companies_checked ?? 0,
      sub: null,
      sparkline: null,
      tone: 'neutral',
      trend: null,
    },
    {
      icon: QueryStatsRoundedIcon,
      label: 'Response Rate',
      value: `${responseRate}%`,
      sub:
        interviewJobs.length > 0
          ? `${interviewJobs.length} interview${interviewJobs.length > 1 ? 's' : ''}`
          : 'No interviews yet',
      subColor: interviewJobs.length > 0 ? 'success' : 'text.secondary',
      sparkline: null,
      tone: interviewJobs.length > 0 ? 'success' : 'neutral',
      trend: null,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 'var(--dashboard-block-gap)' }}>
      {cards.map((card) => (
        <Card key={card.label} sx={cardBaseSx}>
          <Grid container sx={{ px: 'var(--dashboard-card-px)', py: 'var(--dashboard-card-py)', '&:last-child': { pb: 'var(--dashboard-card-py)' } }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                  {(() => {
                    const Icon = card.icon;
                    const iconColor =
                      card.tone === 'success'
                        ? 'var(--success-dark)'
                        : card.tone === 'warning'
                          ? 'var(--warning)'
                          : card.tone === 'primary'
                            ? 'var(--primary)'
                            : 'var(--text-secondary)';
                    return (
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor:
                            card.tone === 'success'
                              ? 'rgba(34, 197, 94, 0.08)'
                              : card.tone === 'warning'
                                ? 'rgba(245, 158, 11, 0.08)'
                                : card.tone === 'primary'
                                  ? 'rgba(37, 99, 235, 0.08)'
                                  : 'rgba(16, 24, 40, 0.04)',
                          border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 18, color: iconColor }} />
                      </Box>
                    );
                  })()}
                  <Typography
                    sx={{
                      color: 'var(--text-secondary)',
                      opacity: 0.9,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontSize: 'var(--dashboard-section-label)',
                      lineHeight: 1,
                    }}
                  >
                    {card.label}
                  </Typography>
                  {typeof card.trend === 'number' && card.sparkline?.length > 1 && (
                    <Box
                      sx={{
                        ml: 'auto',
                        px: 1,
                        py: 0.375,
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1,
                        color: card.trend >= 0 ? 'var(--success-dark)' : 'var(--text-secondary)',
                        bgcolor: card.trend >= 0 ? 'rgba(34, 197, 94, 0.10)' : 'rgba(16, 24, 40, 0.04)',
                        border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '28px',
                    lineHeight: 1.1,
                    letterSpacing: -0.4,
                    mt: 'var(--dashboard-label-gap)',
                  }}
                >
                  {card.value}
                </Typography>
                {card.sub && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: 'block',
                      color:
                        card.subColor === 'warning'
                          ? 'var(--warning)'
                          : card.subColor === 'success'
                            ? 'var(--success)'
                            : 'var(--text-muted)',
                      fontWeight: 500,
                      fontSize: '13px',
                    }}
                  >
                    {card.sub}
                  </Typography>
                )}
              </Box>
              {card.sparkline?.length > 0 && (
                <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                  <MiniSparkline data={card.sparkline} />
                </Box>
              )}
            </Box>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Box>
  );
}
