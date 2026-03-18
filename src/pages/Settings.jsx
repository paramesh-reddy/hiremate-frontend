import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  Grid,
  Button,
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PageContainer from '../components/common/PageContainer';

export default function Settings() {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    navigate('/pricing');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account flow with confirmation
    console.log('Delete account clicked');
  };

  return (
    <PageContainer>
      <Typography
        component="h1"
        sx={{
          fontSize: 'var(--font-size-page-title)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          mb: 3,
        }}
      >
        Settings
      </Typography>

      {/* Subscription & Billing */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: 1,
          borderColor: 'var(--border-color)',
          overflow: 'visible',
        }}
      >
        <Grid container sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2,
              }}
            >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <AssignmentRoundedIcon
                sx={{
                  fontSize: 28,
                  color: 'var(--primary)',
                  mt: 0.25,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-section-header)',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    mb: 1,
                  }}
                >
                  Subscription & Billing
                </Typography>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-helper)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    mb: 0.5,
                  }}
                >
                  Credits Available
                </Typography>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-helper)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  5 CV credits, 4 autofill units
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={handleViewPlans}
              sx={{
                bgcolor: 'var(--primary)',
                color: 'var(--white)',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'var(--primary-dark)',
                },
              }}
            >
              View Plans
            </Button>
          </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Danger Zone */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: 1,
          borderColor: 'var(--border-color)',
          overflow: 'visible',
        }}
      >
        <Grid container sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2,
              }}
            >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <WarningAmberRoundedIcon
                sx={{
                  fontSize: 28,
                  color: 'var(--error)',
                  mt: 0.25,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontSize: 'var(--font-size-section-header)',
                    fontWeight: 600,
                    color: 'var(--error)',
                    mb: 2,
                  }}
                >
                  Danger Zone
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 0.5 }}>
                  <PersonOutlineRoundedIcon
                    sx={{
                      fontSize: 20,
                      color: 'var(--text-secondary)',
                      mt: 0.25,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 'var(--font-size-helper)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        mb: 0.5,
                      }}
                    >
                      Delete Account
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 'var(--font-size-helper)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Permanently delete your complete user account and all data
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={handleDeleteAccount}
              sx={{
                bgcolor: 'var(--error)',
                color: 'var(--white)',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'var(--error-dark)',
                },
              }}
            >
              Delete Account
            </Button>
          </Box>
          </Grid>
        </Grid>
      </Card>
    </PageContainer>
  );
}
