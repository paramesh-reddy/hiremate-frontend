import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--light-blue-bg-08)',
            color: 'var(--primary)',
            mb: 2.5,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Box>
      )}
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          mb: 0.75,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            color: 'var(--text-muted)',
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
