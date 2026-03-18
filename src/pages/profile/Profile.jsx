import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Link, Button, Typography, CircularProgress } from '@mui/material';
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
  const location = useLocation();
  const navigate = useNavigate();
  const parsedData = useSelector((state) => state.resume?.parsedData);
  const [activeTab, setActiveTab] = useState(0);
  const fromRegister = location.state?.fromRegister === true;
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
      }}
    >
      {fromRegister && (
        <Box sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/', { replace: true })}
            sx={{
              fontSize: 14,
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            ← Continue to Dashboard
          </Link>
        </Box>
      )}

      <ProfileHeader />

      <ProfileTabs value={activeTab} onChange={handleTabChange}>
        {renderTabPanel(activeTab)}
      </ProfileTabs>

      {/* Save changes bar - visible on all tabs */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          mt: 3,
          py: 2,
          px: { xs: 2, sm: 3, md: 4 },
          mx: { xs: -2, sm: -3, md: -4 },
          bgcolor: 'var(--bg-paper)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          {submitError && (
            <Typography variant="body2" color="error" sx={{ flex: 1, minWidth: 0 }}>
              {typeof submitError === 'object' ? (submitError.message || JSON.stringify(submitError)) : submitError}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={submitLoading ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
          onClick={handleSaveChanges}
          disabled={submitLoading}
          sx={{
            bgcolor: 'var(--primary)',
            '&:hover': { bgcolor: 'var(--primary-dark)' },
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.25,
          }}
        >
          {submitLoading ? 'Saving…' : 'Save changes'}
        </Button>
      </Box>
    </PageContainer>
  );
}
