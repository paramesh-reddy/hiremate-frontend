import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { getProfileCompletion } from '../utils/profileCompletion';
import { INPUT_BORDER_RADIUS } from '../constants';
import { updateProfile } from '../../../store/profile/profileSlice';

export default function ReviewTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const form = useSelector((state) => state.profile?.form);
  const { submitLoading, submitError } = useSelector((state) => state.profile);
  const { percent, sections } = getProfileCompletion(form);

  const handleSubmitProfile = () => {
    dispatch(updateProfile()).then((result) => {
      if (updateProfile.fulfilled.match(result)) navigate('/start', { replace: true });
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Review your profile completeness and fix any missing or weak fields before submitting.
        </Typography>
      </Box>

      {/* Summary preview card */}
      <SectionCard sx={{ mb: 3 }}>
        <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
          Profile Summary
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={percent}
              size={56}
              thickness={4}
              sx={{ color: 'var(--primary)', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
            />
            <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {percent}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              Overall completion
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              Complete all sections for better ATS matching.
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Section checklist */}
      <SectionCard sx={{ mb: 3 }}>
        <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
          Section Checklist
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sections.map((section) => (
            <Box
              key={section.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                px: 1.5,
                borderRadius: INPUT_BORDER_RADIUS,
                bgcolor: section.complete ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
              }}
            >
              {section.complete ? (
                <CheckCircleIcon sx={{ fontSize: 22, color: 'success.main' }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: 'var(--text-muted)' }} />
              )}
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                {section.label}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 12, color: section.complete ? 'success.main' : 'var(--text-secondary)' }}>
                {section.percent}%
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>

      {submitError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {typeof submitError === 'object' ? (submitError.message || JSON.stringify(submitError)) : submitError}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <CustomButton variant="contained" onClick={handleSubmitProfile} disabled={submitLoading} sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}>
          {submitLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Submitting…</span>
            </Box>
          ) : (
            'Generate Resume'
          )}
        </CustomButton>
      </Box>
    </Box>
  );
}
