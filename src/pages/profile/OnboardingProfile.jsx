import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, LinearProgress } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { getProfile } from '../../store/auth/authSlice';
import { fetchProfile, mergeFromResume, updateProfile } from '../../store/profile/profileSlice';
import OnboardingStepper from './components/OnboardingStepper';
import ProfileTab from './tabs/ProfileTab';
import ExperienceTab from './tabs/ExperienceTab';
import EducationTab from './tabs/EducationTab';
import SkillsTab from './tabs/SkillsTab';
import ProjectsTab from './tabs/ProjectsTab';
import PreferencesTab from './tabs/PreferencesTab';
import LinksTab from './tabs/LinksTab';
import logoImg from '../../assets/logo.png';

const STEPS = [
  {
    label: 'Profile',
    description: 'This helps us match you with better opportunities',
    component: ProfileTab,
  },
  {
    label: 'Experience',
    description: 'Add your work history so employers know your background',
    component: ExperienceTab,
  },
  {
    label: 'Education',
    description: 'Share your educational background',
    component: EducationTab,
  },
  {
    label: 'Skills',
    description: 'Highlight the technical and soft skills you bring',
    component: SkillsTab,
  },
  {
    label: 'Projects',
    description: 'Showcase your best work and side projects',
    component: ProjectsTab,
  },
  {
    label: 'Preferences',
    description: 'Tell us what roles and work styles suit you',
    component: PreferencesTab,
  },
  {
    label: 'Links',
    description: 'Connect your LinkedIn, GitHub, and portfolio',
    component: LinksTab,
  },
];

export default function OnboardingProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const submitLoading = useSelector((state) => state.profile?.submitLoading);
  const submitError = useSelector((state) => state.profile?.submitError);
  const parsedData = useSelector((state) => state.resume?.parsedData);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (parsedData) dispatch(mergeFromResume(parsedData));
  }, [parsedData, dispatch]);

  const isLastStep = activeStep === STEPS.length - 1;
  const progressValue = ((activeStep + 1) / STEPS.length) * 100;

  const handleSaveAndContinue = async () => {
    const result = await dispatch(updateProfile());
    if (updateProfile.fulfilled.match(result)) {
      if (isLastStep) {
        navigate('/', { replace: true });
      } else {
        setActiveStep((s) => s + 1);
      }
    }
    // On failure: submitError is set in Redux, shown below the form
  };

  const handleSkip = () => {
    if (isLastStep) {
      navigate('/', { replace: true });
    } else {
      setActiveStep((s) => s + 1);
    }
  };

  const StepComponent = STEPS[activeStep].component;
  const step = STEPS[activeStep];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'var(--bg-default)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'var(--bg-paper)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Box
          sx={{
            maxWidth: 880,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box component="img" src={logoImg} alt="HireMate" sx={{ height: 28, objectFit: 'contain' }} />
          <Typography
            sx={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontFamily: 'var(--font-family)',
            }}
          >
            Step {activeStep + 1} of {STEPS.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 3,
            bgcolor: 'var(--border-color)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'var(--primary)',
              transition: 'transform 0.4s ease',
            },
          }}
        />
      </Box>

      {/* ── Scrollable content ── */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 880,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3 },
          pt: 4,
          pb: 10, // space for sticky bottom bar
        }}
      >
        {/* Stepper */}
        <OnboardingStepper activeStep={activeStep} />

        {/* Step heading */}
        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 22, sm: 28 },
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              mb: 1,
              fontFamily: 'var(--font-family)',
            }}
          >
            {activeStep === 0 ? 'Complete your profile' : step.label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {step.description}
          </Typography>
        </Box>

        {/* Form card */}
        <Box
          sx={{
            bgcolor: 'var(--bg-paper)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            p: { xs: 2, sm: 3 },
          }}
        >
          <StepComponent />
        </Box>

        {/* Error message */}
        {submitError && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, textAlign: 'center', fontSize: 13 }}
          >
            {typeof submitError === 'object'
              ? submitError.message || JSON.stringify(submitError)
              : submitError}
          </Typography>
        )}
      </Box>

      {/* ── Sticky bottom action bar ── */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          bgcolor: 'var(--bg-paper)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.07)',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: 880,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Button
            variant="text"
            onClick={handleSkip}
            disabled={submitLoading}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 14,
              fontFamily: 'var(--font-family)',
              px: 1,
              '&:hover': {
                bgcolor: 'transparent',
                color: 'var(--text-primary)',
                textDecoration: 'underline',
              },
            }}
          >
            {isLastStep ? 'Skip to Dashboard' : 'Skip for now'}
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveAndContinue}
            disabled={submitLoading}
            endIcon={
              submitLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : isLastStep ? (
                <CheckRoundedIcon fontSize="small" />
              ) : (
                <ArrowForwardRoundedIcon fontSize="small" />
              )
            }
            sx={{
              bgcolor: 'var(--primary)',
              '&:hover': { bgcolor: 'var(--primary-dark)' },
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 2.5, sm: 3.5 },
              py: 1.25,
              fontSize: 14,
              fontFamily: 'var(--font-family)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            }}
          >
            {submitLoading ? 'Saving…' : isLastStep ? 'Save & Finish' : 'Save & Continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
