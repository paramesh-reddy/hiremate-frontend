import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PageContainer from '../../components/common/PageContainer';
import { getProfile } from '../../store/auth/authSlice';
import { fetchProfile, mergeFromResume, updateProfile } from '../../store/profile/profileSlice';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import ProfileTab from './tabs/ProfileTab';
import ExperienceTab from './tabs/ExperienceTab';
import EducationTab from './tabs/EducationTab';
import SkillsTab from './tabs/SkillsTab';
import ProjectsTab from './tabs/ProjectsTab';
import PreferencesTab from './tabs/PreferencesTab';
import LinksTab from './tabs/LinksTab';
import ReviewTab from './tabs/ReviewTab';

export default function Profile() {
  const dispatch = useDispatch();
  const parsedData = useSelector((state) => state.resume?.parsedData);
  const [activeTab, setActiveTab] = useState(0);
  const submitLoading = useSelector((state) => state.profile?.submitLoading);
  const submitError = useSelector((state) => state.profile?.submitError);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (parsedData) dispatch(mergeFromResume(parsedData));
  }, [parsedData, dispatch]);

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const handleSaveChanges = () => {
    dispatch(updateProfile());
  };

  const renderTabPanel = (index) => {
    switch (index) {
      case 0:
        return <ProfileTab />;
      case 1:
        return <ExperienceTab />;
      case 2:
        return <EducationTab />;
      case 3:
        return <SkillsTab />;
      case 4:
        return <ProjectsTab />;
      case 5:
        return <PreferencesTab />;
      case 6:
        return <LinksTab />;
      case 7:
        return <ReviewTab />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'rgba(0,0,0,0.02)',
        minHeight: '100%',
        pb: 12,
      }}
    >
      <ProfileHeader />

      <ProfileTabs value={activeTab} onChange={handleTabChange}>
        {renderTabPanel(activeTab)}
      </ProfileTabs>

      {/* Fixed Save Bar - SaaS Level */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--sidebar-width)',
          right: 0,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
          zIndex: 1100,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: '100%',
            px: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {submitError ? (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {typeof submitError === 'object' ? (submitError.message || JSON.stringify(submitError)) : submitError}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    display: 'inline-block',
                  }}
                />
                Changes saved automatically
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={submitLoading ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={handleSaveChanges}
            disabled={submitLoading}
            sx={{
              bgcolor: 'var(--primary)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              px: 5,
              py: 1.5,
              height: 44,
              borderRadius: 2.5,
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              minWidth: 160,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'var(--primary-dark)',
                boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                bgcolor: 'rgba(37,99,235,0.6)',
                color: '#fff',
                boxShadow: 'none',
              },
            }}
          >
            {submitLoading ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
