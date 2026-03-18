import { Box, Card, Typography, Skeleton } from '@mui/material';

const cardSx = {
  borderRadius: '12px',
  boxShadow: 'var(--dashboard-card-shadow)',
  border: '1px solid var(--border-color)',
  p: 3,
  bgcolor: 'var(--bg-paper)',
  transition: 'box-shadow 0.2s ease, transform 0.18s ease',
  '&:hover': {
    boxShadow: 'var(--dashboard-card-shadow-hover)',
    transform: 'translateY(-1px)',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  accent = false,
  loading = false,
}) {
  return (
    <Card
      sx={{
        ...cardSx,
        ...(accent && { borderTop: '3px solid var(--primary)' }),
      }}
      elevation={0}
    >
      {/* Icon + Label row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, var(--light-blue-bg-08) 0%, var(--light-blue-bg-15) 100%)',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
            }}
          >
            {label}
          </Typography>
        </Box>
        {typeof trend === 'number' && !loading && (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: '999px',
              fontSize: 12,
              fontWeight: 700,
              color: trend >= 0 ? 'var(--success-dark)' : 'var(--error-dark)',
              bgcolor: trend >= 0 ? 'var(--success-bg)' : 'var(--error-bg)',
              flexShrink: 0,
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Box>
        )}
      </Box>

      {/* Value */}
      {loading ? (
        <Skeleton width={80} height={44} sx={{ borderRadius: 1 }} />
      ) : (
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
        </Typography>
      )}

      {/* Sublabel */}
      {sublabel && !loading && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {sublabel}
        </Typography>
      )}
    </Card>
  );
}
