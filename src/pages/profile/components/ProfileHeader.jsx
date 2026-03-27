import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { getProfileCompletion } from '../utils/profileCompletion';

export default function ProfileHeader() {
  const form = useSelector((state) => state.profile?.form);
  const submitLoading = useSelector((state) => state.profile?.submitLoading);
  const submitError = useSelector((state) => state.profile?.submitError);
  const { percent, sectionsRemaining } = getProfileCompletion(form);
  const showSaved = !submitLoading && !submitError;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography
          component="h1"
          sx={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          Edit Profile
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Keep your profile up to date. Changes are used for ATS matching and resume generation.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        {showSaved && (
          <Typography variant="caption" sx={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Auto-saved
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={percent}
              size={44}
              thickness={4}
              sx={{
                color: 'var(--primary)',
                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
              }}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="span" sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                {percent}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {percent}% Complete
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)' }}>
              {sectionsRemaining === 0 ? 'All sections complete' : `${sectionsRemaining} section${sectionsRemaining !== 1 ? 's' : ''} remaining`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
