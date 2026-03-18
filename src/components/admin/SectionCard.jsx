import { Box, Card, Typography } from '@mui/material';

const cardSx = {
  borderRadius: '12px',
  boxShadow: 'var(--dashboard-card-shadow)',
  border: '1px solid var(--border-color)',
  p: 3,
  bgcolor: 'var(--bg-paper)',
};

export default function SectionCard({ title, action, children, sx = {} }) {
  return (
    <Card sx={{ ...cardSx, ...sx }} elevation={0}>
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            pb: 2,
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
          {action && (
            <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>
          )}
        </Box>
      )}
      {children}
    </Card>
  );
}
