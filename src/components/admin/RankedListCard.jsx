import { Box, Typography, LinearProgress } from '@mui/material';

export default function RankedListCard({ title, items = [], maxItems = 5 }) {
  const list = items.slice(0, maxItems);
  const maxCount = Math.max(
    ...list.map((i) => (i.count ?? i.unique_users ?? i.visit_count ?? i.sample_count ?? 0)),
    1
  );

  return (
    <Box
      sx={{
        borderRadius: '12px',
        p: 3,
        height: '100%',
        boxShadow: 'var(--dashboard-card-shadow)',
        border: '1px solid var(--border-color)',
        bgcolor: 'var(--bg-paper)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 'var(--dashboard-card-shadow-hover)' },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          pb: 2,
          mb: 2,
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
      </Box>

      {list.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>
          No data available
        </Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {list.map((item, idx) => {
            const count = item.count ?? item.unique_users ?? item.visit_count ?? item.sample_count ?? 0;
            const label = item.company_name ?? item.page_url ?? item.domain ?? item.ats_platform ?? '—';
            const pct = (count / maxCount) * 100;
            return (
              <Box
                component="li"
                key={(label || idx) + idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: '1px solid var(--divider)',
                  '&:last-of-type': { borderBottom: 'none', pb: 0 },
                }}
              >
                {/* Rank badge */}
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: idx === 0 ? 'var(--light-blue-bg-15)' : 'var(--grey-4)',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)',
                      lineHeight: 1,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                </Box>

                {/* Label + bar */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontSize: 13, color: 'var(--text-primary)', mb: 0.5, fontWeight: 500 }}
                    title={typeof label === 'string' && label.length > 60 ? label : undefined}
                  >
                    {typeof label === 'string' && label.length > 48
                      ? label.slice(0, 45) + '...'
                      : label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 5,
                      borderRadius: '999px',
                      bgcolor: 'var(--grey-4)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '999px',
                        bgcolor: 'var(--primary)',
                        opacity: 0.85,
                      },
                    }}
                  />
                </Box>

                {/* Count */}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    flexShrink: 0,
                    ml: 0.5,
                  }}
                >
                  {Number(count).toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
